/*
 *  Copyright 2018-2025 Felix Garcia Carballeira, Alejandro Calderon Mateos, Diego Camarmas Alonso, Jorge Ramos Santana
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

import { isNull } from "node:util";
import { instructions } from "../compiler/compiler.mjs";
import { architecture } from "../core.mjs";
import { logger } from "../utils/creator_logger.mjs";

function get_register_binary(type, bin) {
    for (let i = 0; i < architecture.components.length; i++) {
        if (architecture.components[i].type == type) {
            for (
                let j = 0;
                j < architecture.components[i].elements.length;
                j++
            ) {
                const len = bin.length;
                if (j.toString(2).padStart(len, "0") == bin) {
                    return architecture.components[i].elements[j].name[0];
                }
            }
        }
    }
    return null;
}

function findCoFieldPosition(fields) {
    for (let y = 0; y < fields.length; y++) {
        if (fields[y].type == "co") {
            return {
                startbit: 31 - parseInt(fields[y].startbit, 10),
                stopbit: 32 - parseInt(fields[y].stopbit, 10),
            };
        }
    }
    return null;
}

function checkCopFields(instruction, instructionExecParts) {
    let numCop = 0;
    let numCopCorrect = 0;

    for (let j = 0; j < instruction.fields.length; j++) {
        if (instruction.fields[j].type == "cop") {
            numCop++;
            if (
                instruction.fields[j].valueField ==
                instructionExecParts[0].substring(
                    instruction.nwords * 31 - instruction.fields[j].startbit,
                    instruction.nwords * 32 - instruction.fields[j].stopbit,
                )
            ) {
                numCopCorrect++;
            }
        }
    }
    return numCop === numCopCorrect;
}

// eslint-disable-next-line max-lines-per-function
function processInstructionField(field, instructionExec, instruction_nwords) {
    let value = null;

    switch (field.type) {
        case "co":
            value = field.name;
            break;

        case "INT-Reg":
        case "SFP-Reg":
        case "DFP-Reg":
        case "Ctrl-Reg": {
            const bin = instructionExec.substring(
                instruction_nwords * 31 - field.startbit,
                instruction_nwords * 32 - field.stopbit,
            );
            let convertedType = null;
            // The register type in the instruction is different from the one in the architecture
            switch (field.type) {
                case "INT-Reg":
                    convertedType = "int_registers";
                    break;
                case "SFP-Reg":
                case "DFP-Reg":
                    convertedType = "fp_registers";
                    break;
                case "Ctrl-Reg":
                    convertedType = "ctrl_registers";
                    break;
                default:
                    logger.error("Unknown register type: " + field.type);
            }

            value = get_register_binary(convertedType, bin);
            break;
        }
        case "inm-signed":
        case "inm-unsigned":
        case "address":
        case "offset_bytes":
        case "offset_words": {
            // Check if field has non-contiguous bits
            if (Array.isArray(field.startbit)) {
                let binaryValue = "";
                /*
                 *  bits_order maps the bits in the immediate to the bits in the instruction, in order
                 *  RISC-V example (B-type instruction):
                 *
                 *  31     30-25    24-20   19-15   14-12   11-8    7      6-0
                 *  ┌────┬──────────┬───────┬───────┬───────┬──────┬────┬─────────┐
                 *  │ imm│  imm     │  rs2  │  rs1  │ func3 │ imm  │imm │ opcode  │
                 *  │[12]│  [10:5]  │       │       │       │[4:1] │[11]│         │
                 *  └──┬─┴────┬─────┴───┬───┴───┬───┴───┬───┴──┬───┴────┴────┬────┘
                 *     │      │         │       │       │      │             │
                 *     1      6         5       5       3      4       1     7    bits = 32 bits = word size
                 *
                 *  Notice how the immediate is all over the place, and not contiguous.
                 *
                 *  In this case, the mapping would be:
                 *  imm[12] -> 31
                 *  imm[11] -> 7
                 *  imm[10:5] -> 30-25
                 *  imm[4:1] -> 11-8
                 *
                 *  So bits_order would be [31, 7, 30, 29, 28, 27, 26, 25, 11, 10, 9, 8]
                 *  And padding would be 1, since the LSB is always 0
                 *  (see RISC-V spec, section 2.3 and
                 *  https://stackoverflow.com/questions/58414772/why-are-risc-v-s-b-and-u-j-instruction-types-encoded-in-this-way
                 *  for more information)
                 */

                if (field.bits_order) {
                    for (const bit of field.bits_order) {
                        binaryValue += instructionExec.charAt(31 - bit);
                    }
                    // Now, check field.padding to see if we need to add padding
                    // We need to do this to support RISC-V's B-type instructions, which
                    // actually have a 13-bit immediate encoded in 12 bits, since the LSB is always 0.
                    // Honesly, this is a bit of a hack, but its needed to support RISC-V
                    const padding = parseInt(field.padding, 10);
                    if (padding > 0) {
                        binaryValue += "0".repeat(padding);
                    }
                } else {
                    // This assumes that the immediate is not contiguous, but the bits are in order
                    // For example, the immediate in RISC-V's S-type instructions
                    for (let i = 0; i < field.startbit.length; i++) {
                        binaryValue += instructionExec.substring(
                            instruction_nwords * 31 - field.startbit[i],
                            instruction_nwords * 32 - field.stopbit[i],
                        );
                    }
                }
                value = parseInt(binaryValue, 2);
            } else {
                // Handle contiguous case
                // For example, the immediate in RISC-V's I and U-type instructions
                const binaryValue = instructionExec.substring(
                    instruction_nwords * 31 - field.startbit,
                    instruction_nwords * 32 - field.stopbit,
                );
                value = parseInt(binaryValue, 2);
            }
            break;
        }
        default:
            logger.error("Unknown field type: " + field.type);
    }
    return value;
}

