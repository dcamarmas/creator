/**
 * Copyright 2018-2025 CREATOR Team.
 *
 * This file is part of CREATOR.
 *
 * CREATOR is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * CREATOR is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with CREATOR.  If not, see <http://www.gnu.org/licenses/>.
 */

import { architecture, REGISTERS } from "../core.mjs";
import { console_log } from "../utils/creator_logger.mjs";

/**
 * Event types that can occur during function execution
 */
const EventType = {
    WRITE_MEMORY: "write_memory",
    READ_MEMORY: "read_memory",
    WRITE_REGISTER: "write_register",
    READ_REGISTER: "read_register",
};

// Helpers for safe BigInt conversions and comparisons
function toBigIntSafe(v) {
    if (v === null || typeof v === "undefined") return null;
    if (typeof v === "bigint") return v;
    if (typeof v === "number") {
        if (!Number.isInteger(v)) return null;
        return BigInt(v);
    }
    // strings and other types that BigInt accepts
    try {
        return BigInt(v);
    } catch (_e) {
        return null;
    }
}

function bigintsEqual(a, b) {
    const A = toBigIntSafe(a);
    const B = toBigIntSafe(b);
    if (A === null || B === null) return false;
    return A === B;
}

/**
 * Represents a single event in the register lifecycle
 */
class RegisterEvent {
    constructor(type, regIndex, elemIndex, address = null, size = null) {
        this.type = type;
        this.regIndex = regIndex;
        this.elemIndex = elemIndex;
        // Normalize address/size to BigInt when possible to avoid mixed-type comparisons
        this.address = toBigIntSafe(address);
        this.size = toBigIntSafe(size);
        this.timestamp = Date.now();
    }

    get registerName() {
        return (
            REGISTERS[this.regIndex]?.elements[this.elemIndex]?.name ||
            "unknown"
        );
    }

    toString() {
        const addr =
            this.address !== null ? ` @0x${this.address.toString(16)}` : "";
        const size = this.size !== null ? ` (${this.size} bytes)` : "";
        return `${this.type}: ${this.registerName}${addr}${size}`;
    }
}

/**
 * Represents a function call frame with register state tracking
 */
class CallFrame {
    constructor(functionName, stackPointer) {
        this.functionName = functionName;
        this.enterStackPointer = stackPointer;
        this.events = [];
        this.initialRegisterValues = CallFrame._captureRegisterValues();
    }

    static _captureRegisterValues() {
        const values = [];
        for (let i = 0; i < REGISTERS.length; i++) {
            values.push([]);
            for (let j = 0; j < REGISTERS[i].elements.length; j++) {
                values[i].push(REGISTERS[i].elements[j].value);
            }
        }
        return values;
    }

    addEvent(event) {
        this.events.push(event);
        console_log(
            `[EVENT] ${this.functionName}: ${event.toString()}`,
            "INFO",
        );
    }

    /**
     * Get all events for a specific register
     */
    getRegisterEvents(regIndex, elemIndex) {
        return this.events.filter(
            e => e.regIndex === regIndex && e.elemIndex === elemIndex,
        );
    }

    /**
     * Find the first save event for a register
     */
    getFirstSave(regIndex, elemIndex) {
        return this.events.find(
            e =>
                e.regIndex === regIndex &&
                e.elemIndex === elemIndex &&
                e.type === EventType.WRITE_MEMORY,
        );
    }

    /**
     * Find the last restore event for a register
     */
    getLastRestore(regIndex, elemIndex) {
        const restores = this.events.filter(
            e =>
                e.regIndex === regIndex &&
                e.elemIndex === elemIndex &&
                e.type === EventType.READ_MEMORY,
        );
        return restores[restores.length - 1];
    }
}

/**
 * Validation rules for calling convention
 */
