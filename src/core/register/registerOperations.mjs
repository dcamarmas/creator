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
import { architecture, status, REGISTERS } from "../core.mjs";
import { packExecute, writeStackLimit } from "../executor/executor.mjs";
import { instructions } from "../compiler/compiler.mjs";
import { creator_callstack_writeRegister } from "../sentinel/sentinel.mjs";

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

    return REGISTERS[indexComp].elements[indexElem].value;
}

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
    }

    const component = REGISTERS[indexComp];
    const element = component.elements[indexElem];
    const properties = element.properties;
    const elementName = element.name.join(" | ");
    const stackStart = architecture.memory_layout[4].value;

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
    creator_callstack_writeRegister(indexComp, indexElem);

    if (
        properties.includes("stack_pointer") &&
        value !== parseInt(stackStart, 16)
    ) {
        writeStackLimit(value);
    }

    if (typeof window !== "undefined") {
        btn_glow(element.name, "Int");
    }
}
