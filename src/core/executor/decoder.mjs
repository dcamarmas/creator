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
let instructionLookupCache = null;

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
 * @param {Array<Object>} fields - Array of instruction fields
 * @returns {Object|null} - An object with startbit, stopbit, and value properties, or null if not found
 */
function extractOpcode(fields) {
    for (const field of fields) {
        if (field.type === "co") {
            let startbit = null;
            let stopbit = null;
            let value = null;
            try {
                // Keep the original calculation for backward compatibility
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

/**
 * Converts a binary string to a signed integer value using two's complement
 *
 * @param {string} binaryValue - The binary string to convert
 * @returns {number} The signed integer value
 */
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

/**
 * Processes a single instruction field and extracts its value from the binary instruction
 *
 * @param {Object} field - The instruction field definition object
 * @param {string} instructionExec - The binary instruction string
 * @param {number} instruction_nwords - Number of words in the instruction
 * @returns {string|number|null} The extracted field value or null if not applicable
 */
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
        case "enum": {
            const binaryValue = instructionExec.substring(
                instruction_nwords * (WORDSIZE - 1) - field.startbit,
                instruction_nwords * WORDSIZE - field.stopbit,
            );

            // Convert to unsigned decimal
            const decimalValue = parseInt(binaryValue, BINARY_BASE);

            // Get the enum definition from architecture
            if (architecture.enums && architecture.enums[field.enum_name]) {
                const enumDef = architecture.enums[field.enum_name];

                // Find the enum name that corresponds to this value
                for (const [enumName, enumValue] of Object.entries(enumDef)) {
                    if (enumValue === decimalValue) {
                        value = enumName;
                        // TODO: This is hardcoded and specific to RISC-V. Remove this.
                        // For "dyn" (7), which is the default rounding mode, return null
                        // so it can be omitted in the output
                        if (enumName === "dyn") {
                            value = null;
                        }
                        break;
                    }
                }
            } else {
                logger.error(
                    `Enum ${field.enum_name} not found in architecture`,
                );
            }
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
 * @param {string} instruction.signature_definition - The signature definition pattern
 * @param {string} instruction.signature - The instruction signature
 * @param {string} instruction.signatureRaw - The raw instruction signature
 * @returns {Object} Object containing parsed signature elements
 * @returns {string} returns.signatureDef - Processed signature definition
 * @returns {string} returns.signature - Processed signature
 * @returns {RegExpMatchArray|null} returns.signatureMatch - Regex match result for signature
 * @returns {RegExpMatchArray|null} returns.signatureRawMatch - Regex match result for raw signature
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

/**
 * Builds a lookup table for fast instruction matching
 * Groups instructions by opcode and creates bit masks for function fields
 *
 * @returns {Map<string, Array<Object>>} A map where keys are opcode identifiers and values are arrays of instruction candidates
 */
function buildInstructionLookupTable() {
    if (instructionLookupCache) {
        return instructionLookupCache;
    }

    const lookupTable = new Map();

    for (const instruction of architecture.instructions) {
        const opcodeField = extractOpcode(instruction.fields);
        if (!opcodeField) continue;

        const key = `${opcodeField.value}_${opcodeField.startbit}_${opcodeField.stopbit}`;

        if (!lookupTable.has(key)) {
            lookupTable.set(key, []);
        }

        // Pre-compute function field masks for this instruction
        const functionMasks = [];
        for (const field of instruction.fields) {
            if (field.type === "cop") {
                functionMasks.push({
                    startbit:
                        instruction.nwords * (WORDSIZE - 1) - field.startbit,
                    stopbit: instruction.nwords * WORDSIZE - field.stopbit,
                    expectedValue: field.valueField,
                });
            }
        }

        lookupTable.get(key).push({
            instruction,
            functionMasks,
            opcodeInfo: opcodeField,
        });
    }

    instructionLookupCache = lookupTable;
    return lookupTable;
}

/**
 * Checks if two instructions only differ by one having an enum field
 * Returns the instruction with the enum field if applicable, null otherwise
 *
 * @param {Object} inst1 - First instruction object to compare
 * @param {Object} inst2 - Second instruction object to compare
 * @returns {Object|null} The instruction with enum field preference or null if no preference can be determined
 */
function checkEnumFieldPreference(inst1, inst2) {
    // Get fields that have an order (excluding co and cop fields)
    const fields1 = inst1.fields.filter(
        f => f.type !== "co" && f.type !== "cop",
    );
    const fields2 = inst2.fields.filter(
        f => f.type !== "co" && f.type !== "cop",
    );

    // If different number of fields, can't match
    if (fields1.length !== fields2.length) {
        return null;
    }

    // Sort fields by position for comparison
    const sortedFields1 = fields1.sort((a, b) => a.startbit - b.startbit);
    const sortedFields2 = fields2.sort((a, b) => a.startbit - b.startbit);

    let enumDifferences = 0;
    let enumInstruction = null;

    // Compare fields at each position
    for (let i = 0; i < sortedFields1.length; i++) {
        const field1 = sortedFields1[i];
        const field2 = sortedFields2[i];

        // Check if fields are at the same position
        if (
            field1.startbit !== field2.startbit ||
            field1.stopbit !== field2.stopbit
        ) {
            // Fields don't match by position, can't determine preference
            return null;
        }

        // Check if types differ and one is enum
        if (field1.type !== field2.type) {
            if (field1.type === "enum" && field2.type !== "enum") {
                enumDifferences++;
                enumInstruction = inst1;
            } else if (field2.type === "enum" && field1.type !== "enum") {
                enumDifferences++;
                enumInstruction = inst2;
            } else {
                // Types differ but neither is enum, or both are enum
                return null;
            }
        }
    }

    // Return the instruction with enum field only if there's exactly one difference
    return enumDifferences === 1 ? enumInstruction : null;
}

/**
 * Fast instruction matching using pre-computed lookup table
 *
 * @param {string} binaryInstruction - The binary instruction string to match
 * @returns {Object|null} The matching instruction object or null if no match found
 */
function findMatchingInstruction(binaryInstruction) {
    const lookupTable = buildInstructionLookupTable();
    const matchingInstructions = [];
    // Try different opcode positions and sizes
    const instructionLength = binaryInstruction.length;

    for (const [key, candidates] of lookupTable) {
        const [opcodeValue, startBitStr, stopBitStr] = key.split("_");
        const startBit = parseInt(startBitStr, 10);
        const stopBit = parseInt(stopBitStr, 10);
        const opcodeSize = stopBit - startBit;

        // Extract opcode from instruction at the expected position
        let extractedOpcode;
        if (startBit === 0) {
            // Opcode at the beginning
            extractedOpcode = binaryInstruction.substring(0, opcodeSize);
        } else if (stopBit === instructionLength) {
            // Opcode at the end
            extractedOpcode = binaryInstruction.substring(startBit);
        } else {
            // Opcode in the middle
            extractedOpcode = binaryInstruction.substring(startBit, stopBit);
        }

        if (extractedOpcode !== opcodeValue) continue;

        // Check candidates with this opcode
        for (const candidate of candidates) {
            if (candidate.functionMasks.length === 0) {
                // No function fields to check
                return candidate.instruction;
            }

            // Check all function fields
            let allMatch = true;
            for (const mask of candidate.functionMasks) {
                const fieldValue = binaryInstruction.substring(
                    mask.startbit,
                    mask.stopbit,
                );
                if (fieldValue !== mask.expectedValue) {
                    allMatch = false;
                    break;
                }
            }

            if (allMatch) {
                matchingInstructions.push(candidate.instruction);
            }
        }

        // If more than one match, check for enum field preference
        if (matchingInstructions.length > 1) {
            // This is a workaround due to the assembler not supporting
            // optional fields in the signature definition.
            // The way we fix this is by duplicating the instruction
            // in the architecture file. However, this breaks the
            // instruction matching logic, so we need to handle it here.

            // Check if we have exactly 2 matches and they only differ by an enum field
            if (matchingInstructions.length === 2) {
                const inst1 = matchingInstructions[0];
                const inst2 = matchingInstructions[1];

                // Compare fields to see if they only differ in one field having enum type
                const enumPreference = checkEnumFieldPreference(inst1, inst2);
                if (enumPreference !== null) {
                    return enumPreference;
                }
            }

            logger.error(
                `Ambiguous instruction match for opcode ${opcodeValue} (found ${matchingInstructions.length} matches)`,
            );
            return null;
        }
        if (matchingInstructions.length === 1) {
            return matchingInstructions[0];
        }
    }

    return null;
}

/**
 * Processes all instruction fields and returns a map of ordered results
 *
 * @param {Object} instruction - The instruction definition object
 * @param {string} binaryInstruction - The binary instruction string
 * @returns {Map<number, string|number>} Map of field order to processed field values
 */
function processAllFields(instruction, binaryInstruction) {
    const results = new Map();

    for (const field of instruction.fields) {
        if (!field.order && field.type !== "co") continue;

        const value = processInstructionField(
            field,
            binaryInstruction,
            instruction.nwords,
        );

        if (field.type === "co") {
            results.set(field.order || 0, instruction.name);
        } else if (value !== null) {
            let finalValue = value;

            // Apply prefix/suffix if specified
            if (field.prefix) finalValue = field.prefix + finalValue;
            if (field.suffix) finalValue += field.suffix;

            results.set(field.order, finalValue);
        }
    }

    return results;
}

/**
 * Formats the decoded instruction in legacy format for backward compatibility
 *
 * @param {Object} matchedInstruction - The matched instruction definition
 * @param {string} instruction_loaded - The assembled instruction string
 * @returns {Object} Legacy format object with instruction details
 * @returns {string} returns.type - Instruction type
 * @returns {string} returns.signatureDef - Signature definition
 * @returns {Array<string>} returns.signatureParts - Parsed signature parts
 * @returns {Array<string>} returns.signatureRawParts - Parsed raw signature parts
 * @returns {string} returns.instructionExec - Instruction execution string
 * @returns {Array<string>} returns.instructionExecParts - Instruction parts
 * @returns {Array<string>} returns.instructionExecPartsWithProperNames - Instruction parts with proper register names
 * @returns {string} returns.auxDef - Instruction definition
 * @returns {number} returns.nwords - Number of words
 * @returns {boolean} returns.binary - Binary flag
 */
function legacyFormat(matchedInstruction, instruction_loaded) {
    const parsedSignature = parseSignatureDefinition(matchedInstruction);
    const instructionExecParts = instruction_loaded.split(" ");
    const instructionExecPartsWithProperNames =
        replaceRegisterNames(instructionExecParts);

    return {
        type: matchedInstruction.type,
        signatureDef: parsedSignature.signatureDef,
        signatureParts: Array.from(parsedSignature.signatureMatch).slice(1),
        signatureRawParts: Array.from(parsedSignature.signatureRawMatch).slice(
            1,
        ),
        instructionExec: instruction_loaded,
        instructionExecParts: instructionExecParts,
        instructionExecPartsWithProperNames:
            instructionExecPartsWithProperNames,
        auxDef: matchedInstruction.definition,
        nwords: matchedInstruction.nwords,
        binary: true,
    };
}

/**
 * Decodes a binary or hexadecimal instruction into its assembly representation
 *
 * @param {string} toDecode - The instruction to decode (binary, hex, or assembly)
 * @param {boolean} [newFormat=false] - Whether to use new format (just return instruction string) or legacy format
 * @param {boolean} [skipEndianness=false] - Whether to skip endianness conversion
 * @returns {string|Object} Decoded instruction as string (newFormat=true) or legacy object (newFormat=false)
 * @throws {Error} When instruction cannot be decoded or is unknown
 */
export function decode_instruction(
    toDecode,
    newFormat = false,
    skipEndianness = false,
) {
    const toDecodeArray = toDecode.split(" ");
    const isBinary = /^[01]+$/.test(toDecodeArray[0]);
    const isHex = /^0x[0-9a-fA-F]+$/.test(toDecodeArray[0]);
    let binaryInstruction = toDecode;

    // Convert hex to binary if needed
    if (isHex) {
        const hexValue = toDecodeArray[0].slice(2);
        const numBits = hexValue.length * 4;
        binaryInstruction = parseInt(hexValue, 16)
            .toString(2)
            .padStart(numBits, "0");
    }

    // Handle endianness if needed
    if (ENDIANNESS === "little_endian" && !skipEndianness) {
        const byteSize = 8;
        let bytes = [];
        for (let i = 0; i < binaryInstruction.length; i += byteSize) {
            bytes.push(binaryInstruction.substr(i, byteSize));
        }
        bytes = bytes.reverse();
        binaryInstruction = bytes.join("");
    }

    // Use fast instruction matching
    const matchedInstruction = findMatchingInstruction(binaryInstruction);

    if (!matchedInstruction) {
        let errorValue;
        if (isHex) {
            errorValue = toDecodeArray[0].toUpperCase();
        } else if (isBinary) {
            errorValue = `0x${parseInt(binaryInstruction, 2).toString(16).toUpperCase()}`;
        } else {
            errorValue = `"${toDecode}"`;
        }
        throw new Error(`Unknown Instruction: ${errorValue}`);
    }

    // Process all fields efficiently
    const fieldResults = processAllFields(
        matchedInstruction,
        binaryInstruction,
    );

    // Build instruction array from ordered results
    const maxOrder = Math.max(...fieldResults.keys());
    const instructionArray = new Array(maxOrder + 1);

    for (const [order, value] of fieldResults) {
        instructionArray[order] = value;
    }

    // Filter out undefined elements and join
    const instruction_loaded = instructionArray
        .filter(x => x !== undefined)
        .join(" ");

    if (newFormat) {
        return instruction_loaded;
    } else {
        return legacyFormat(matchedInstruction, instruction_loaded);
    }
}
