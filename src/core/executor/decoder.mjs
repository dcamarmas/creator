/*
 *  Copyright 2018-2025 Felix Garcia Carballeira, Alejandro Calderon Mateos, Diego Camarmas Alonso,
 *  Jorge Ramos Santana
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

import { architecture } from "../core.mjs";
import { logger } from "../utils/creator_logger.mjs";

// Bit position constants
const WORD_SIZE = 32;
const WORD_SIZE_MINUS_1 = WORD_SIZE - 1;
const BINARY_BASE = 2;
const DECIMAL_BASE = 10;

/**
 * Returns the register name given its binary representation and type
 *
 * @param {string} type - The register type (e.g., "int_registers", "fp_registers", "ctrl_registers")
 * @param {string} binaryValue - The binary representation of the register
 * @returns {string|null} - The register name or null if not found
 */
function get_register_binary(type, binaryValue) {
    // Find the component that matches the requested register type
    for (const component of architecture.components) {
        if (component.type !== type) {
            continue;
        }

        // Find the register whose index matches the binary value
        for (
            let registerIndex = 0;
            registerIndex < component.elements.length;
            registerIndex++
        ) {
            const registerBinaryValue = registerIndex
                .toString(BINARY_BASE)
                .padStart(binaryValue.length, "0");

            if (registerBinaryValue === binaryValue) {
                return component.elements[registerIndex].name[0];
            }
        }
    }

    return null;
}

/**
 * Finds the position of the operation code field (co) within the instruction fields
 *
 * @param {Array} fields - Array of instruction fields
 * @returns {Object|null} - An object with startbit and stopbit properties, or null if not found
 */
function findCoFieldPosition(fields) {
    for (const field of fields) {
        if (field.type === "co") {
            return {
                startbit:
                    WORD_SIZE_MINUS_1 - parseInt(field.startbit, DECIMAL_BASE),
                stopbit: WORD_SIZE - parseInt(field.stopbit, DECIMAL_BASE),
            };
        }
    }
    return null;
}

function checkCopFields(instruction, instructionExecParts) {
    let numCopFields = 0;
    let numMatchingCopFields = 0;

    for (const field of instruction.fields) {
        if (field.type !== "cop") {
            continue;
        }

        numCopFields++;

        const fieldValue = instructionExecParts[0].substring(
            instruction.nwords * WORD_SIZE_MINUS_1 - field.startbit,
            instruction.nwords * WORD_SIZE - field.stopbit,
        );

        if (field.valueField === fieldValue) {
            numMatchingCopFields++;
        }
    }

    return numCopFields === numMatchingCopFields;
}

function convertToSignedValue(binaryValue) {
    let value = parseInt(binaryValue, BINARY_BASE);
    if (binaryValue.charAt(0) === "1") {
        value -= Math.pow(BINARY_BASE, binaryValue.length);
    }
    return value;
}

/**
 * Computes the bits_order array from startbit and stopbit arrays
 *
 * @param {Array<number>} startbit - Array of starting bit positions
 * @param {Array<number>} stopbit - Array of stopping bit positions
 * @returns {Array<number>} - Array of bit positions in order
 */