class ConventionRules {
    /**
     * Check if a saved register follows proper save/restore pattern
     */
    static validateSavedRegister(frame, regIndex, elemIndex) {
        const violations = [];
        const register = REGISTERS[regIndex].elements[elemIndex];
        const events = frame.getRegisterEvents(regIndex, elemIndex);

        // Rule 1: Saved registers must be saved before modification
        const firstSave = frame.getFirstSave(regIndex, elemIndex);
        const modifications = events.filter(
            e =>
                e.type === EventType.WRITE_REGISTER ||
                e.type === EventType.READ_REGISTER,
        );

        if (modifications.length > 0 && !firstSave) {
            violations.push({
                rule: "SAVE_BEFORE_USE",
                register: register.name,
                message: `Register ${register.name} was used but never saved to memory`,
            });
        }

        if (firstSave && modifications.length > 0) {
            const firstMod = modifications[0];
            if (firstMod.timestamp < firstSave.timestamp) {
                violations.push({
                    rule: "SAVE_BEFORE_USE",
                    register: register.name,
                    message: `Register ${register.name} was modified before being saved`,
                });
            }
        }

        // Rule 2: Saved registers must be restored from the same address
        const lastRestore = frame.getLastRestore(regIndex, elemIndex);
        if (firstSave && !lastRestore) {
            violations.push({
                rule: "RESTORE_REQUIRED",
                register: register.name,
                message: `Register ${register.name} was saved but never restored`,
            });
        }

        if (firstSave && lastRestore) {
            if (!bigintsEqual(firstSave.address, lastRestore.address)) {
                const saveAddr = toBigIntSafe(firstSave.address);
                const restoreAddr = toBigIntSafe(lastRestore.address);
                const saveStr =
                    saveAddr !== null
                        ? `0x${saveAddr.toString(16)}`
                        : String(firstSave.address);
                const restoreStr =
                    restoreAddr !== null
                        ? `0x${restoreAddr.toString(16)}`
                        : String(lastRestore.address);
                violations.push({
                    rule: "RESTORE_ADDRESS_MISMATCH",
                    register: register.name,
                    message: `Register ${register.name} saved at ${saveStr} but restored from ${restoreStr}`,
                });
            }
        }

        // Rule 3: Save and restore sizes must match
        if (firstSave && lastRestore) {
            const s1 = toBigIntSafe(firstSave.size);
            const s2 = toBigIntSafe(lastRestore.size);
            if (s1 === null || s2 === null || s1 !== s2) {
                const s1Str =
                    s1 !== null ? s1.toString() : String(firstSave.size);
                const s2Str =
                    s2 !== null ? s2.toString() : String(lastRestore.size);
                violations.push({
                    rule: "SIZE_MISMATCH",
                    register: register.name,
                    message: `Register ${register.name} saved with ${s1Str} bytes but restored with ${s2Str} bytes`,
                });
            }
        }

        // Rule 4: Value must be restored (if the register was modified)
        const currentValue = REGISTERS[regIndex].elements[elemIndex].value;
        const initialValue = frame.initialRegisterValues[regIndex]?.[elemIndex];

        // Try to compare as BigInt when possible, otherwise fall back to strict equality
        const curBig = toBigIntSafe(currentValue);
        const initBig = toBigIntSafe(initialValue);

        const valueChanged =
            curBig !== null && initBig !== null
                ? curBig !== initBig
                : currentValue !== initialValue;

        if (valueChanged && modifications.length > 0) {
            violations.push({
                rule: "VALUE_NOT_RESTORED",
                register: register.name,
                message: `Register ${register.name} value changed but not properly restored`,
            });
        }

        return violations;
    }

    /**
     * Check stack pointer restoration
     */
    static validateStackPointer(frame, currentStackPointer) {
        const spEnter = toBigIntSafe(frame.enterStackPointer);
        const spNow = toBigIntSafe(currentStackPointer);
        if (spEnter === null || spNow === null || spEnter !== spNow) {
            const enterStr =
                spEnter !== null
                    ? `0x${spEnter.toString(16)}`
                    : String(frame.enterStackPointer);
            const nowStr =
                spNow !== null
                    ? `0x${spNow.toString(16)}`
                    : String(currentStackPointer);
            return [
                {
                    rule: "STACK_NOT_RESTORED",
                    message: `Stack pointer not restored: entered at ${enterStr}, exited at ${nowStr}`,
                },
            ];
        }
        return [];
    }
}

/**
 * Main validator class for calling conventions
 */
class CallingConventionValidator {
    constructor() {
        this.callStack = [];
    }

    /**
     * Enter a new function
     */
    enter(functionName) {
        const stackPointer = architecture.memory_layout.stack.start;
        const frame = new CallFrame(functionName, stackPointer);
        this.callStack.push(frame);
        console_log(`[SENTINEL] Entering function: ${functionName}`, "INFO");
        return { ok: true, msg: "" };
    }

