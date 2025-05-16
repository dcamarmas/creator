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
import {
    bi_BigIntTodouble,
    bi_BigIntTofloat,
    bi_doubleToBigInt,
    bi_floatToBigInt,
} from "../utils/bigint.mjs";
import { architecture, status, REGISTERS } from "../core.mjs";
import { packExecute, writeStackLimit } from "../executor/executor.mjs";
import { instructions } from "../compiler/compiler.mjs";
import { updateDouble, updateSimple } from "./fpRegisterSync.mjs";
import { creator_callstack_writeRegister } from "../sentinel/sentinel.mjs";
import { logger } from "../utils/creator_logger.mjs";
import { toJSNumber, toNaNBoxedBigInt } from "../utils/utils.mjs";

// eslint-disable-next-line max-lines-per-function
export function readRegister(indexComp, indexElem, register_type) {
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

    if (
        REGISTERS[indexComp].type == "ctrl_registers" ||
        REGISTERS[indexComp].type == "int_registers"
    ) {
        logger.debug(
            `Reading ${
                REGISTERS[indexComp].type
            } [${indexComp}][${indexElem}] ${REGISTERS[indexComp].elements[
                indexElem
            ].name.join("|")}: 0x${REGISTERS[indexComp].elements[
                indexElem
            ].value.toString(16)}`,
        );
        return REGISTERS[indexComp].elements[indexElem].value;
    }

    if (REGISTERS[indexComp].type == "fp_registers") {
        if (REGISTERS[indexComp].double_precision === false) {
            const value = toJSNumber(
                REGISTERS[indexComp].elements[indexElem].value,
            );
            logger.debug(
                `Reading float register [${indexComp}][${indexElem}] ${REGISTERS[
                    indexComp
                ].elements[indexElem].name.join("|")}: ${value}`,
            );
            return value;
        } else {
            if (REGISTERS[indexComp].double_precision_type == "linked") {
                const value = toJSNumber(
                    REGISTERS[indexComp].elements[indexElem].value,
                );
                logger.debug(
                    `Reading linked double register [${indexComp}][${indexElem}] ${REGISTERS[
                        indexComp
                    ].elements[indexElem].name.join("|")}: ${value}`,
                );
                return value;
            } else {
                if (typeof register_type === "undefined") {
                    register_type = "DFP-Reg";
                }
                if (register_type === "SFP-Reg") {
                    const value = toJSNumber(
                        REGISTERS[indexComp].elements[indexElem].value,
                    );
                    logger.debug(
                        `Reading single-precision register [${indexComp}][${indexElem}] ${REGISTERS[
                            indexComp
                        ].elements[indexElem].name.join("|")}: ${value}`,
                    );
                    return value;
                }
                if (register_type === "DFP-Reg") {
                    const value = toJSNumber(
                        REGISTERS[indexComp].elements[indexElem].value,
                    );
                    logger.debug(
                        `Reading double-precision register [${indexComp}][${indexElem}] ${REGISTERS[
                            indexComp
                        ].elements[indexElem].name.join("|")}: ${value}`,
                    );
                    return value;
                }
            }
        }
    }
}
// eslint-disable-next-line max-lines-per-function
export function writeRegister(value, indexComp, indexElem, register_type) {
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
    const componentType = component.type;
    const elementName = element.name.join(" | ");
    const stackStart = architecture.memory_layout[4].value;

    if (componentType == "int_registers" || componentType == "ctrl_registers") {
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
    } else if (componentType === "fp_registers") {
        if (!properties.includes("write")) {
            if (properties.includes("ignore_write")) {
                return;
            }
            draw.danger.push(status.execution_index);

            throw packExecute(
                true,
                "The register " + elementName + " cannot be written",
                "danger",
                null,
            );
        }

        const doublePrecision = component.double_precision;

        if (doublePrecision === false) {
            element.value = bi_floatToBigInt(value);
            creator_callstack_writeRegister(indexComp, indexElem);

            if (
                properties.includes("stack_pointer") &&
                value !== parseInt(stackStart, 16)
            ) {
                writeStackLimit(parseFloat(value));
            }

            updateDouble(indexComp, indexElem);

            if (typeof window !== "undefined") {
                btn_glow(element.name, "FP");
            }
        } else {
            const precisionType = component.double_precision_type;

            if (precisionType === "linked") {
                element.value = bi_doubleToBigInt(value);
                updateSimple(indexComp, indexElem);
            } else {
                const regType = register_type || "DFP-Reg";

                if (regType === "SFP-Reg") {
                    // Special case for RISC-V D extension.
                    // Registers are 64 bits but the
                    // value is a 32-bit float.
                    // See RISC-V ISA spec, section 21.2,
                    // NaN Boxing of Narrower Values
                    element.value = toNaNBoxedBigInt(value);
                }
                if (regType === "DFP-Reg") {
                    element.value = bi_doubleToBigInt(value);
                }
            }

            creator_callstack_writeRegister(indexComp, indexElem);

            if (typeof window !== "undefined") {
                btn_glow(element.name, "DFP");
            }
        }
    }
}
