import { crex_findReg } from "../register/registerLookup.mjs";
import { packExecute } from "../utils/utils.mjs";
import {
    readRegister,
    writeRegister,
} from "../register/registerOperations.mjs";
import { ARCH as RISCV } from "@/core/capi/arch/riscv.mjs";
import { REGISTERS, main_memory, status } from "../core.mjs";
import {
    display_print,
    keyboard_read_find,
    kbd_read_string,
    keyboard_parseInt,
    keyboard_read,
    kbd_read_char,
    keyboard_read_until,
} from "../executor/IO.mjs";
import { pinStates, esp32vect } from "./pinstates.mts";
import { Memory } from "../memory/Memory.mts";
import { coreEvents } from "@/core/events.mts";
import { ref } from "vue";

/*
 *  CREATOR instruction description API:
 *  CREATino functions module
 */
//Variables
let serial_begin = 0; // TODO: Which baud rate can we accept?
let initArduino = 0; // Flag to check if initArduino has been called
let _seed = 1;
// let traces = new ArduinoTerminal();

//Functions
export function cr_initArduino() {
    console.log("cr_initArduino called");
    if (initArduino === 0) {
        initArduino = 1;
        console.log("initArduino: " + initArduino);
    }
    coreEvents.emit("arduino-terminal-write", { text: "initArduino()" });
}
export function cr_digitalRead() {
    console.log("cr_digitalRead called");
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_arduino: register a0 not found",
            "danger",
            null,
        );
    }
    var pin = BigInt.asIntN(32, readRegister(ret1.indexComp, ret1.indexElem));
    //Read from simulator
    const pinName = `GPIO${pin}`;
    const rawValue = pinStates.value[pinName] ?? 0;
    const value = rawValue !== 0 ? 1 : 0;
    writeRegister(BigInt(value), ret1.indexComp, ret1.indexElem);
    coreEvents.emit("arduino-terminal-write", {
        text: `digitalRead(${pin}) = ${value}`,
    });
}
export function cr_pinMode() {
    console.log("cr_pinMode called");
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_arduino: register a0 not found",
            "danger",
            null,
        );
    }
    var pin = BigInt.asIntN(32, readRegister(ret1.indexComp, ret1.indexElem));
    var ret2 = crex_findReg("a1");
    if (ret2.match === 0) {
        throw packExecute(
            true,
            "capi_arduino: register a1 not found",
            "danger",
            null,
        );
    }
    var mode = BigInt.asIntN(32, readRegister(ret2.indexComp, ret2.indexElem));
    coreEvents.emit("arduino-terminal-write", {
        text: `pinMode(${pin},${mode})`,
    });
    coreEvents.emit("arduino-pin-mode", {
        pin: Number(pin),
        mode: Number(mode),
    });
}
export function cr_digitalWrite() {
    console.log("cr_digitalWrite called");
    // Indicate in terminal
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_arduino: register a0 not found",
            "danger",
            null,
        );
    }
    var pin = BigInt.asIntN(32, readRegister(ret1.indexComp, ret1.indexElem));

    var ret2 = crex_findReg("a1");
    if (ret2.match === 0) {
        throw packExecute(
            true,
            "capi_arduino: register a1 not found",
            "danger",
            null,
        );
    }
    var rawValue = BigInt.asIntN(
        32,
        readRegister(ret2.indexComp, ret2.indexElem),
    );
    var value = rawValue !== 0n ? 1 : 0;
    coreEvents.emit("arduino-terminal-write", {
        text: `digitalWrite(${pin}, ${value})`,
    });
    coreEvents.emit("arduino-pin-write", {
        pin: Number(pin),
        value: Number(value),
    });
}
export function cr_analogRead() {
    console.log("cr_analogRead called");
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_arduino: register a0 not found",
            "danger",
            null,
        );
    }
    var pin = BigInt.asIntN(32, readRegister(ret1.indexComp, ret1.indexElem));
    //Read from simulator
    const pinName = `GPIO${pin}`;
    const value = pinStates.value[pinName] ?? 0;
    writeRegister(BigInt(value), ret1.indexComp, ret1.indexElem);
    coreEvents.emit("arduino-terminal-write", {
        text: `analogRead(${pin}) = ${value}`,
    });
}
export function cr_analogReadResolution() {
    console.log("cr_analogReadResolution called");
}
export function cr_analogWrite() {
    console.log("cr_analogWrite called");
    // Indicate in terminal
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_arduino: register a0 not found",
            "danger",
            null,
        );
    }
    var pin = BigInt.asIntN(32, readRegister(ret1.indexComp, ret1.indexElem));

    var ret2 = crex_findReg("a1");
    if (ret2.match === 0) {
        throw packExecute(
            true,
            "capi_arduino: register a1 not found",
            "danger",
            null,
        );
    }
    var value = BigInt.asIntN(32, readRegister(ret2.indexComp, ret2.indexElem));
    coreEvents.emit("arduino-terminal-write", {
        text: `analogWrite(${pin}, ${value})`,
    });
    coreEvents.emit("arduino-pin-write", {
        pin: Number(pin),
        value: Number(value),
    });
}
export function cr_map() {
    console.log("cr_map called");
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_arduino: register a0 not found",
            "danger",
            null,
        );
    }
    var value = BigInt.asIntN(32, readRegister(ret1.indexComp, ret1.indexElem));
    //fromLow the lower bound of the value’s current range.
    var ret2 = crex_findReg("a1");
    if (ret2.match === 0) {
        throw packExecute(
            true,
            "capi_arduino: register a1 not found",
            "danger",
            null,
        );
    }
    var fromLow = BigInt.asIntN(
        32,
        readRegister(ret2.indexComp, ret2.indexElem),
    );
    //fromHigh the upper bound of the value’s current range.
    var ret3 = crex_findReg("a2");
    if (ret3.match === 0) {
        throw packExecute(
            true,
            "capi_arduino: register a2 not found",
            "danger",
            null,
        );
    }
    var fromHigh = BigInt.asIntN(
        32,
        readRegister(ret3.indexComp, ret3.indexElem),
    );
    //toLow the lower bound of the value’s target range.
    var ret4 = crex_findReg("a3");
    if (ret4.match === 0) {
        throw packExecute(
            true,
            "capi_arduino: register a3 not found",
            "danger",
            null,
        );
    }
    var toLow = BigInt.asIntN(32, readRegister(ret4.indexComp, ret4.indexElem));
    //toHigh the upper bound of the value’s target range.
    var ret5 = crex_findReg("a4");
    if (ret5.match === 0) {
        throw packExecute(
            true,
            "capi_arduino: register a4 not found",
            "danger",
            null,
        );
    }
    var toHigh = BigInt.asIntN(
        32,
        readRegister(ret5.indexComp, ret5.indexElem),
    );
    const mappedValue =
        ((value - fromLow) * (toHigh - toLow)) / (fromHigh - fromLow) + toLow;
    console.log(mappedValue);
    writeRegister(mappedValue, ret1.indexComp, ret1.indexElem);
    coreEvents.emit("arduino-terminal-write", {
        text: `map(${value}, ${fromLow}, ${fromHigh}, ${toLow}, ${toHigh})`,
    });
}
export function cr_constrain() {
    console.log("cr_constrain called");
    // Value to constrain
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_arduino: register a0 not found",
            "danger",
            null,
        );
    }
    var value = BigInt.asIntN(32, readRegister(ret1.indexComp, ret1.indexElem));
    //lower end
    var ret2 = crex_findReg("a1");
    if (ret2.match === 0) {
        throw packExecute(
            true,
            "capi_arduino: register a1 not found",
            "danger",
            null,
        );
    }
    var lower = BigInt.asIntN(32, readRegister(ret2.indexComp, ret2.indexElem));
    //upper end
    var ret3 = crex_findReg("a2");
    if (ret3.match === 0) {
        throw packExecute(
            true,
            "capi_arduino: register a2 not found",
            "danger",
            null,
        );
    }
    var upper = BigInt.asIntN(32, readRegister(ret3.indexComp, ret3.indexElem));

    // Always a int cause we use a0
    var constrained = Math.max(
        Number(lower),
        Math.min(Number(value), Number(upper)),
    );
    console.log(BigInt(constrained));
    writeRegister(BigInt(constrained), ret1.indexComp, ret1.indexElem);
    coreEvents.emit("arduino-terminal-write", {
        text: `constrain(${value}, ${lower}, ${upper})`,
    });
}
export function cr_abs() {
    console.log("cr_abs called");
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a0 not found",
            "danger",
            null,
        );
    }
    var value = BigInt.asIntN(32, readRegister(ret1.indexComp, ret1.indexElem));
    console.log("abs: value = " + value);
    // Calculate the absolute value
    value = value > 0 ? value : -value;
    writeRegister(BigInt(value), ret1.indexComp, ret1.indexElem);
    coreEvents.emit("arduino-terminal-write", { text: `abs(${value})` });
}
export function cr_max() {
    //Var 1: Expected always an int32
    console.log("cr_max called");
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a0 not found",
            "danger",
            null,
        );
    }
    var value1 = BigInt.asIntN(
        32,
        readRegister(ret1.indexComp, ret1.indexElem),
    );
    // Var2: Expected always an int32
    var ret2 = crex_findReg("a1");
    if (ret2.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a0 not found",
            "danger",
            null,
        );
    }
    var value2 = BigInt.asIntN(
        32,
        readRegister(ret2.indexComp, ret2.indexElem),
    );
    // Find the maximum value
    const max = value1 > value2 ? value1 : value2;
    console.log(max);
    writeRegister(BigInt(max), ret1.indexComp, ret1.indexElem);
    coreEvents.emit("arduino-terminal-write", {
        text: `max(${value1}, ${value2})`,
    });
}
export function cr_min() {
    console.log("cr_min called");
    //Var 1: Expected always an int32
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a0 not found",
            "danger",
            null,
        );
    }
    var value1 = BigInt.asIntN(
        32,
        readRegister(ret1.indexComp, ret1.indexElem),
    );
    //Var 2: Expected always an int32
    var ret2 = crex_findReg("a1");
    if (ret2.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a0 not found",
            "danger",
            null,
        );
    }
    var value2 = BigInt.asIntN(
        32,
        readRegister(ret2.indexComp, ret2.indexElem),
    );
    // Find the minimun value
    const min = value1 < value2 ? value1 : value2;
    console.log(min);
    writeRegister(BigInt(min), ret1.indexComp, ret1.indexElem);
    coreEvents.emit("arduino-terminal-write", {
        text: `min(${value1}, ${value2})`,
    });
}
export function cr_pow() {
    console.log("cr_pow called");
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a0 not found",
            "danger",
            null,
        );
    }
    var value1 = BigInt.asIntN(
        32,
        readRegister(ret1.indexComp, ret1.indexElem),
    );
    //Var 2: Expected always an int32
    var ret2 = crex_findReg("a1");
    if (ret2.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a0 not found",
            "danger",
            null,
        );
    }
    var value2 = BigInt.asIntN(
        32,
        readRegister(ret2.indexComp, ret2.indexElem),
    );
    const pow = Math.pow(Number(value1), Number(value2));
    writeRegister(BigInt(pow), ret1.indexComp, ret1.indexElem);
    coreEvents.emit("arduino-terminal-write", {
        text: `pow(${value1}, ${value2})`,
    });
}
export function cr_bit() {
    console.log("cr_bit called");
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a0 not found",
            "danger",
            null,
        );
    }
    var value1 = BigInt.asUintN(
        32,
        readRegister(ret1.indexComp, ret1.indexElem),
    ); //bit functions in arduino work with uint8_t numbers
    var res = 0n;
    if (value1 < 0n || value1 > 31n) {
        res = 0n; // Invalid bit position
    } else {
        res = 1n << value1; // Calculate the bit value
    }
    console.log(res);
    writeRegister(BigInt(res), ret1.indexComp, ret1.indexElem);
    coreEvents.emit("arduino-terminal-write", { text: `bit(${value1})` });
}
export function cr_bitClear() {
    console.log("cr_bitClear called");
    //Numeric variable whose bit to clear
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a0 not found",
            "danger",
            null,
        );
    }
    var value1 = BigInt.asUintN(
        32,
        readRegister(ret1.indexComp, ret1.indexElem),
    ); //bit functions in arduino work with uint8_t numbers
    var res = 0n;
    //Bit to clear, starting 0 for least-significant
    var ret2 = crex_findReg("a1");
    if (ret2.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a0 not found",
            "danger",
            null,
        );
    }
    var value2 = BigInt.asUintN(
        32,
        readRegister(ret2.indexComp, ret2.indexElem),
    );
    if (value2 < 0n || value2 > 31n) {
        res = value1; // Invalid bit position, return original value
    } else {
        res = value1 & ~(1n << value2); // Clear the specified bit
    }
    console.log(res);
    writeRegister(BigInt(res), ret1.indexComp, ret1.indexElem);
    coreEvents.emit("arduino-terminal-write", {
        text: `bitClear(${value1}, ${value2})`,
    });
}
export function cr_bitRead() {
    console.log("cr_bitRead called");
    //Numeric variable whose bit to read
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a0 not found",
            "danger",
            null,
        );
    }
    var value1 = BigInt.asUintN(
        32,
        readRegister(ret1.indexComp, ret1.indexElem),
    ); //bit functions in arduino work with uint8_t numbers
    var res = 0n;
    //Bit to read, starting 0 for least-significant
    var ret2 = crex_findReg("a1");
    if (ret2.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a0 not found",
            "danger",
            null,
        );
    }
    var value2 = BigInt.asUintN(
        32,
        readRegister(ret2.indexComp, ret2.indexElem),
    );
    if (value2 < 0n || value2 > 31n) {
        res = 0n; // Invalid bit position, return 0
    } else {
        res = (value1 & (1n << value2)) !== 0n ? 1n : 0n; // Read the specified bit
    }
    console.log(res);
    writeRegister(BigInt(res), ret1.indexComp, ret1.indexElem);
    coreEvents.emit("arduino-terminal-write", {
        text: `bitRead(${value1}, ${value2})`,
    });
}
export function cr_bitSet() {
    console.log("cr_bitSet called");
    //Numeric variable whose bit to set
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a0 not found",
            "danger",
            null,
        );
    }
    var value1 = BigInt.asUintN(
        32,
        readRegister(ret1.indexComp, ret1.indexElem),
    ); //bit functions in arduino work with uint8_t numbers
    var res = 0n;
    //Bit to set, starting 0 for least-significant
    var ret2 = crex_findReg("a1");
    if (ret2.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a0 not found",
            "danger",
            null,
        );
    }
    var value2 = BigInt.asUintN(
        32,
        readRegister(ret2.indexComp, ret2.indexElem),
    );
    if (value2 < 0n || value2 > 31n) {
        res = 0n; // Invalid bit position, return 0
    } else {
        res = value1 | (1n << value2); // Set the specified bit
    }
    console.log(res);
    writeRegister(BigInt(res), ret1.indexComp, ret1.indexElem);
    coreEvents.emit("arduino-terminal-write", {
        text: `bitSet(${value1}, ${value2})`,
    });
}
export function cr_bitWrite() {
    console.log("cr_bitWrite called");
    //Numeric variable whose bit to write
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a0 not found",
            "danger",
            null,
        );
    }
    var value1 = BigInt.asUintN(
        32,
        readRegister(ret1.indexComp, ret1.indexElem),
    ); //bit functions in arduino work with uint8_t numbers
    var res = 0n;
    //Bit to write, starting 0 for least-significant
    var ret2 = crex_findReg("a1");
    if (ret2.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a0 not found",
            "danger",
            null,
        );
    }
    var value2 = BigInt.asUintN(
        32,
        readRegister(ret2.indexComp, ret2.indexElem),
    );
    //console.log(value2);
    // Value to write
    var ret3 = crex_findReg("a2");
    if (ret3.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a0 not found",
            "danger",
            null,
        );
    }
    var value3 = BigInt.asUintN(
        32,
        readRegister(ret3.indexComp, ret3.indexElem),
    );
    console.log(value3);

    if (value2 < 0n || value2 > 31n) {
        res = value1; // Invalid bit position, return original value
    } else {
        if (value3 == 0n) {
            res = value1 & ~(1n << value2); // Clear the specified bit
        } else if (value3 == 1n) {
            res = value1 | (1n << value2); // Set the specified bit
        } else {
            throw packExecute(
                true,
                "capi_syscall: invalid value for bitWrite",
                "danger",
                null,
            );
        }
    }
    console.log(res);
    writeRegister(BigInt(res), ret1.indexComp, ret1.indexElem);
    coreEvents.emit("arduino-terminal-write", {
        text: `bitWrite(${value1}, ${value2}, ${value3})`,
    });
}
export function cr_highByte() {
    console.log("cr_highByte called");
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a0 not found",
            "danger",
            null,
        );
    }
    var value1 = BigInt.asUintN(
        32,
        readRegister(ret1.indexComp, ret1.indexElem),
    ); //bit functions in arduino work with uint8_t numbers
    var res = 0n;
    res = (value1 >> 8n) & 0xffn; // Get the high byte
    console.log(res);
    writeRegister(BigInt(res), ret1.indexComp, ret1.indexElem);
    coreEvents.emit("arduino-terminal-write", { text: `highByte(${value1})` });
}
export function cr_lowByte() {
    console.log("cr_lowByte called");
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a0 not found",
            "danger",
            null,
        );
    }
    var value1 = BigInt.asUintN(
        32,
        readRegister(ret1.indexComp, ret1.indexElem),
    ); //bit functions in arduino work with uint8_t numbers
    let res = value1 & 0xffn; // Get the low byte
    console.log(res);
    writeRegister(BigInt(res), ret1.indexComp, ret1.indexElem);
    coreEvents.emit("arduino-terminal-write", { text: `lowByte(${value1})` });
}
export function cr_attachInterrupt() {
    console.log("cr_attachInterrupt called");
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a0 not found",
            "danger",
            null,
        );
    }
    var interr_pos = BigInt.asIntN(
        32,
        readRegister(ret1.indexComp, ret1.indexElem),
    );
    var ret2 = crex_findReg("a1");
    if (ret2.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a1 not found",
            "danger",
            null,
        );
    }
    var interr_isr = BigInt.asIntN(
        32,
        readRegister(ret2.indexComp, ret2.indexElem),
    );
    esp32vect.value[Number(interr_pos)]![1] = interr_isr;
    //TODO: Modes
    var ret3 = crex_findReg("a2");
    if (ret3.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a2 not found",
            "danger",
            null,
        );
    }
    var mode =  BigInt.asIntN(
        32,
        readRegister(ret3.indexComp, ret3.indexElem),
    );
    esp32vect.value[Number(interr_pos)]![2] = mode;
    //TODO: Graphic retroalimentation
    const gpiopin = "GPIO" + esp32vect.value[Number(interr_pos)]![0];
    console.log(
        `Interrupt attached at position ${interr_pos} for pin ${gpiopin} with ISR at ${interr_isr}.Mode: ${mode}`,
    );
    coreEvents.emit("arduino-terminal-write", {
        text: `attachInterrupt(${interr_pos}, 0x${interr_isr.toString(16)}, ${mode}) `,
    });
    coreEvents.emit("arduino-pin-interrupt", { pin: gpiopin });
}
export function cr_detachInterrupt() {
    console.log("cr_detachInterrupt called");
}
export function cr_digitalPinToInterrupt() {
    console.log("cr_digitalPinToInterrupt called");
    // Returns the first interrupt place free
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a0 not found",
            "danger",
            null,
        );
    }
    var pin = BigInt.asUintN(32, readRegister(ret1.indexComp, ret1.indexElem));
    //Find clean slot in the interrupt vector table
    const pos = esp32vect.value.findIndex(
        (slot: bigint[]) => slot[1] === 0n && slot[2] === 0n,
    );

    // Si no encuentra ninguna posición libre, findIndex devuelve -1
    if (pos === -1) {
        throw packExecute(
            true,
            "ESP32 Interrupt Table Full: No free slots available",
            "warning",
            null,
        );
    }
    esp32vect.value[pos] = [BigInt(pin), 0n, 0n]; // Mark the slot as used with the position
    writeRegister(BigInt(pos), ret1.indexComp, ret1.indexElem);
    coreEvents.emit("arduino-terminal-write", {
        text: `digitalPinToInterrupt(${pin})`,
    });
}
export function cr_interrupts() {
    console.log("cr_interrupts called");
}
export function cr_nointerrupts() {
    console.log("cr_nointerrupts called");
}
export function cr_isDigit() {
    console.log("cr_isDigit called");
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a0 not found",
            "danger",
            null,
        );
    }
    var value1 = BigInt.asUintN(
        32,
        readRegister(ret1.indexComp, ret1.indexElem),
    );
    let res = value1 >= 48n && value1 <= 57n ? 1n : 0n;
    writeRegister(BigInt(res), ret1.indexComp, ret1.indexElem);
    coreEvents.emit("arduino-terminal-write", { text: `isDigit(${value1})` });
}
export function cr_isAlpha() {
    console.log("cr_isAlpha called");
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a0 not found",
            "danger",
            null,
        );
    }
    var value1 = BigInt.asUintN(
        32,
        readRegister(ret1.indexComp, ret1.indexElem),
    );
    let res =
        (value1 >= 65n && value1 <= 90n) || (value1 >= 97n && value1 <= 122n)
            ? 1n
            : 0n;
    writeRegister(BigInt(res), ret1.indexComp, ret1.indexElem);
    coreEvents.emit("arduino-terminal-write", { text: `isAlpha(${value1})` });
}
export function cr_isAlphaNumeric() {
    console.log("cr_isAlphaNumeric called");
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a0 not found",
            "danger",
            null,
        );
    }
    var value1 = BigInt.asUintN(
        32,
        readRegister(ret1.indexComp, ret1.indexElem),
    );
    let res =
        (value1 >= 65n && value1 <= 90n) || (value1 >= 97n && value1 <= 122n)
            ? 1n
            : 0n;
    writeRegister(BigInt(res), ret1.indexComp, ret1.indexElem);
    coreEvents.emit("arduino-terminal-write", {
        text: `isAlphaNumeric(${value1})`,
    });
}
export function cr_isAscii() {
    console.log("cr_isAscii called");
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a0 not found",
            "danger",
            null,
        );
    }
    var value1 = BigInt.asUintN(
        32,
        readRegister(ret1.indexComp, ret1.indexElem),
    );
    let res = value1 >= 0n && value1 <= 127n ? 1n : 0n;
    writeRegister(BigInt(res), ret1.indexComp, ret1.indexElem);
    coreEvents.emit("arduino-terminal-write", { text: `isAscii(${value1})` });
}
export function cr_isControl() {
    console.log("cr_isControl called");
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a0 not found",
            "danger",
            null,
        );
    }
    var value1 = BigInt.asUintN(
        32,
        readRegister(ret1.indexComp, ret1.indexElem),
    );
    let res = (value1 >= 0n && value1 <= 31n) || value1 === 127n ? 1n : 0n;
    writeRegister(BigInt(res), ret1.indexComp, ret1.indexElem);
    coreEvents.emit("arduino-terminal-write", { text: `isControl(${value1})` });
}
export function cr_isPunct() {
    console.log("cr_isPunct called");
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a0 not found",
            "danger",
            null,
        );
    }
    var value1 = BigInt.asUintN(
        32,
        readRegister(ret1.indexComp, ret1.indexElem),
    );
    let res =
        (value1 >= 33n && value1 <= 47n) ||
        (value1 >= 58n && value1 <= 64n) ||
        (value1 >= 91n && value1 <= 96n) ||
        (value1 >= 123n && value1 <= 126n)
            ? 1n
            : 0n;
    writeRegister(BigInt(res), ret1.indexComp, ret1.indexElem);
    coreEvents.emit("arduino-terminal-write", { text: `isPunct(${value1})` });
}
export function cr_isHexadecimalDigit() {
    console.log("cr_isHexadecimalDigit called");
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a0 not found",
            "danger",
            null,
        );
    }
    var value1 = BigInt.asUintN(
        32,
        readRegister(ret1.indexComp, ret1.indexElem),
    );
    let res =
        (value1 >= 48n && value1 <= 57n) ||
        (value1 >= 65n && value1 <= 70n) ||
        (value1 >= 97n && value1 <= 102n)
            ? 1n
            : 0n;
    writeRegister(BigInt(res), ret1.indexComp, ret1.indexElem);
    coreEvents.emit("arduino-terminal-write", {
        text: `isHexadecimalDigit(${value1})`,
    });
}
export function cr_isUpperCase() {
    console.log("cr_isUpperCase called");
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a0 not found",
            "danger",
            null,
        );
    }
    var value1 = BigInt.asUintN(
        32,
        readRegister(ret1.indexComp, ret1.indexElem),
    );
    let res = value1 >= 65n && value1 <= 90n ? 1n : 0n;
    writeRegister(BigInt(res), ret1.indexComp, ret1.indexElem);
    coreEvents.emit("arduino-terminal-write", {
        text: `isUpperCase(${value1})`,
    });
}
export function cr_isLowerCase() {
    console.log("cr_isLowerCase called");
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a0 not found",
            "danger",
            null,
        );
    }
    var value1 = BigInt.asUintN(
        32,
        readRegister(ret1.indexComp, ret1.indexElem),
    );
    let res = value1 >= 97n && value1 <= 122n ? 1n : 0n;
    writeRegister(BigInt(res), ret1.indexComp, ret1.indexElem);
    coreEvents.emit("arduino-terminal-write", {
        text: `isLowerCase(${value1})`,
    });
}
export function cr_isPrintable() {
    console.log("cr_isPrintable called");
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a0 not found",
            "danger",
            null,
        );
    }
    var value1 = BigInt.asUintN(
        32,
        readRegister(ret1.indexComp, ret1.indexElem),
    );
    let res = value1 >= 32n && value1 <= 126n ? 1n : 0n;
    writeRegister(BigInt(res), ret1.indexComp, ret1.indexElem);
    coreEvents.emit("arduino-terminal-write", {
        text: `isPrintable(${value1})`,
    });
}
export function cr_isGraph() {
    console.log("cr_isGraph called");
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a0 not found",
            "danger",
            null,
        );
    }
    var value1 = BigInt.asUintN(
        32,
        readRegister(ret1.indexComp, ret1.indexElem),
    );
    let res = value1 >= 33n && value1 <= 126n ? 1n : 0n;
    writeRegister(BigInt(res), ret1.indexComp, ret1.indexElem);
    coreEvents.emit("arduino-terminal-write", { text: `isGraph(${value1})` });
}
export function cr_isSpace() {
    console.log("cr_isSpace called");
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a0 not found",
            "danger",
            null,
        );
    }
    var value1 = BigInt.asUintN(
        32,
        readRegister(ret1.indexComp, ret1.indexElem),
    );
    let res =
        value1 === 32n ||
        value1 === 9n ||
        value1 === 10n ||
        value1 === 13n ||
        value1 === 11n ||
        value1 === 12n
            ? 1n
            : 0n;
    writeRegister(BigInt(res), ret1.indexComp, ret1.indexElem);
    coreEvents.emit("arduino-terminal-write", { text: `isSpace(${value1})` });
}
export function cr_isWhiteSpace() {
    console.log("cr_isWhiteSpace called");
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a0 not found",
            "danger",
            null,
        );
    }
    var value1 = BigInt.asUintN(
        32,
        readRegister(ret1.indexComp, ret1.indexElem),
    );
    let res =
        value1 === 32n ||
        value1 === 9n ||
        value1 === 10n ||
        value1 === 13n ||
        value1 === 11n ||
        value1 === 12n
            ? 1n
            : 0n;
    writeRegister(BigInt(res), ret1.indexComp, ret1.indexElem);
    coreEvents.emit("arduino-terminal-write", {
        text: `isWhiteSpace(${value1})`,
    });
}
export function cr_delay() {
    console.log("cr_delay called");
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a0 not found",
            "danger",
            null,
        );
    }
    var value1 = BigInt.asUintN(
        32,
        readRegister(ret1.indexComp, ret1.indexElem),
    );
    coreEvents.emit("arduino-terminal-write", { text: `delay(${value1})` });
    // Simulate delay by busy-waiting
    const start = Date.now();
    while (Date.now() - start < Number(value1)) {
        // Busy wait
    }
}
export function cr_delayMicroseconds() {
    console.log("cr_delayMicroseconds called");
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a0 not found",
            "danger",
            null,
        );
    }
    var value1 = BigInt.asUintN(
        32,
        readRegister(ret1.indexComp, ret1.indexElem),
    );
    // Simulate microsecond delay by busy-waiting
    coreEvents.emit("arduino-terminal-write", {
        text: `delayMicroseconds(${value1})`,
    });
    const start = performance.now();
    while (performance.now() - start < Number(value1) / 1000) {
        // Busy wait
    }
}
export function cr_randomSeed() {
    console.log("cr_randomSeed called");
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a0 not found",
            "danger",
            null,
        );
    }
    var value1 = BigInt.asUintN(
        32,
        readRegister(ret1.indexComp, ret1.indexElem),
    );
    coreEvents.emit("arduino-terminal-write", {
        text: `randomSeed(${value1})`,
    });
    _seed = Number(value1) >>> 0;
}
export function cr_random() {
    console.log("cr_random called");
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a0 not found",
            "danger",
            null,
        );
    }
    var value1 = BigInt.asIntN(
        32,
        readRegister(ret1.indexComp, ret1.indexElem),
    );
    var ret2 = crex_findReg("a1");
    if (ret2.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a1 not found",
            "danger",
            null,
        );
    }
    var value2 = BigInt.asIntN(
        32,
        readRegister(ret2.indexComp, ret2.indexElem),
    );
    // Linear Congruential Generator (LCG)
    // Constants from Numerical Recipes
    _seed = (_seed * 1664525 + 1013904223) >>> 0;
    var rand = _seed / 0xffffffff;
    if (value2 === 0n) {
        // Return a random number between 0 and value1-1
        var randomValue = Math.floor(rand * Number(value1));
        coreEvents.emit("arduino-terminal-write", {
            text: `random(${value1})`,
        });
        writeRegister(BigInt(randomValue), ret1.indexComp, ret1.indexElem);
    } else {
        // Random between value1 and value2
        if (value1 > value2) {
            var temp = value1;
            value1 = value2;
            value2 = temp;
        }
        var randomValue =
            Math.floor(rand * Number(value2 - value1)) + Number(value1);
        coreEvents.emit("arduino-terminal-write", {
            text: `random(${value1}, ${value2})`,
        });
        writeRegister(BigInt(randomValue), ret1.indexComp, ret1.indexElem);
    }
}
export function cr_serial_available() {
    console.log("cr_serial_available called");
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_arduino: register a0 not found",
            "danger",
            null,
        );
    }
    if (serial_begin != 0 && initArduino != 0) {
        // Check how many bytes are available in the keyboard input buffer
        var available = BigInt(
            typeof status.keyboard === "string" ? status.keyboard.length : 0,
        );
        coreEvents.emit("arduino-terminal-write", {
            text: `serial_available()`,
        });
        writeRegister(available, ret1.indexComp, ret1.indexElem);
    } else {
        //ERROR
        coreEvents.emit("arduino-terminal-write", {
            text: `serial_available() = -1`,
        });
        writeRegister(BigInt.asIntN(32, -1n), ret1.indexComp, ret1.indexElem);
    }
}
export function cr_serial_availableForWrite() {
    console.log("cr_serial_availableForWrite called");
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_syscall: register a0 not found",
            "danger",
            null,
        );
    }
    if (serial_begin != 0 && initArduino != 0) {
        // Ready but with nothing being sended TODO: simulate complex scenaries
        writeRegister(64n, ret1.indexComp, ret1.indexElem); //simulates 64k buffer
        coreEvents.emit("arduino-terminal-write", {
            text: `serial_availableForWrite()`,
        });
        //in real hw it will only show data if its receiving data
    } else {
        //ERROR
        coreEvents.emit("arduino-terminal-write", {
            text: `serial_availableForWrite()`,
        });
        writeRegister(-1n, ret1.indexComp, ret1.indexElem);
    }
}
export function cr_serial_begin() {
    console.log("cr_serial_begin called");
    if (initArduino != 0) {
        if (serial_begin === 0) {
            var ret1 = crex_findReg("a0");
            if (ret1.match === 0) {
                throw packExecute(
                    true,
                    "capi_syscall: register " + "a0" + " not found",
                    "danger",
                    null,
                );
            }

            /* Print integer */
            var value = readRegister(ret1.indexComp, ret1.indexElem);
            //TODO: put frequences accepted values check
            var val_int = parseInt(value.toString()) >> 0;
            coreEvents.emit("arduino-terminal-write", {
                text: `serial_begin(${val_int})`,
            });
            serial_begin = val_int;
        }
    }
}
export function cr_serial_end() {
    console.log("cr_serial_end called");
    if (serial_begin != 0 && initArduino != 0) {
        coreEvents.emit("arduino-terminal-write", { text: `serial_end()` });
        serial_begin = 0; // Reset serial_begin
    }
}
export function cr_serial_find() {
    console.log("cr_serial_find called");
    if (serial_begin != 0 && initArduino != 0) {
        keyboard_read_find(kbd_read_string, "a0", "a1");
    }
}
export function cr_serial_findUntil() {
    console.log("cr_serial_findUntil called");
    if (serial_begin != 0 && initArduino != 0) {
        keyboard_read_find(kbd_read_string, "a0", "x0", "a1");
    }
}
export function cr_serial_flush() {
    console.log("cr_serial_flush called");
    //Cleans the serial buffer. Not exaclty what the board does, imitates Arduino 1.0

    if (serial_begin != 0 && initArduino != 0) {
        status.keyboard = "";
        status.display = "";
        const root = (document as any).app;
        if (root) {
            root.keyboard = "";
            root.display = "";
            root.enter = null;
        }
    }
}
export function cr_serial_parseFloat() {
    console.log("cr_serial_parseFloat called");
}
export function cr_serial_parseInt() {
    console.log("cr_serial_parseInt called");
    if (serial_begin != 0 && initArduino != 0) {
        keyboard_parseInt(kbd_read_string, "a0");
    }
}
export function cr_serial_read() {
    console.log("cr_serial_read called");
    if (serial_begin != 0 && initArduino != 0) {
        keyboard_read(kbd_read_char, "a0");
    }
}
export function cr_serial_readBytes() {
    console.log("cr_serial_readBytes called");
    if (serial_begin != 0 && initArduino != 0) {
        var register = crex_findReg("a0");
        if (register.match === 0) {
            throw packExecute(
                true,
                "capi_syscall: register " + "a0" + " not found",
                "danger",
                null,
            );
        }
        // Length
        const auxreg = crex_findReg("a1");
        if (auxreg.match === 0) {
            throw new Error("capi_syscall: register  a1 not found");
        }
        const size = readRegister(auxreg.indexComp, auxreg.indexElem);

        const funct_params = {
            indexComp: register.indexComp,
            indexElem: register.indexElem,
            size,
        };
        status.run_program = 3;
        keyboard_read(kbd_read_string, funct_params);
    }
}
export function cr_serial_readBytesUntil() {
    console.log("cr_serial_readBytesUntil called");
    if (serial_begin != 0 && initArduino != 0) {
        // Value 1 is the searched char
        var ret1 = crex_findReg("a0");
        if (ret1.match === 0) {
            throw packExecute(
                true,
                "capi_syscall: register " + "a0" + " not found",
                "danger",
                null,
            );
        }
        // Check if value1 is a number and is a valid ASCII character
        var value1 = readRegister(ret1.indexComp, ret1.indexElem);
        if (typeof value1 !== "bigint" || value1 < 0 || value1 > 255) {
            throw packExecute(
                true,
                "capi_syscall: invalid value for searched character",
                "danger",
                null,
            );
        }

        // Value 2 is the buffer
        var ret2 = crex_findReg("a1");
        if (ret2.match === 0) {
            throw packExecute(
                true,
                "capi_syscall: register " + "a1" + " not found",
                "danger",
                null,
            );
        }

        // Value 3 is the length or end character
        var ret3 = crex_findReg("a2");
        if (ret3.match === 0) {
            throw packExecute(
                true,
                "capi_syscall: register " + "a2" + " not found",
                "danger",
                null,
            );
        }
        // Check if value3 is a number and greater than 0
        var value3_check = readRegister(ret3.indexComp, ret3.indexElem);
        if (typeof value3_check !== "bigint" || value3_check <= 0) {
            throw packExecute(
                true,
                "capi_syscall: invalid value for length/end char",
                "danger",
                null,
            );
        }
        status.run_program = 3;
        return keyboard_read_until(kbd_read_string, ret2, value1);
    }
}
export function cr_serial_write() {
    console.log("cr_serial_write called");
}
export function cr_serial_printf() {
    //console.log("cr_serial_printf called");
    // Get the address from register a0
    const valueReg = crex_findReg("a0");
    if (valueReg.match === 0) {
        throw packExecute(
            true,
            "capi_arduino: register a0 not found",
            "danger",
            null,
        );
    }
    // Read the address stored in the register (already BigInt)
    let stringAddress = readRegister(
        valueReg.indexComp,
        valueReg.indexElem,
    ) as bigint;

    // Normalize address to positive range
    stringAddress = BigInt.asUintN(32, stringAddress);

    // Get the memory instance
    const memory = main_memory as Memory;

    // Validate address is within memory bounds
    if (stringAddress >= BigInt(memory.getSize())) {
        throw packExecute(
            true,
            "capi_arduino: invalid string address",
            "danger",
            null,
        );
    }

    // Read the format string from memory
    let formatString = "";
    let memoryAddr = stringAddress;
    while (memoryAddr < BigInt(memory.getSize())) {
        const byte = memory.read(memoryAddr);
        if (byte === 0) break; // Null terminator
        formatString += String.fromCharCode(byte);
        memoryAddr++;
    }

    // Process format specifiers
    let result = formatString;
    const argRegisters = ["a1", "a2", "a3", "a4", "a5", "a6", "a7"];

    for (const reg of argRegisters) {
        const argReg = crex_findReg(reg);
        if (argReg.match === 0) break;

        const argValue = readRegister(argReg.indexComp, argReg.indexElem);

        // Replacements
        result = result.replace("%d", String(BigInt.asIntN(32, argValue)));
        result = result.replace("%u", String(BigInt.asUintN(32, argValue)));
        result = result.replace(
            "%x",
            BigInt.asUintN(32, argValue).toString(16),
        );
        result = result.replace(
            "%c",
            String.fromCharCode(Number(BigInt.asUintN(8, argValue))),
        );
        if (result.includes("%s")) {
            let str = "";
            let addr = argValue;

            while (addr < BigInt(memory.getSize())) {
                const byte = memory.read(addr);
                if (byte === 0) break; // Null terminator
                str += String.fromCharCode(byte);
                addr++;
            }
            result = result.replace("%s", str);
        }
    }

    // Print the formatted string directly
    display_print(result);
}
export function cr_tone() {
    console.log("cr_tone called");
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_arduino: register a0 not found",
            "danger",
            null,
        );
    }
    var pin = BigInt.asIntN(32, readRegister(ret1.indexComp, ret1.indexElem));

    var ret2 = crex_findReg("a1");
    if (ret2.match === 0) {
        throw packExecute(
            true,
            "capi_arduino: register a1 not found",
            "danger",
            null,
        );
    }
    var value = BigInt.asIntN(32, readRegister(ret2.indexComp, ret2.indexElem));

    var ret3 = crex_findReg("a2");
    if (ret3.match === 0) {
        throw packExecute(
            true,
            "capi_arduino: register a2 not found",
            "danger",
            null,
        );
    }
    var duration = BigInt.asIntN(
        32,
        readRegister(ret3.indexComp, ret3.indexElem),
    );
    coreEvents.emit("arduino-terminal-write", {
        text: `tone(${pin}, ${value}, ${duration})`,
    });
    coreEvents.emit("arduino-pin-write", {
        pin: Number(pin),
        value: Number(value),
    });
}
export function cr_noTone() {
    console.log("cr_noTone called");
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_arduino: register a0 not found",
            "danger",
            null,
        );
    }
    var pin = BigInt.asIntN(32, readRegister(ret1.indexComp, ret1.indexElem));
    coreEvents.emit("arduino-terminal-write", { text: `noTone(${pin})` });
    coreEvents.emit("arduino-pin-write", { pin: Number(pin), value: 0 });
}
export function cr_pulseIn() {
    console.log("cr_pulseIn called");
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_arduino: register a0 not found",
            "danger",
            null,
        );
    }
    var pin = BigInt.asIntN(32, readRegister(ret1.indexComp, ret1.indexElem));

    var ret2 = crex_findReg("a1");
    if (ret2.match === 0) {
        throw packExecute(
            true,
            "capi_arduino: register a1 not found",
            "danger",
            null,
        );
    }
    var value = BigInt.asIntN(32, readRegister(ret2.indexComp, ret2.indexElem));

    var ret3 = crex_findReg("a2");
    if (ret3.match === 0) {
        throw packExecute(
            true,
            "capi_arduino: register a2 not found",
            "danger",
            null,
        );
    }
    var duration = BigInt.asIntN(
        32,
        readRegister(ret3.indexComp, ret3.indexElem),
    );
    coreEvents.emit("arduino-terminal-write", {
        text: `pulseIn(${pin}, ${value}, ${duration})`,
    });
    coreEvents.emit("arduino-pin-write", {
        pin: Number(pin),
        value: Number(value),
    });
}
export function cr_pulseInLong() {
    console.log("cr_pulseInLong called");
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_arduino: register a0 not found",
            "danger",
            null,
        );
    }
    var pin = BigInt.asIntN(32, readRegister(ret1.indexComp, ret1.indexElem));

    var ret2 = crex_findReg("a1");
    if (ret2.match === 0) {
        throw packExecute(
            true,
            "capi_arduino: register a1 not found",
            "danger",
            null,
        );
    }
    var value = BigInt.asIntN(32, readRegister(ret2.indexComp, ret2.indexElem));

    var ret3 = crex_findReg("a2");
    if (ret3.match === 0) {
        throw packExecute(
            true,
            "capi_arduino: register a2 not found",
            "danger",
            null,
        );
    }
    var duration = BigInt.asIntN(
        32,
        readRegister(ret3.indexComp, ret3.indexElem),
    );
    coreEvents.emit("arduino-terminal-write", {
        text: `pulseInLong(${pin}, ${value}, ${duration})`,
    });
    coreEvents.emit("arduino-pin-write", {
        pin: Number(pin),
        value: Number(value),
    });
}
export function cr_shiftIn() {
    console.log("cr_shiftIn called");
    let value = 0;
    var ret1 = crex_findReg("a0");
    if (ret1.match === 0) {
        throw packExecute(
            true,
            "capi_arduino: register a0 not found",
            "danger",
            null,
        );
    }
    var dataPin = BigInt.asIntN(
        32,
        readRegister(ret1.indexComp, ret1.indexElem),
    );

    var ret2 = crex_findReg("a1");
    if (ret2.match === 0) {
        throw packExecute(
            true,
            "capi_arduino: register a1 not found",
            "danger",
            null,
        );
    }
    var clockPin = BigInt.asIntN(
        32,
        readRegister(ret2.indexComp, ret2.indexElem),
    );

    var ret3 = crex_findReg("a2");
    if (ret3.match === 0) {
        throw packExecute(
            true,
            "capi_arduino: register a2 not found",
            "danger",
            null,
        );
    }
    var bitOrder = BigInt.asIntN(
        32,
        readRegister(ret3.indexComp, ret3.indexElem),
    );
    coreEvents.emit("arduino-terminal-write", {
        text: `shiftIn(${dataPin}, ${clockPin}, ${bitOrder})`,
    });
    for (let i = 0; i < 8; i++) {
        let bit = pinStates.value[`GPIO${dataPin}`] !== 0 ? 1 : 0;
        if (bitOrder === 1n) {
            // MSBFIRST
            value |= bit << (7 - i);
        } else {
            // LSBFIRST
            value |= bit << i;
        }
    }
    writeRegister(BigInt(value), ret1.indexComp, ret1.indexElem);
    coreEvents.emit("arduino-terminal-write", {
        text: `shiftIn(${dataPin}, ${clockPin}) -> Received Byte: 0x${value.toString(16).toUpperCase()} (${value})`,
    });
}
export function cr_shiftOut() {
    console.log("cr_shiftOut called");
}

