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

import { architecture, status, REGISTERS } from "../core.mjs";
import { writeStackLimit } from "../executor/executor.mjs";
import { instructions } from "../assembler/assembler.mjs";
import { sentinel } from "../sentinel/sentinel.mjs";
import { packExecute } from "../utils/utils.mjs";
import { coreEvents } from "../events.mjs";
import { setRegisterGlow } from "./registerGlowState.mjs";

/**
 * Notifies UI layers about a register update via event emission
 * This keeps the core decoupled from specific UI implementations
 *
 * @param {Number} indexComp Index of the register bank
 * @param {Number} indexElem Index of the register
 */
export function notifyRegisterUpdate(indexComp, indexElem) {
    // Mark register as glowing in persistent store
    setRegisterGlow(indexComp, indexElem);
    // Emit event for UI updates
    coreEvents.emit("register-updated", { indexComp, indexElem });
}

export function readRegister(indexComp, indexElem) {
    const draw = {
        space: [],
        info: [],
        success: [],
        danger: [],
        flash: [],
    };

    if (
        REGISTERS[indexComp].elements[indexElem].properties.includes("read") !==
        true
    ) {
        for (let i = 0; i < instructions.length; i++) {
            draw.space.push(i);
        }
        draw.danger.push(status.execution_index);

        throw packExecute(
            true,
            "The register " +
                REGISTERS[indexComp].elements[indexElem].name.join(" | ") +
                " cannot be read",
            "danger",
            null,
        );
    }

    return BigInt(REGISTERS[indexComp].elements[indexElem].value);
}

/**
 * Writes the specified value in the specified register, given its component and
 * index elements
 *
 * @param {bigint} value Value to write
 * @param {number} indexComp Index of the component/bank
 * @param {number} indexElem Index of the element
 */
export function writeRegister(value, indexComp, indexElem) {
    const draw = {
        space: [],
        info: [],
        success: [],
        danger: [],
        flash: [],
    };

    if (value === null) {
        return;
    } else if (value === 0) {
        value = BigInt(0);
    } else if (value < 0) {
        throw new Error(
            "Cannot write negative values to registers. Use two's complement.",
        );
    }
    if (typeof value === "number") {
        throw new Error("Called writeRegister with a number, not BigInt");
    }

    const component = REGISTERS[indexComp];
    const element = component.elements[indexElem];
    const properties = element.properties;
    const elementName = element.name.join(" | ");
    const stackStart = architecture.memory_layout.stack.start;

    if (!properties.includes("write")) {
        if (properties.includes("ignore_write")) {
            return;
        }

        for (let i = 0; i < instructions.length; i++) {
            draw.space.push(i);
        }
        draw.danger.push(status.execution_index);

        throw packExecute(
            true,
            "The register " + elementName + " cannot be written",
            "danger",
            null,
        );
    }

    element.value = value;
    sentinel.recordRegisterWrite(indexComp, indexElem);

    if (properties.includes("stack_pointer") && value !== stackStart) {
        writeStackLimit(value);
    }
    if (typeof document !== "undefined" && document?.app) {
        // Notify UI layers about the update (CLI ignores, web UI listens)
        notifyRegisterUpdate(indexComp, indexElem);
    }
}
