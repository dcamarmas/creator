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
 */

import { architecture, ENDIANNESS, REGISTERS, WORDSIZE } from "../core.mjs";
import { logger } from "../utils/creator_logger.mjs";
const BINARY_BASE = 2;
const DECIMAL_BASE = 10;

// Custom fields (rounding mode)

const ROUNDING_MODE = {
    0: "rne",
    1: "rtz",
    2: "rdn",
    3: "rup",
    4: "rmm",
    7: "dyn",
};

/**
 * Returns the register name given its binary representation and type
 *
 * @param {string} type - The register type (e.g., "int_registers", "fp_registers", "ctrl_registers")
 * @param {string} binaryValue - The binary representation of the register
 * @returns {string|null} - The register name or null if not found
 */
function get_register_binary(type, binaryValue) {
    // Find the component that matches the requested register type
    for (const component of REGISTERS) {
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
 * Finds the position of the operation code field within the instruction fields
 *
 * @param {Array} fields - Array of instruction fields
 * @returns {Object|null} - An object with startbit and stopbit properties, or null if found
 */
function extractOpcode(fields) {
    for (const field of fields) {
        if (field.type === "co") {
            let startbit = null;
            let stopbit = null;
            let value = null;
            try {
                startbit =
                    WORDSIZE - 1 - parseInt(field.startbit, DECIMAL_BASE);
                stopbit = WORDSIZE - parseInt(field.stopbit, DECIMAL_BASE);
                value = field.valueField;
            } catch (e) {
                logger.error("Error parsing opcode field: " + e);
            }

            return {
                startbit,
                stopbit,
                value,
            };
        }
    }
    return null;
}

function checkCopFields(instruction, instructionExec) {
    let numCopFields = 0;
    let numMatchingCopFields = 0;

    for (const field of instruction.fields) {
        if (field.type !== "cop") {
            continue;
        }

        numCopFields++;

        const fieldValue = instructionExec.substring(
            instruction.nwords * (WORDSIZE - 1) - field.startbit,
            instruction.nwords * WORDSIZE - field.stopbit,
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
        case "cop":
            break;
        case "INT-Reg":
        case "SFP-Reg":
        case "DFP-Reg":
        case "Ctrl-Reg": {
            const bin = instructionExec.substring(
                instruction_nwords * (WORDSIZE - 1) - field.startbit,
                instruction_nwords * WORDSIZE - field.stopbit,
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
                    binaryValue += instructionExec.charAt(WORDSIZE - 1 - bit);
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
                    instruction_nwords * (WORDSIZE - 1) - field.startbit,
                    instruction_nwords * WORDSIZE - field.stopbit,
                );

                value = parseInt(binaryValue, BINARY_BASE);
                if (
                    field.type === "inm-signed" ||
                    field.type === "offset_words" ||
                    field.type === "offset_bytes"
                ) {
                    value = convertToSignedValue(binaryValue);
                }
                /* TODO TODO TODO */
                // Handle custom fields
                if (field.custom === "rounding-mode") {
                    // Get binary value as unsigned
                    const binaryValue = instructionExec.substring(
                        instruction_nwords * (WORDSIZE - 1) - field.startbit,
                        instruction_nwords * WORDSIZE - field.stopbit,
                    );

                    // Convert to unsigned decimal
                    const decimalValue = parseInt(binaryValue, BINARY_BASE);

                    // Check if the value is a valid rounding mode
                    if (decimalValue in ROUNDING_MODE) {
                        value = ROUNDING_MODE[decimalValue];

                        // For "dyn" (7), which is the default rounding mode, return null
                        // so it can be omitted in the output
                        if (decimalValue === 7) {
                            value = null;
                        }
                    } else {
                        logger.error("Invalid rounding mode: " + decimalValue);
                    }
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
 * Replaces register names in instruction parts with their proper names (aliases)
 *
 * @param {Array<string>} instructionParts - Array of instruction parts
 * @returns {Array<string>} - Array with register names replaced with proper names
 */
function replaceRegisterNames(instructionParts) {
    if (!instructionParts || !Array.isArray(instructionParts)) {
        return instructionParts;
    }

    return instructionParts.map(part => {
        // Check if this part is a register
        for (const bank of REGISTERS) {
            if (
                bank.type !== "int_registers" &&
                bank.type !== "fp_registers" &&
                bank.type !== "ctrl_registers"
            ) {
                continue;
            }

            for (const register of bank.elements) {
                if (register.name && register.name.length > 1) {
                    // If the part matches the default name (first name in the array)
                    if (part === register.name[0]) {
                        // Return the proper name (second name in the array)
                        return register.name[1];
                    }
                }
            }
        }

        // If not a register or no proper name found, return the original part
        return part;
    });
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

// eslint-disable-next-line max-lines-per-function
function decodeBinaryFormat(
    instruction,
    encodedInstruction,
    newFormat = false,
) {
    // First check if the opcode matches
    const opcode = extractOpcode(instruction.fields);
    const binaryOpcode = encodedInstruction.substring(
        opcode.startbit,
        opcode.stopbit,
    );

    if (!opcode || opcode.value !== binaryOpcode) {
        return null;
    }

    if (!checkCopFields(instruction, encodedInstruction)) {
        return null;
    }

    // If we get here we found a match

    // Process each field
    let instructionArray = [];
    for (const field of instruction.fields) {
        let value = processInstructionField(
            field,
            encodedInstruction,
            instruction.nwords,
        );
        if (field.type === "co") {
            value = instruction.name;
        }
        if (Object.hasOwn(field, "order")) {
            if (Object.hasOwn(field, "prefix")) {
                value = field.prefix + value;
            }
            if (Object.hasOwn(field, "suffix")) {
                value += field.suffix;
            }
            if (value !== null) {
                instructionArray[field.order] = value;
            }
        }
    }

    if (instructionArray.length === 0) {
        logger.error(
            "instructionArray is empty! Did you forget the 'order' field?",
        );
        return null;
    }

    const instruction_loaded = instructionArray.join(" ");
    if (newFormat) {
        return instruction_loaded;
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

// eslint-disable-next-line max-lines-per-function
export function decode_instruction(
    toDecode,
    newFormat = false,
    skipEndianness = false, // Used in the unit tests to skip endianness check
) {
    const toDecodeArray = toDecode.split(" ");
    const isBinary = /^[01]+$/.test(toDecodeArray[0]);
    const isHex = /^0x[0-9a-fA-F]+$/.test(toDecodeArray[0]);

    // Convert hex to binary if needed
    if (isHex) {
        const hexValue = toDecodeArray[0].slice(2); // Remove "0x" prefix
        // Calculate the number of bits needed (4 bits per hex digit)
        const numBits = hexValue.length * 4;
        const binaryValue = parseInt(hexValue, 16)
            .toString(2)
            .padStart(numBits, "0");
        toDecode = binaryValue;
    }

    // Process based on instruction type (binary, hex converted to binary, or assembly)
    if (isBinary || isHex) {
        if (ENDIANNESS === "little_endian" && !skipEndianness) {
            // Split by byte
            const byteSize = 8;
            let bytes = [];
            for (let i = 0; i < toDecode.length; i += byteSize) {
                bytes.push(toDecode.substr(i, byteSize));
            }
            // Reverse the byte order
            bytes = bytes.reverse();
            // Join the bytes back together
            toDecode = bytes.join("");
        }

        // Try to decode binary format
        for (const instruction of architecture.instructions) {
            const decodedBinary = decodeBinaryFormat(
                instruction,
                toDecode,
                newFormat,
            );
            if (decodedBinary) {
                if (newFormat) {
                    return decodedBinary;
                }

                // Get instruction parts and create a version with proper register names
                const instructionExecParts =
                    decodedBinary.instruction_loaded.split(" ");
                const instructionExecPartsWithProperNames =
                    replaceRegisterNames(instructionExecParts);

                return {
                    type: instruction.type,
                    signatureDef: decodedBinary.signatureDef,
                    signatureParts: decodedBinary.signatureParts,
                    signatureRawParts: decodedBinary.signatureRawParts,
                    instructionExec: decodedBinary.instruction_loaded,
                    instructionExecParts: instructionExecParts,
                    instructionExecPartsWithProperNames:
                        instructionExecPartsWithProperNames,
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
                toDecodeArray,
            );
            if (decodedAssembly) {
                // Create a version with proper register names
                const instructionExecPartsWithProperNames =
                    replaceRegisterNames(toDecodeArray);

                return {
                    ...decodedAssembly,
                    instructionExec: toDecode,
                    instructionExecParts: toDecodeArray,
                    instructionExecPartsWithProperNames,
                    binary: false,
                };
            }
        }
    }

    // No match found
    let errorValue;
    if (isHex) {
        errorValue = toDecodeArray[0].toUpperCase();
    } else if (isBinary) {
        errorValue = `0x${parseInt(toDecode, 2).toString(16).toUpperCase()}`;
    } else {
        errorValue = `"${toDecode}"`;
    }

    throw new Error(`Unknown Instruction: ${errorValue}`);
}
