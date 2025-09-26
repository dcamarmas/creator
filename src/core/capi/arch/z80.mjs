/**
 *  Copyright 2018-2025 Felix Garcia Carballeira, Alejandro Calderon Mateos,
 *                      Diego Camarmas Alonso, Jorge Ramos Santana
 *
 *  This file is part of CREATOR.
 *
 *  CREATOR is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  CREATOR is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with CREATOR.  If not, see <http://www.gnu.org/licenses/>.
 */

export const keyboardBuffer = [];

function _isEvenParity(value) {
    let v = BigInt(value) & 0xffn;
    v ^= v >> 4n;
    v ^= v >> 2n;
    v ^= v >> 1n;
    return (v & 1n) === 0n;
}
export const Z80 = {
    // Flag bitmasks
    S_FLAG: 0x80n,
    Z_FLAG: 0x40n,
    H_FLAG: 0x10n,
    PV_FLAG: 0x04n,
    N_FLAG: 0x02n,
    C_FLAG: 0x01n,

    borderColor: 0n,
    interruptMode: 0, // Default interrupt mode is 0
    interruptPin: 0, // Default interrupt pin state is low (0)
    timerCounter: 0n,
    /**
     * @property {Object<string, boolean>} keyState
     * @description Holds the current state of the Spectrum keyboard.
     * Keys are identified by their JavaScript event.code string.
     * `true` means the key is currently pressed.
     */
    keyState: {},

    // The ZX Spectrum keyboard matrix layout (obtained from documented disassembly)
    // ; ---------------------------------------------------------------------------
    // ;
    // ;         0     1     2     3     4 -Bits-  4     3     2     1     0
    // ; PORT                                                                    PORT
    // ;
    // ; F7FE  [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]  |  [ 6 ] [ 7 ] [ 8 ] [ 9 ] [ 0 ]   EFFE
    // ;  ^                                   |                                   v
    // ; FBFE  [ Q ] [ W ] [ E ] [ R ] [ T ]  |  [ Y ] [ U ] [ I ] [ O ] [ P ]   DFFE
    // ;  ^                                   |                                   v
    // ; FDFE  [ A ] [ S ] [ D ] [ F ] [ G ]  |  [ H ] [ J ] [ K ] [ L ] [ ENT ] BFFE
    // ;  ^                                   |                                   v
    // ; FEFE  [SHI] [ Z ] [ X ] [ C ] [ V ]  |  [ B ] [ N ] [ M ] [sym] [ SPC ] 7FFE
    // ;  ^     $27                                                 $18           v
    // ; Start                                                                   End
    // ;        00100111                                            00011000
    // ;
    // ; ---------------------------------------------------------------------------

    /**
     * @property {Object<number, string[]>} keyMap
     * @description Maps the high byte of a ULA port address to an array of 5 key codes.
     * The order in the array corresponds to bits 0 through 4.
     * The key codes are JavaScript `event.code` strings.
     */
    keyMap: {
        0xF7: ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5'],
        0xFB: ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT'],
        0xFD: ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG'],
        0xFE: ['ShiftLeft', 'KeyZ', 'KeyX', 'KeyC', 'KeyV'],
        // These are the other way around (look at the diagram above)
        0xEF: ['Digit0', 'Digit9', 'Digit8', 'Digit7', 'Digit6'],
        0xDF: ['KeyP', 'KeyO', 'KeyI', 'KeyU', 'KeyY'],
        0xBF: ['Enter', 'KeyL', 'KeyK', 'KeyJ', 'KeyH'],
        0x7F: ['Space', 'ShiftRight', 'KeyM', 'KeyN', 'KeyB'],
    },

    /**
     * Registers a key as being pressed.
     * @param {string} code - The `event.code` of the key that was pressed.
     */
    pressKey(code) {
        this.keyState[code] = true;
    },

    /**
     * Registers a key as being released.
     * @param {string} code - The `event.code` of the key that was released.
     */
    releaseKey(code) {
        this.keyState[code] = false;
    },

    /**
     * Calculates flags for an 8-bit INC operation.
     * @param {BigInt} oldValue - The 8-bit value before incrementing.
     * @param {BigInt} initialF - The current value of the F register.
     * @returns {BigInt} The new 8-bit flag register value.
     */
    calculateFlags_INC(oldValue, initialF) {
        const newValue = (oldValue + 1n) & 0xffn;
        let newF = initialF & this.C_FLAG; // Preserve the C flag

        if (newValue & this.S_FLAG) newF |= this.S_FLAG;
        if (newValue === 0n) newF |= this.Z_FLAG;
        if ((oldValue & 0x0fn) === 0x0fn) newF |= this.H_FLAG;
        if (oldValue === 0x7fn) newF |= this.PV_FLAG; // Overflow 7Fh -> 80h
        // N is reset
        return newF;
    },

    /**
     * Calculates flags for an 8-bit DEC operation.
     * @param {BigInt} oldValue - The 8-bit value before decrementing.
     * @param {BigInt} initialF - The current value of the F register.
     * @returns {BigInt} The new 8-bit flag register value.
     */
    calculateFlags_DEC(oldValue, initialF) {
        const newValue = (oldValue - 1n) & 0xffn;
        let newF = (initialF & this.C_FLAG) | this.N_FLAG; // Preserve C, set N

        if (newValue & this.S_FLAG) newF |= this.S_FLAG;
        if (newValue === 0n) newF |= this.Z_FLAG;
        if ((oldValue & 0x0fn) === 0n) newF |= this.H_FLAG; // Borrow from bit 4
        if (oldValue === 0x80n) newF |= this.PV_FLAG; // Overflow 80h -> 7Fh
        return newF;
    },

    /**
     * Calculates flags for 8-bit addition (ADD).
     * @param {BigInt} val1 - The first operand.
     * @param {BigInt} val2 - The second operand.
     * @returns {BigInt} The new 8-bit flag register value.
     */
    calculateFlags_ADD(val1, val2) {
        const result = val1 + val2;
        const resultByte = result & 0xffn;
        let newF = 0n;

        if (resultByte & this.S_FLAG) newF |= this.S_FLAG;
        if (resultByte === 0n) newF |= this.Z_FLAG;
        if ((val1 & 0xfn) + (val2 & 0xfn) > 0xfn) newF |= this.H_FLAG;
        if (~(val1 ^ val2) & (val1 ^ result) & 0x80n) newF |= this.PV_FLAG;
        if (result > 0xffn) newF |= this.C_FLAG;
        return newF;
    },

    /**
     * Calculates flags for 8-bit addition with carry (ADC).
     * @param {BigInt} val1 - The first operand.
     * @param {BigInt} val2 - The second operand.
     * @param {BigInt} initialF - The current value of the F register.
     * @returns {BigInt} The new 8-bit flag register value.
     */
    calculateFlags_ADC(val1, val2, initialF) {
        const carry = initialF & this.C_FLAG;
        const result = val1 + val2 + carry;
        const resultByte = result & 0xffn;
        let newF = 0n;

        if (resultByte & this.S_FLAG) newF |= this.S_FLAG;
        if (resultByte === 0n) newF |= this.Z_FLAG;
        if ((val1 & 0xfn) + (val2 & 0xfn) + carry > 0xfn) newF |= this.H_FLAG;
        if (~(val1 ^ val2) & (val1 ^ result) & 0x80n) newF |= this.PV_FLAG;
        if (result > 0xffn) newF |= this.C_FLAG;
        return newF;
    },

    /**
     * Calculates flags for 8-bit subtraction (SUB).
     * @param {BigInt} val1 - The first operand (minuend).
     * @param {BigInt} val2 - The second operand (subtrahend).
     * @returns {BigInt} The new 8-bit flag register value.
     */
    calculateFlags_SUB(val1, val2) {
        const result = val1 - val2;
        const resultByte = result & 0xffn;
        let newF = this.N_FLAG; // N is always set for subtraction

        if (resultByte & this.S_FLAG) newF |= this.S_FLAG;
        if (resultByte === 0n) newF |= this.Z_FLAG;
        if ((val1 & 0xfn) < (val2 & 0xfn)) newF |= this.H_FLAG; // Half-borrow
        if ((val1 ^ val2) & (val1 ^ result) & 0x80n) newF |= this.PV_FLAG; // Overflow
        if (result < 0n) newF |= this.C_FLAG; // Borrow
        return newF;
    },

    /**
     * Calculates flags for 8-bit subtraction with carry (SBC).
     * @param {BigInt} val1 - The first operand (minuend).
     * @param {BigInt} val2 - The second operand (subtrahend).
     * @param {BigInt} initialF - The current value of the F register.
     * @returns {BigInt} The new 8-bit flag register value.
     */
    calculateFlags_SBC(val1, val2, initialF) {
        const carry = initialF & this.C_FLAG;
        const result = val1 - val2 - carry;
        const resultByte = result & 0xffn;
        let newF = this.N_FLAG; // N is always set for subtraction

        if (resultByte & this.S_FLAG) newF |= this.S_FLAG;
        if (resultByte === 0n) newF |= this.Z_FLAG;
        if ((val1 & 0xfn) < (val2 & 0xfn) + carry) newF |= this.H_FLAG; // Half-borrow
        if ((val1 ^ val2) & (val1 ^ result) & 0x80n) newF |= this.PV_FLAG; // Overflow
        if (result < 0n) newF |= this.C_FLAG; // Borrow
        return newF;
    },

    /**
     * Calculates flags for logical operations (AND, OR, XOR).
     * @param {BigInt} result - The 8-bit result of the operation.
     * @param {number} setH - 1 to set the H flag (for AND), 0 to reset it (for OR/XOR).
     * @returns {BigInt} The new 8-bit flag register value.
     */
    calculateFlags_LOGICAL(result, setH) {
        let newF = 0n;
        if (result & this.S_FLAG) newF |= this.S_FLAG;
        if (result === 0n) newF |= this.Z_FLAG;
        if (setH === 1) newF |= this.H_FLAG; // Set H for AND
        if (_isEvenParity(result)) newF |= this.PV_FLAG;
        // N and C are always reset for logical operations
        return newF;
    },

    /**
     * Calculates flags for the compare (CP) operation.
     * @param {BigInt} val1 - The accumulator value.
     * @param {BigInt} val2 - The value to compare against.
     * @returns {BigInt} The new 8-bit flag register value.
     */
    calculateFlags_CP(val1, val2) {
        // CP is a subtraction for flag purposes, but doesn't store the result.
        return this.calculateFlags_SUB(val1, val2);
    },

    /**
     * Calculates flags for 16-bit addition (ADD HL, rr).
     * @param {BigInt} val1 - The first 16-bit operand.
     * @param {BigInt} val2 - The second 16-bit operand.
     * @param {BigInt} initialF - The current value of the F register.
     * @returns {BigInt} The new 8-bit flag register value.
     */
    calculateFlags_ADD16(val1, val2, initialF) {
        const result = val1 + val2;
        // Preserve S, Z, P/V flags
        let newF = initialF & (this.S_FLAG | this.Z_FLAG | this.PV_FLAG);

        // N is reset
        if ((val1 & 0x0fffn) + (val2 & 0x0fffn) > 0x0fffn) newF |= this.H_FLAG;
        if (result > 0xffffn) newF |= this.C_FLAG;

        return newF;
    },

    /**
     * Calculates flags for 16-bit subtraction with carry (SBC HL, rr).
     * @param {BigInt} val1 - The first 16-bit operand (minuend, e.g., HL).
     * @param {BigInt} val2 - The second 16-bit operand (subtrahend, e.g., BC).
     * @param {BigInt} initialF - The current value of the F register to get the carry from.
     * @returns {BigInt} The new 8-bit flag register value.
     */
    calculateFlags_SBC16(val1, val2, initialF) {
        // Get the current carry flag value (1n if set, 0n otherwise)
        const carry = initialF & this.C_FLAG;

        // Perform the full subtraction to use for overflow and carry checks
        const result = val1 - val2 - carry;
        const resultWord = result & 0xffffn;

        // Start with the N flag set, as this is a subtraction
        let newF = this.N_FLAG;

        // S (Sign) flag is set if the result is negative (bit 15 is 1)
        if (resultWord & 0x8000n) {
            newF |= this.S_FLAG;
        }

        // Z (Zero) flag is set if the 16-bit result is 0
        if (resultWord === 0n) {
            newF |= this.Z_FLAG;
        }

        // H (Half Carry/Borrow) flag is set if there was a borrow from bit 12
        if ((val1 & 0x0fffn) < (val2 & 0x0fffn) + carry) {
            newF |= this.H_FLAG;
        }

        // P/V (Overflow) flag detects 2's complement overflow.
        // This occurs if the signs of the operands were different AND the sign
        // of the result is different from the sign of the first operand (val1).
        if ((val1 ^ val2) & (val1 ^ resultWord) & 0x8000n) {
            newF |= this.PV_FLAG;
        }

        // C (Carry/Borrow) flag is set if the unmasked result was negative.
        if (result < 0n) {
            newF |= this.C_FLAG;
        }

        return newF;
    },

    /**
     * Calculates flags for the BIT instruction.
     * @param {BigInt} value - The value of the byte being tested.
     * @param {number} bit - The bit number to test (0-7).
     * @param {BigInt} initialF - The current value of the F register.
     * @returns {BigInt} The new 8-bit flag register value.
     */
    calculateFlags_BIT(value, bit, initialF) {
        let newF = initialF & this.C_FLAG; // Only C is unaffected

        const bitIsZero = !((value >> BigInt(bit)) & 1n);

        if (bitIsZero) {
            newF |= this.Z_FLAG;
            newF |= this.PV_FLAG; // P/V is set when Z is set
        }

        if (bit === 7 && !bitIsZero) {
            newF |= this.S_FLAG; // S is set if bit 7 is 1
        }

        newF |= this.H_FLAG; // H is always set
        // N is always reset

        return newF;
    },

    /**
     * Calculates flags for rotate and shift instructions (e.g., RLC, RRC, SLA).
     * @param {BigInt} result - The 8-bit result of the operation.
     * @param {BigInt} carry - The new value for the Carry flag (0n or 1n).
     * @returns {BigInt} The new 8-bit flag register value.
     */
    calculateFlags_ROTATE(result, carry) {
        let newF = 0n;

        // S is set if result is negative
        if (result & this.S_FLAG) {
            newF |= this.S_FLAG;
        }

        // Z is set if result is 0
        if (result === 0n) {
            newF |= this.Z_FLAG;
        }

        // H and N are always reset for these operations
        
        // P/V is set for even parity
        if (_isEvenParity(result)) {
            newF |= this.PV_FLAG;
        }

        // C is set from the bit that was shifted out
        if (carry) { // carry is expected to be 1n or 0n
            newF |= this.C_FLAG;
        }
        
        return newF;
    },

    /**
     * Calculates flags for the SRL (Shift Right Logical) instruction.
     * @param {BigInt} result - The 8-bit result of the operation.
     * @param {BigInt} carry - The new value for the Carry flag (0n or 1n), from the original bit 0.
     * @returns {BigInt} The new 8-bit flag register value.
     */
    calculateFlags_SRL(result, carry) {
        let newF = 0n;

        // S, H, N are always reset for SRL.

        // Z is set if result is 0
        if (result === 0n) {
            newF |= this.Z_FLAG;
        }

        // P/V is set for even parity
        if (_isEvenParity(result)) {
            newF |= this.PV_FLAG;
        }

        // C is set from the bit that was shifted out (original bit 0)
        if (carry) { // carry is expected to be 1n or 0n
            newF |= this.C_FLAG;
        }
        
        return newF;
    },

    /**
     * Emulates a read from the ULA, specifically handling the keyboard matrix.
     * It checks the high byte of the port to determine which half-row of keys
     * to poll and returns a byte representing their state.
     * @param {BigInt} port - The full 16-bit port address from the IN instruction.
     * @returns {BigInt} The 8-bit value from the ULA. Bits 0-4 are key states,
     *                   and bits 5-7 are typically high (1).
     */
    readULAKeyboard(port) {
        const highByte = Number(port >> 8n);
        const halfRow = this.keyMap[highByte];

        // Start with all 5 key bits high (1), meaning no keys pressed.
        let result = 0x1Fn;

        if (halfRow) {
            // If the high byte corresponds to a valid half-row, check each key.
            for (let i = 0; i < 5; i++) {
                const keyCode = halfRow[i];
                // If the key is pressed (true in keyState), set its bit to 0.
                if (this.keyState[keyCode]) {
                    result &= ~(1n << BigInt(i));
                }
            }
        }

        // The ULA keyboard bits are D0-D4. Bits D5-D7 are typically high (1).
        return result | 0xE0n;
    },

    /**
     * Reads a byte from an I/O port.
     * Implements the non-blocking read from the keyboard buffer.
     * @param {BigInt} port - The port address.
     * @returns {BigInt} The 8-bit value read from the port.
     */
    read(port) {
        const portNum = Number(port);
        if (portNum === 0x01) {
            // Keyboard Port
            if (keyboardBuffer.length > 0) {
                return keyboardBuffer.shift();
            }
            // Return 0 if no key is available.
            return 0n;
        } else if (this.keyMap[portNum >> 8]) {
            // ZX Spectrum ULA port.
            return this.readULAKeyboard(port);
        }
        // For unhandled ports, return 0xFF (all bits high).
        return 0xFFn;
    },

    /**
     * Writes a byte to an I/O port.
     * @param {BigInt} port - The port address.
     * @param {BigInt} value - The 8-bit value to write.
     */
    write(port, value) {
        const portNum = Number(port);

        if (portNum === 0x02) {
            // Screen Port
            const valNum = Number(value);
            process.stdout.write(Buffer.from([valNum]));
        } else if (portNum === 0xfe) {
            // ZX Spectrum ULA port.
            // Bits 0-2 (the lower 3 bits) of the written value set the border color.
            this.borderColor = value & 0x07n;
        }
    },
};