/**
 *  Copyright 2018-2025 Felix Garcia Carballeira, Alejandro Calderon Mateos,
 *                      Diego Camarmas Alonso
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

import { REGISTERS } from "../core.mjs";
import { clean_string } from "../utils/utils.mjs";
import { console_log, logger } from "../utils/creator_logger.mjs";

// --------------------------------------------------------------
// These can be used used by the eval in buildInstructionPreload, but the linter doesn't know that
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { instructions } from "../assembler/assembler.mjs";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    readRegister,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    writeRegister,
} from "../register/registerOperations.mjs";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { status } from "@/core/core.mjs"
// --------------------------------------------------------------

export function handleIntOrCtrlReg(
    _signaturePart,
    signatureRawPart,
    instructionExecPart,
    signatureType,
    auxDef,
) {
    const result = {
        reading: "",
        reading_prev: "",
        reading_name: "",
        writing: "",
    };

    for (let j = 0; j < REGISTERS.length; j++) {
        for (let z = REGISTERS[j].elements.length - 1; z >= 0; z--) {
            if (REGISTERS[j].elements[z].name.includes(instructionExecPart)) {
                result.reading = `var ${signatureRawPart}      = BigInt(readRegister (${j} ,${z}, "${signatureType}"));\n`;
                result.reading_prev = `var ${signatureRawPart}_prev = BigInt(readRegister (${j} ,${z}, "${signatureType}"));\n`;
                result.reading_name = `var ${signatureRawPart}_name = '${instructionExecPart}';\n`;

                const re = new RegExp(
                    `(?:\\W|^)((${signatureRawPart}) *=)[^=]`,
                    "g",
                );
                if (auxDef.search(re) !== -1) {
                    result.writing = `writeRegister(${signatureRawPart}, ${j}, ${z}, "${signatureType}");\n`;
                } else {
                    result.writing = `if(${signatureRawPart} != ${signatureRawPart}_prev) { writeRegister(${signatureRawPart} ,${j} ,${z}, "${signatureType}"); }\n`;
                }
            }
        }
    }
    return result;
}
export function handleFloatingPointReg(
    _signaturePart,
    signatureRawPart,
    instructionExecPart,
    signatureType,
    auxDef,
) {
    const result = {
        reading: "",
        reading_prev: "",
        reading_name: "",
        writing: "",
    };

    for (let j = 0; j < REGISTERS.length; j++) {
        for (let z = REGISTERS[j].elements.length - 1; z >= 0; z--) {
            if (REGISTERS[j].elements[z].name.includes(instructionExecPart)) {
                result.reading = `var ${signatureRawPart}      = readRegister (${j} ,${z}, "${signatureType}");\n`;
                result.reading_prev = `var ${signatureRawPart}_prev = readRegister (${j} ,${z}, "${signatureType}");\n`;
                result.reading_name = `var ${signatureRawPart}_name = '${instructionExecPart}';\n`;

                const re = new RegExp(
                    `(?:\\W|^)((${signatureRawPart}) *=)[^=]`,
                    "g",
                );
                if (auxDef.search(re) !== -1) {
                    result.writing = `writeRegister(${signatureRawPart}, ${j}, ${z}, "${signatureType}");\n`;
                } else {
                    result.writing = `if(Math.abs(${signatureRawPart} != ${signatureRawPart}_prev)) { writeRegister(${signatureRawPart} ,${j} ,${z}, "${signatureType}"); }\n`;
                }
            }
        }
    }
    return result;
}
export function handleOtherTypes(
    signaturePart,
    signatureRawPart,
    instructionExecPart,
    _auxDef,
) {
    const result = {
        reading: "",
        reading_prev: "",
        reading_name: "",
        writing: "",
    };
    if (signaturePart === "skip") {
        // Skip this part. This is used to add comments in the actual instruction
        return result;
    }
    if (signaturePart === "enum") {
        return result;
    }

    if (signaturePart === "offset_words") {
        if (instructionExecPart.startsWith("0x")) {
            let value = parseInt(instructionExecPart, 16);
            const nbits = 4 * (instructionExecPart.length - 2);
            let value_bin = value.toString(2).padStart(nbits, "0");

            if (value_bin[0] === "1") {
                value_bin = "".padStart(32 - nbits, "1") + value_bin;
            } else {
                value_bin = "".padStart(32 - nbits, "0") + value_bin;
            }
            value = parseInt(value_bin, 2) >> 0;
            instructionExecPart = value;
        }
    }

    if (signaturePart.includes("float")) {
        result.reading = `var ${signatureRawPart} = Number(${instructionExecPart});\n`;
    } else {
        result.reading = `var ${signatureRawPart} = BigInt(${instructionExecPart});\n`;
    }

    return result;
}

export function buildDescriptions(definitions) {
    return {
        readings:
            Object.values(definitions.readings).join("") +
            Object.values(definitions.readings_prev).join("") +
            Object.values(definitions.readings_name).join(""),
        writings: Object.values(definitions.writings).join(""),
    };
}

export function processRegisterOperations(auxDef, signatureParts) {
    let readings_description = "";
    let writings_description = "";

    for (let i = 0; i < REGISTERS.length; i++) {
        for (let j = REGISTERS[i].elements.length - 1; j >= 0; j--) {
            let clean_name;
            const clean_aliases = REGISTERS[i].elements[j].name
                .map(x => clean_string(x, "reg_"))
                .join("|");

            // Check if this register is PC
            const isPC = REGISTERS[i].elements[j].name.some(
                name => name.toUpperCase() === "PC",
            );

            // Handle write operations
            let re = new RegExp(
                "(?:\\W|^)(((" + clean_aliases + ") *=)[^=])",
                "g",
            );
            if (auxDef.search(re) !== -1) {
                re = new RegExp("(" + clean_aliases + ")");
                const reg_name = re.exec(auxDef)[0];
                clean_name = clean_string(reg_name, "reg_");

                if (isPC) {
                    // Special handling for PC write
                    writings_description += `\nstatus.virtual_PC = ${clean_name};`;
                } else {
                    // Normal register write
                    writings_description += `\nwriteRegister(${clean_name}, ${i}, ${j}, "${signatureParts[i]}");`;
                }
            }

            // Handle read operations
            re = new RegExp("([^a-zA-Z0-9])(?:" + clean_aliases + ")");
            if (auxDef.search(re) !== -1) {
                re = new RegExp("(" + clean_aliases + ")");
                const reg_name = re.exec(auxDef)[0];
                clean_name = clean_string(reg_name, "reg_");

                if (isPC) {
                    // Special handling for PC read
                    readings_description += `var ${clean_name}      = status.virtual_PC;\n`;
                    readings_description += `var ${clean_name}_name = 'PC';\n`;
                } else {
                    // Normal register read
                    readings_description += `var ${clean_name}      = readRegister(${i} ,${j}, "${signatureParts[i]}");\n`;
                    readings_description += `var ${clean_name}_name = '${clean_name}';\n`;
                }
            }
        }
    }

    return { readings_description, writings_description };
}

export function handleInstructionMatch(instructionExec, signatureDef) {
    const re = new RegExp(signatureDef + "$");
    const match = re.exec(instructionExec);
    const instructionExecParts = [];

    for (let j = 1; j < match.length; j++) {
        instructionExecParts.push(match[j]);
    }

    return instructionExecParts;
}

export function collectDefinitions(
    signatureRawParts,
    signatureParts,
    instructionExecParts,
    auxDef,
) {
    const definitions = {
        readings: {},
        readings_prev: {},
        readings_name: {},
        writings: {},
    };

    for (let i = 1; i < signatureRawParts.length; i++) {
        let result;
        const params = {
            signaturePart: signatureParts[i],
            signatureRawPart: signatureRawParts[i],
            instructionExecPart: instructionExecParts[i],
            signatureType: signatureParts[i],
            auxDef,
        };

        if (
            signatureParts[i] === "INT-Reg" ||
            signatureParts[i] === "Ctrl-Reg"
        ) {
            result = handleIntOrCtrlReg(...Object.values(params));
        } else if (
            signatureParts[i] === "SFP-Reg" ||
            signatureParts[i] === "DFP-Reg"
        ) {
            result = handleFloatingPointReg(...Object.values(params));
        } else {
            result = handleOtherTypes(...Object.values(params));
        }

        if (result.reading)
            definitions.readings[signatureRawParts[i]] = result.reading;
        if (result.reading_prev)
            definitions.readings_prev[signatureRawParts[i]] =
                result.reading_prev;
        if (result.reading_name)
            definitions.readings_name[signatureRawParts[i]] =
                result.reading_name;
        if (result.writing)
            definitions.writings[signatureRawParts[i]] = result.writing;
    }

    return definitions;
}

export function buildInstructionPreload(decoded) {
    // Extract properties from decoded object
    const {
        signatureDef,
        instructionExec,
        signatureRawParts,
        signatureParts,
        auxDef,
    } = decoded;

    // Extract instruction parts
    const instructionExecParts = handleInstructionMatch(
        instructionExec,
        signatureDef,
    );
    console_log("instructionExecParts: " + instructionExecParts, "DEBUG");

    // These markers are used to separate the user-defined part of the
    // instruction from the preoperation and postoperation fields.
    let userDefinition = auxDef.split("// BEGIN USERDEF")[1];
    userDefinition = userDefinition.split("// END USERDEF")[0];

    // Collect all definitions
    const definitions = collectDefinitions(
        signatureRawParts,
        signatureParts,
        instructionExecParts,
        userDefinition,
    );

    // Build descriptions
    let { readings, writings } = buildDescriptions(definitions);

    // Handle component operations
    const {
        readings_description: componentReadings,
        writings_description: componentWritings,
    } = processRegisterOperations(auxDef, signatureParts);

    readings += componentReadings;
    writings += componentWritings;

    // Build final definition
    const finalDef = [
        "\n/* Read all instruction fields */\n",
        readings,
        "\n/* Original instruction definition */\n",
        auxDef,
        "\n\n/* Modify values */\n",
        writings,
    ].join("");

    // Create and return preload function
    function preloadFunction() {
        try {
            eval(finalDef);
        } catch (e) {
            throw e;
        }
    }

    return preloadFunction;
}