function computeBitsOrder(startbit, stopbit) {
    const bitsOrder = [];

    for (let i = 0; i < startbit.length; i++) {
        // For each range [stopbit[i], startbit[i]], add all bits in the range
        // Note: In the architecture spec, startbit >= stopbit
        for (let bit = startbit[i]; bit >= stopbit[i]; bit--) {
            bitsOrder.push(bit);
        }
    }

    return bitsOrder;
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
                instruction_nwords * WORD_SIZE_MINUS_1 - field.startbit,
                instruction_nwords * WORD_SIZE - field.stopbit,
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
                 *  startbit and stopbit map the bits in the immediate to the bits in the instruction, in order
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
                 *  So startbit and stopbit would be:
                 *  startbit = [31, 7, 30, 11]
                 *  stopbit = [31, 7, 25, 8]
                 *
                 *  The calculated bitsOrder would be: [31, 7, 30, 29, 28, 27, 26, 25, 11, 10, 9, 8]
                 *  And padding would be 1, since the LSB is always 0
                 *  (see RISC-V spec, section 2.3 and
                 *  https://stackoverflow.com/questions/58414772/why-are-risc-v-s-b-and-u-j-instruction-types-encoded-in-this-way
                 *  for more information)
                 *
                 *  The above example is for RISC-V's B-type instructions, but the same
                 *  logic applies to J-type instructions, even though the immediate is contiguous.
                 */
                const bitsOrder = computeBitsOrder(
                    field.startbit,
                    field.stopbit,
                );

                for (const bit of bitsOrder) {
                    binaryValue += instructionExec.charAt(
                        WORD_SIZE_MINUS_1 - bit,
                    );
                }
                // Now, check field.padding to see if we need to add padding
                // We need to do this to support RISC-V's B-type instructions, which
                // actually have a 13-bit immediate encoded in 12 bits, since the LSB is always 0.
                // Honesly, this is a bit of a hack, but its needed to support RISC-V
                const padding = parseInt(field.padding, DECIMAL_BASE);
                if (padding > 0) {
                    binaryValue += "0".repeat(padding);
                }

                value = parseInt(binaryValue, BINARY_BASE);
                // Signed immediates need to be sign-extended
                if (
                    field.type === "inm-signed" ||
                    field.type === "offset_words" ||
                    field.type === "offset_bytes"
                ) {
                    value = convertToSignedValue(binaryValue);
                }
            } else {
                // Handle normal case where the immediate is contiguous and ordered
                // For example, the immediate in RISC-V's I and U-type instructions

                const binaryValue = instructionExec.substring(
                    instruction_nwords * WORD_SIZE_MINUS_1 - field.startbit,
                    instruction_nwords * WORD_SIZE - field.stopbit,
                );

                value = parseInt(binaryValue, BINARY_BASE);
                if (
                    field.type === "inm-signed" ||
                    field.type === "offset_words" ||
                    field.type === "offset_bytes"
                ) {
                    value = convertToSignedValue(binaryValue);
                }
            }
            break;
        }
        default:
            logger.error("Unknown field type: " + field.type);
    }
    return value;
}

/**
 * Parse signature definition and create regex for instruction matching
 *
 * @param {Object} instruction - The instruction object containing signature information
 * @returns {Object} Object containing parsed signature elements
 */
function parseSignatureDefinition(instruction) {
    let signatureDef = instruction.signature_definition.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
    );
    signatureDef = signatureDef.replace(/[fF][0-9]+/g, "(.*?)");
    const signature = instruction.signature.replace(/,/g, " ");
    const re = new RegExp(signatureDef + "$");
    const signatureMatch = re.exec(signature);
    const signatureRawMatch = re.exec(instruction.signatureRaw);

    return {
        signatureDef,
        signature,
        signatureMatch,
        signatureRawMatch,
    };
}

function decodeBinaryFormat(
    instruction,
    instructionExec,
    instructionExecParts,
) {
    const coPosition = findCoFieldPosition(instruction.fields);
    if (
        !coPosition ||
        instruction.co !==
            instructionExecParts[0].substring(
                coPosition.startbit,
                coPosition.stopbit,
            )
    ) {
        return null;
    }

    if (instruction.cop !== null && instruction.cop !== "") {
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
    const parsedSignature = parseSignatureDefinition(instruction);

    return {
        signatureDef: parsedSignature.signatureDef,
        instruction_loaded,
        signatureParts: Array.from(parsedSignature.signatureMatch).slice(1),
        signatureRawParts: Array.from(parsedSignature.signatureRawMatch).slice(
            1,
        ),
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

    const parsedSignature = parseSignatureDefinition(instruction);

    if (!parsedSignature.signatureMatch || !parsedSignature.signatureRawMatch) {
        return null;
    }

    return {
        type: instruction.type,
        signatureDef: parsedSignature.signatureDef,
        signatureParts: Array.from(parsedSignature.signatureMatch).slice(1),
        signatureRawParts: Array.from(parsedSignature.signatureRawMatch).slice(
            1,
        ),
        auxDef: instruction.definition,
        nwords: instruction.nwords,
    };
}

export function decode_instruction(instructionExec) {
    const instructionExecParts = instructionExec.split(" ");
    const isBinary = /^[01]+$/.test(instructionExecParts[0]);

    // Process based on instruction type (binary or assembly)
    if (isBinary) {
        // Try to decode binary format
        for (const instruction of architecture.instructions) {
            const decodedBinary = decodeBinaryFormat(
                instruction,
                instructionExec,
                instructionExecParts,
            );
            if (decodedBinary) {
                return {
                    type: instruction.type,
                    signatureDef: decodedBinary.signatureDef,
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
        }
    } else {
        // Try to decode assembly format
        for (const instruction of architecture.instructions) {
            const decodedAssembly = decodeAssemblyFormat(
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
