/*
 *  Copyright 2018-2025 Felix Garcia Carballeira, Alejandro Calderon Mateos, Diego Camarmas Alonso
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
"use strict";

function isInt(val, bits) {
    const max = (1n << BigInt(bits - 1)) - 1n;
    const min = -(1n << BigInt(bits - 1));
    return BigInt(val) >= min && BigInt(val) <= max;
}

function signExtend(val, bits) {
    const mask = (1n << BigInt(bits)) - 1n;
    const signBit = 1n << (BigInt(bits) - 1n);
    const value = BigInt(val) & mask;
    return value & signBit ? value | ~mask : value;
}

function countTrailingZeros(val) {
    if (val === 0n) return 64;

    let count = 0;
    let value = BigInt(val);
    while ((value & 1n) === 0n) {
        count++;
        value >>= 1n;
    }
    return count;
}

function generateInstructionsImpl(value, instructions, destReg) {
    // Handle 32-bit values with LUI+ADDI sequence
    if (isInt(value, 32)) {
        const hi20 = Number(((value + 0x800n) >> 12n) & 0xfffffn);
        const lo12 = Number(signExtend(value, 12));

        if (hi20) {
            instructions.push(`lui ${destReg}, 0x${hi20.toString(16)}`);
        }

        if (lo12 || hi20 === 0) {
            const op = hi20 ? "addiw" : "addi";
            const src = hi20 ? destReg : "x0";
            instructions.push(`${op} ${destReg}, ${src}, ${lo12}`);
        }
        return;
    }

    // Handle larger values (RV64)
    const lo12 = Number(signExtend(value, 12));
    let remainingValue = value - BigInt(lo12);

    // Check if shifting can simplify the representation
    let shift = 0;
    if (!isInt(remainingValue, 32)) {
        shift = countTrailingZeros(remainingValue);

        // Handle case where shift would be 64 or greater (invalid for RISC-V slli)
        if (shift >= 64) {
            // If shift is 64+, remainingValue shifted right by 64+ bits is 0 in 64-bit arithmetic
            // So we only need to handle the lo12 part directly
            if (lo12) {
                instructions.push(`addi ${destReg}, x0, ${lo12}`);
            } else {
                instructions.push(`addi ${destReg}, x0, 0`); // Zero out register
            }
            return; // Exit early as we've handled the value directly
        }

        remainingValue >>= BigInt(shift);
    }

    // Process the remaining value recursively
    generateInstructionsImpl(remainingValue, instructions, destReg);

    // Apply shift if needed
    if (shift) {
        instructions.push(`slli ${destReg}, ${destReg}, ${shift}`);
    }

    // Add lower 12 bits if needed
    if (lo12) {
        instructions.push(`addi ${destReg}, ${destReg}, ${lo12}`);
    }
}

export const CAPI_RISCV = {
    rv_generateLoadImmediate: function (val, destReg) {
        const instructions = [];
        generateInstructionsImpl(BigInt(val), instructions, destReg);
        return instructions.join(";");
    },
};

// testing
// const instructions = CAPI_RISCV.rv_generateLoadImmediate(0xffffffffffffffffn);
// console.log(instructions);