//Order
export const hookOrder = [
    "cr_initArduino",
    "cr_digitalRead",
    "cr_pinMode",
    "cr_digitalWrite",
    "cr_rgbLedWrite",
    "cr_analogRead",
    "cr_analogReadResolution",
    "cr_analogWrite",
    "cr_map",
    "cr_constrain",
    "cr_abs",
    "cr_max",
    "cr_min",
    "cr_pow",
    "cr_bit",
    "cr_bitClear",
    "cr_bitRead",
    "cr_bitSet",
    "cr_bitWrite",
    "cr_highByte",
    "cr_lowByte",
    "cr_attachInterrupt",
    "cr_detachInterrupt",
    "cr_digitalPinToInterrupt",
    "cr_pulseIn",
    "cr_pulseInLong",
    "cr_shiftIn",
    "cr_shiftOut",
    "cr_tone",
    "cr_noTone",
    "cr_interrupts",
    "cr_nointerrupts",
    "cr_isDigit",
    "cr_isAlpha",
    "cr_isAlphaNumeric",
    "cr_isAscii",
    "cr_isControl",
    "cr_isPunct",
    "cr_isHexadecimalDigit",
    "cr_isUpperCase",
    "cr_isLowerCase",
    "cr_isPrintable",
    "cr_isGraph",
    "cr_isSpace",
    "cr_isWhiteSpace",
    "cr_delay",
    "cr_delayMicroseconds",
    "cr_randomSeed",
    "cr_random",
    "cr_serial_available",
    "cr_serial_availableForWrite",
    "cr_serial_begin",
    "cr_serial_end",
    "cr_serial_find",
    "cr_serial_findUntil",
    "cr_serial_flush",
    "cr_serial_parseInt",
    "cr_serial_read",
    "cr_serial_readBytes",
    "cr_serial_readBytesUntil",
    "cr_serial_write",
    "cr_serial_printf",
];