function decodeBinaryFormat(
    instruction,
    instructionExec,
    instructionExecParts,
) {
    const coPosition = findCoFieldPosition(instruction.fields);
    if (
        !coPosition ||
        instruction.co !=
            instructionExecParts[0].substring(
                coPosition.startbit,
                coPosition.stopbit,
            )
    ) {
        return null;
    }

    if (instruction.cop != null && instruction.cop != "") {
        if (!checkCopFields(instruction, instructionExecParts)) {
            return null;
        }
    }

    let instruction_loaded = instruction.signature_definition;

    // Process each field
    for (let f = 0; f < instruction.fields.length; f++) {
        const re = new RegExp("[Ff]" + f);
        if (instruction_loaded.search(re) !== -1) {
            const value = processInstructionField(
                instruction.fields[f],
                instructionExec,
                instruction.nwords,
            );
            instruction_loaded = instruction_loaded.replace(
                new RegExp("[Ff]" + f, "g"),
                value,
            );
        }
    }

    // Extract signature parts from decoded instruction
    const signatureRaw = instruction.signatureRaw;
    const signatureRawParts = signatureRaw.split(" ");
    const signatureParts = instruction.signature.split(",");

    return {
        instruction_loaded,
        signatureParts,
        signatureRawParts,
    };
}

function decodeAssemblyFormat(instruction, instructionExecParts) {
    const auxSig = instruction.signatureRaw.split(" ");
    if (
        instruction.name !== instructionExecParts[0] ||
        instructionExecParts.length !== auxSig.length
    ) {
        return null;
    }

    let signatureDef = instruction.signature_definition.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
    );
    signatureDef = signatureDef.replace(/[fF][0-9]+/g, "(.*?)");

    const signature = instruction.signature.replace(/,/g, " ");
    const re = new RegExp(signatureDef + "$");

    const signatureMatch = re.exec(signature);
    const signatureRawMatch = re.exec(instruction.signatureRaw);

    if (!signatureMatch || !signatureRawMatch) {
        return null;
    }

    return {
        type: instruction.type,
        signatureDef,
        signatureParts: Array.from(signatureMatch).slice(1),
        signatureRawParts: Array.from(signatureRawMatch).slice(1),
        auxDef: instruction.definition,
        nwords: instruction.nwords,
    };
}

export function decode_instruction(instructionExec) {
    const instructionExecParts = instructionExec.split(" ");
    let decodedBinary;
    let decodedAssembly;

    const isBinary = /^[01]+$/.test(instructionExecParts[0]);

    // Try to decode each instruction format
    for (const instruction of architecture.instructions) {
        if (isBinary) {
            decodedBinary = decodeBinaryFormat(
                instruction,
                instructionExec,
                instructionExecParts,
            );
            if (decodedBinary) {
                let signatureDef = instruction.signature_definition;
                signatureDef = signatureDef.replace(/[fF][0-9]+/g, "(.*?)");
                return {
                    type: instruction.type,
                    signatureDef: signatureDef,
                    signatureParts: decodedBinary.signatureParts,
                    signatureRawParts: decodedBinary.signatureRawParts,
                    instructionExec: decodedBinary.instruction_loaded,
                    instructionExecParts:
                        decodedBinary.instruction_loaded.split(" "),
                    auxDef: instruction.definition,
                    nwords: instruction.nwords,
                    binary: true,
                };
            }
            continue; // Skip assembly decode for binary instructions
        }

        decodedAssembly = decodeAssemblyFormat(
            instruction,
            instructionExecParts,
        );
        if (decodedAssembly) {
            return {
                ...decodedAssembly,
                instructionExec,
                instructionExecParts,
                binary: false,
            };
        }
    }

    // No match found
    logger.error("No match found for instruction: " + instructionExec);
    return {
        type: "",
        signatureDef: "",
        signatureParts: [],
        signatureRawParts: [],
        instructionExec,
        instructionExecParts,
        auxDef: "",
        nwords: 1,
        binary: false,
    };
}
