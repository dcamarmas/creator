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
 *
 */

import { status } from "../core.mjs";

interface DecodedField {
    type: string;
    name: string;
    value: unknown;
}

interface InstructionDescriptor {
    definition: string;
    fields: Array<DecodedField & { order?: number }>;
}

const registers = new Proxy({}, {
    get(_target, prop) {
        if (typeof prop !== "string") {
            throw new Error("Register name must be a string");
        }
        // Special case for PC register - read virtual PC from status
        if (prop === "PC") {
            return status.virtual_PC;
        }
        return CAPI.REG.read(prop);
    },
    set(_target, prop, value) {
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
    }
});

export function compileInstruction(
    instruction: InstructionDescriptor,
) {
    const parameters: Array<string | undefined> = [];
    for (const field of instruction.fields) {
        // For each field that is a register or an immediate, we have to
        // create a function that receives those values as parameters
        if (["INT-Reg", "Ctrl-Reg", "SFP-Reg", "DFP-Reg", "inm-signed", "inm-unsigned", "offset_bytes"].includes(field.type)) {
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
    const orderedParameters = parameters.filter((param): param is string => typeof param === "string");
    
    const func = new Function(
        "status",
        "registers",
        ...orderedParameters,
        instruction.definition,
    );
    
    // Return a wrapper function that injects the status object
    return function(...args: unknown[]) {
        return func(status, registers, ...args);
    };
}
