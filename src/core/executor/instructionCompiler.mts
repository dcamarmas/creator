/**
 * Copyright 2018-2026 CREATOR Team.
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

import { REGISTERS, architecture, status } from "../core.mjs";
import { InterruptType } from "./InterruptManager.mts";

interface DecodedField {
    type: string;
    name: string;
    value: unknown;
}

interface InstructionDescriptor {
    definition: string;
    fields: Array<DecodedField & { order?: number }>;
}

export const registerProxy = new Proxy(
    {},
    {
        get(_target, prop) {
            if (typeof prop !== "string") {
                throw new Error("Register name must be a string");
            }
            // Special case for PC register - "virtual PC"
            if (status.pcRegisterNames.includes(prop)) {
                const offset = BigInt(architecture.config.pc_offset || 0n);
                return CAPI.REG.read(prop) + offset;
            }
            return CAPI.REG.read(prop);
        },
        set(_target, prop, value: bigint) {
            if (typeof prop !== "string") {
                throw new Error("Register name must be a string");
            }
            CAPI.REG.write(value, prop);
            return true;
        },
        has(_target, prop) {
            if (typeof prop !== "string") {
                return false;
            }
            // Special case for PC register
            if (prop === "PC") {
                return true;
            }
            try {
                CAPI.REG.read(prop);
                return true;
            } catch {
                return false;
            }
        },
    },
);

/**
 * Builds a custom `Function` with injected `CAPI`, `status`, `registers` and
 * `InterruptType` local variables
 * @param args `Function` parameters (arguments and function body)
 * @returns Modified function
 */
export function injectedFunction(...args: string[]) {
    const f = new Function(
        "CAPI",
        "status",
        "registers",
        "InterruptType",
        ...args,
    );
    return (...sargs: unknown[]) => {
        return f(CAPI, status, registerProxy, InterruptType, ...sargs);
    };
}

export function compileInstruction(instruction: InstructionDescriptor) {
    const parameters: Array<string | undefined> = [];
    for (const field of instruction.fields) {
        // For each field that is a register or an immediate, we have to
        // create a function that receives those values as parameters
        if (
            [
                "INT-Reg",
                "Ctrl-Reg",
                "SFP-Reg",
                "DFP-Reg",
                "imm-signed",
                "imm-unsigned",
                "offset_bytes",
            ].includes(field.type)
        ) {
            // check the "order" field, and sort them ascendingly
            // to ensure the parameters are always in the same order
            if (typeof field.order !== "number") {
                continue;
            }
            if (field.order <= 0) {
                continue;
            }
            parameters[field.order] = field.name;
        }
    }
    const orderedParameters = parameters.filter(
        (param): param is string => typeof param === "string",
    );

    // Return a wrapper function that injects the status and registers objects
    return injectedFunction(...orderedParameters, instruction.definition);
}