    /**
     * Leave current function and validate
     */
    leave() {
        if (this.callStack.length === 0) {
            return {
                ok: false,
                msg: "Cannot leave function: call stack is empty",
            };
        }

        const frame = this.callStack[this.callStack.length - 1];
        console_log(
            `[SENTINEL] Leaving function: ${frame.functionName}`,
            "INFO",
        );

        const violations = [];

        // Validate stack pointer
        const spViolations = ConventionRules.validateStackPointer(
            frame,
            architecture.memory_layout.stack.start,
        );
        violations.push(...spViolations);

        // Validate each saved register
        for (let i = 0; i < REGISTERS.length; i++) {
            for (let j = 0; j < REGISTERS[i].elements.length; j++) {
                const register = REGISTERS[i].elements[j];

                // Only check registers that should be saved
                if (register.properties.includes("saved")) {
                    const regViolations = ConventionRules.validateSavedRegister(
                        frame,
                        i,
                        j,
                    );
                    violations.push(...regViolations);
                }
            }
        }

        // Pop the frame
        this.callStack.pop();

        // Return result
        if (violations.length > 0) {
            const messages = violations.map(v => `  - ${v.message}`).join("\n");
            return {
                ok: false,
                msg: `Calling convention violations in ${frame.functionName}:\n${messages}`,
            };
        }

        return { ok: true, msg: "" };
    }

    /**
     * Record a memory write event
     */
    recordMemoryWrite(regIndex, elemIndex, address, size) {
        if (this.callStack.length === 0) {
            console_log(
                "[SENTINEL] Warning: Memory write outside function context",
                "WARN",
            );
            return;
        }

        const frame = this.callStack[this.callStack.length - 1];
        const event = new RegisterEvent(
            EventType.WRITE_MEMORY,
            regIndex,
            elemIndex,
            address,
            size,
        );
        frame.addEvent(event);
    }

    /**
     * Record a memory read event
     */
    recordMemoryRead(regIndex, elemIndex, address, size) {
        if (this.callStack.length === 0) {
            console_log(
                "[SENTINEL] Warning: Memory read outside function context",
                "WARN",
            );
            return;
        }

        const frame = this.callStack[this.callStack.length - 1];
        const event = new RegisterEvent(
            EventType.READ_MEMORY,
            regIndex,
            elemIndex,
            address,
            size,
        );
        frame.addEvent(event);
    }

    /**
     * Record a register write event
     */
    recordRegisterWrite(regIndex, elemIndex) {
        if (this.callStack.length === 0) {
            return;
        }

        const frame = this.callStack[this.callStack.length - 1];
        const event = new RegisterEvent(
            EventType.WRITE_REGISTER,
            regIndex,
            elemIndex,
        );
        frame.addEvent(event);
    }

    /**
     * Record a register read event
     */
    recordRegisterRead(regIndex, elemIndex) {
        if (this.callStack.length === 0) {
            return;
        }

        const frame = this.callStack[this.callStack.length - 1];
        const event = new RegisterEvent(
            EventType.READ_REGISTER,
            regIndex,
            elemIndex,
        );
        frame.addEvent(event);
    }

    /**
     * Reset the validator
     */
    reset() {
        this.callStack = [];
        this.enter("main");
        return { ok: true, msg: "" };
    }

    /**
     * Get current call depth
     */
    getCallDepth() {
        return this.callStack.length;
    }

    /**
     * Get current function name
     */
    getCurrentFunction() {
        if (this.callStack.length === 0) {
            return null;
        }
        return this.callStack[this.callStack.length - 1].functionName;
    }
}

// Global instance
const validator = new CallingConventionValidator();

// Public API - Direct validator interface
// yes, it HAS to be with arrow functions
export const sentinel = {
    enter: functionName => validator.enter(functionName),
    leave: () => validator.leave(),
    recordMemoryWrite: (regIndex, elemIndex, address, size) =>
        validator.recordMemoryWrite(regIndex, elemIndex, address, size),
    recordMemoryRead: (regIndex, elemIndex, address, size) =>
        validator.recordMemoryRead(regIndex, elemIndex, address, size),
    recordRegisterWrite: (regIndex, elemIndex) =>
        validator.recordRegisterWrite(regIndex, elemIndex),
    recordRegisterRead: (regIndex, elemIndex) =>
        validator.recordRegisterRead(regIndex, elemIndex),
    reset: () => validator.reset(),
    getCallDepth: () => validator.getCallDepth(),
    getCurrentFunction: () => validator.getCurrentFunction(),
};
