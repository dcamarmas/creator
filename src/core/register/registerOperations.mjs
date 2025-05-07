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
 *
 */
"use strict";
import {
    bi_intToBigInt,
    bi_BigIntTofloat,
    bi_BigIntTodouble,
    bi_floatToBigInt,
    bi_doubleToBigInt,
} from "../utils/bigint.mjs";
import { architecture, status } from "../core.mjs";
import { packExecute, writeStackLimit } from "../executor/executor.mjs";
import { instructions } from "../compiler/compiler.mjs";
import { updateDouble, updateSimple } from "./fpRegisterSync.mjs";
import { creator_callstack_writeRegister } from "../sentinel/sentinel.mjs";
import { logger } from "../utils/creator_logger.mjs";

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
        architecture.components[indexComp].elements[
            indexElem
        ].properties.includes("read") !== true
    ) {
        for (let i = 0; i < instructions.length; i++) {
            draw.space.push(i);
        }
        draw.danger.push(status.execution_index);

        throw packExecute(
            true,
            "The register " +
                architecture.components[indexComp].elements[
                    indexElem
                ].name.join(" | ") +
                " cannot be read",
            "danger",
            null,
        );
    }

    if (
        architecture.components[indexComp].type == "ctrl_registers" ||
        architecture.components[indexComp].type == "int_registers"
    ) {
        logger.debug(
            `Reading ${architecture.components[indexComp].type} [${indexComp}][${indexElem}] ${architecture.components[indexComp].elements[indexElem].name.join("|")}: 0x${architecture.components[indexComp].elements[indexElem].value.toString(16)}`,
        );
        return architecture.components[indexComp].elements[indexElem].value;
        
    }

    if (architecture.components[indexComp].type == "fp_registers") {
        if (architecture.components[indexComp].double_precision === false) {
            const value = bi_BigIntTofloat(
                architecture.components[indexComp].elements[indexElem].value,
            );
            logger.debug(
                `Reading float register [${indexComp}][${indexElem}] ${architecture.components[indexComp].elements[indexElem].name.join("|")}: ${value}`,
            );
            return value;
        } else {
            if (
                architecture.components[indexComp].double_precision_type ==
                "linked"
            ) {
                const value = bi_BigIntTodouble(
                    architecture.components[indexComp].elements[indexElem]
                        .value,
                );
                logger.debug(
                    `Reading linked double register [${indexComp}][${indexElem}] ${architecture.components[indexComp].elements[indexElem].name.join("|")}: ${value}`,
                );
                return value;
            } else {
                if (typeof register_type === "undefined") {
                    register_type = "DFP-Reg";
                }
                if (register_type === "SFP-Reg") {
                    const value = bi_BigIntTofloat(
                        architecture.components[indexComp].elements[indexElem]
                            .value,
                    );
                    logger.debug(
                        `Reading single-precision register [${indexComp}][${indexElem}] ${architecture.components[indexComp].elements[indexElem].name.join("|")}: ${value}`,
                    );
                    return value;
                }
                if (register_type === "DFP-Reg") {
                    const value = bi_BigIntTodouble(
                        architecture.components[indexComp].elements[indexElem]
                            .value,
                    );
                    logger.debug(
                        `Reading double-precision register [${indexComp}][${indexElem}] ${architecture.components[indexComp].elements[indexElem].name.join("|")}: ${value}`,
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

    if (value == null) {
        return;
    }

    if (
        architecture.components[indexComp].type == "int_registers" ||
        architecture.components[indexComp].type == "ctrl_registers"
    ) {
        if (
            architecture.components[indexComp].elements[
                indexElem
            ].properties.includes("write") !== true
        ) {
            if (
                architecture.components[indexComp].elements[
                    indexElem
                ].properties.includes("ignore_write") !== false
            ) {
                return;
            }

            for (let i = 0; i < instructions.length; i++) {
                draw.space.push(i);
            }
            draw.danger.push(status.execution_index);

            throw packExecute(
                true,
                "The register " +
                    architecture.components[indexComp].elements[
                        indexElem
                    ].name.join(" | ") +
                    " cannot be written",
                "danger",
                null,
            );
        }
        
        architecture.components[indexComp].elements[indexElem].value = value;
        creator_callstack_writeRegister(indexComp, indexElem);

        if (
            architecture.components[indexComp].elements[
                indexElem
            ].properties.includes("stack_pointer") !== false &&
            value != parseInt(architecture.memory_layout[4].value)
        ) {
            writeStackLimit(parseInt(bi_intToBigInt(value, 10)));
        }

        if (typeof window !== "undefined") {
            btn_glow(
                architecture.components[indexComp].elements[indexElem].name,
                "Int",
            );
        }
    } else if (architecture.components[indexComp].type == "fp_registers") {
        if (architecture.components[indexComp].double_precision === false) {
            if (
                architecture.components[indexComp].elements[
                    indexElem
                ].properties.includes("write") !== true
            ) {
                if (
                    architecture.components[indexComp].elements[
                        indexElem
                    ].properties.includes("ignore_write") !== false
                ) {
                    return;
                }
                draw.danger.push(status.execution_index);

                throw packExecute(
                    true,
                    "The register " +
                        architecture.components[indexComp].elements[
                            indexElem
                        ].name.join(" | ") +
                        " cannot be written",
                    "danger",
                    null,
                );
            }

            //architecture.components[indexComp].elements[indexElem].value = parseFloat(value); //TODO: float2bin -> bin2hex -> hex2big_int //TODO
            architecture.components[indexComp].elements[indexElem].value =
                bi_floatToBigInt(value);
            creator_callstack_writeRegister(indexComp, indexElem);

            if (
                architecture.components[indexComp].elements[
                    indexElem
                ].properties.includes("stack_pointer") !== false &&
                value != parseInt(architecture.memory_layout[4].value)
            ) {
                writeStackLimit(parseFloat(value));
            }

            updateDouble(indexComp, indexElem);

            if (typeof window !== "undefined") {
                btn_glow(
                    architecture.components[indexComp].elements[indexElem].name,
                    "FP",
                );
            }
        } else if (
            architecture.components[indexComp].double_precision === true
        ) {
            if (
                architecture.components[indexComp].elements[
                    indexElem
                ].properties.includes("write") !== true
            ) {
                if (
                    architecture.components[indexComp].elements[
                        indexElem
                    ].properties.includes("ignore_write") !== false
                ) {
                    return;
                }
                draw.danger.push(status.execution_index);

                throw packExecute(
                    true,
                    "The register " +
                        architecture.components[indexComp].elements[
                            indexElem
                        ].name.join(" | ") +
                        " cannot be written",
                    "danger",
                    null,
                );
            }

            if (
                architecture.components[indexComp].double_precision_type ==
                "linked"
            ) {
                //architecture.components[indexComp].elements[indexElem].value = parseFloat(value); //TODO
                architecture.components[indexComp].elements[indexElem].value =
                    bi_doubleToBigInt(value);
                updateSimple(indexComp, indexElem);
            } else {
                if (typeof register_type === "undefined") {
                    register_type = "DFP-Reg";
                }
                if (register_type === "SFP-Reg") {
                    architecture.components[indexComp].elements[
                        indexElem
                    ].value = bi_floatToBigInt(value);
                }
                if (register_type === "DFP-Reg") {
                    architecture.components[indexComp].elements[
                        indexElem
                    ].value = bi_doubleToBigInt(value);
                }
            }

            creator_callstack_writeRegister(indexComp, indexElem);

            if (typeof window !== "undefined") {
                btn_glow(
                    architecture.components[indexComp].elements[indexElem].name,
                    "DFP",
                );
            }
        }
    }
}
