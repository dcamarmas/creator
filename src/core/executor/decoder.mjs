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

import { architecture, REGISTERS, WORDSIZE } from "../core.mjs";
import { logger } from "../utils/creator_logger.mjs";
const BINARY_BASE = 2;
const DECIMAL_BASE = 10;
let instructionLookupCache = null;

/**
 * Resets the instruction lookup cache
 *
 * @function resetCache
 * @returns {void}
 */
export function resetDecoderCache() {
    instructionLookupCache = null;
}

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
            return {
                startbit: field.startbit,
                stopbit: field.stopbit,
                word: field.word,
                value: field.valueField,
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
        value -= BINARY_BASE ** binaryValue.length;
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

    // Split instruction into words
    const words = [];
    for (let i = 0; i < instruction_nwords; i++) {
        const word = instructionExec.substring(
            i * WORDSIZE,
            (i + 1) * WORDSIZE,
        );
        words.push(word);
    }

    // Helper function to get the combined word(s) for this field
    function getCombinedWord(field, words) {
        if (Array.isArray(field.word)) {
            // Multi-word field: combine the specified words
            let combinedWord = "";
            for (const wordIndex of field.word) {
                if (wordIndex >= words.length) {
                    logger.error(
                        `Field references word ${wordIndex} but instruction only has ${words.length} words`,
                    );
                    return null;
                }
                combinedWord += words[wordIndex];
            }
            return combinedWord;
        } else {
            // Single word field
            const wordIndex = field.word || 0;
            if (wordIndex >= words.length) {
                logger.error(
                    `Field references word ${wordIndex} but instruction only has ${words.length} words`,
                );
                return null;
            }
            return words[wordIndex];
        }
    }

    switch (field.type) {
        case "co":
        case "cop":
            break;
        case "INT-Reg":
        case "SFP-Reg":
        case "DFP-Reg":
        case "Ctrl-Reg": {
            const combinedWord = getCombinedWord(field, words);
            if (combinedWord === null) break;

            const bin = combinedWord.substring(
                combinedWord.length - field.startbit - 1,
                combinedWord.length - field.stopbit,
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
            const combinedWord = getCombinedWord(field, words);
            if (combinedWord === null) break;

            const binaryValue = combinedWord.substring(
                combinedWord.length - field.startbit - 1,
                combinedWord.length - field.stopbit,
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

                const combinedWord = getCombinedWord(field, words);
                if (combinedWord === null) break;

                for (const bit of bitsOrder) {
                    binaryValue += combinedWord.charAt(
                        combinedWord.length - 1 - bit,
                    );
                }
                // Now, check field.padding to see if we need to add padding
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
                const combinedWord = getCombinedWord(field, words);
                if (combinedWord === null) break;

                const binaryValue = combinedWord.substring(
                    combinedWord.length - field.startbit - 1,
                    combinedWord.length - field.stopbit,
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
        case "skip":
            value = field.valueField;
            break;

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

        const key = `${opcodeField.value}_${opcodeField.startbit}_${opcodeField.stopbit}_${opcodeField.word}`;

        if (!lookupTable.has(key)) {
            lookupTable.set(key, []);
        }

        // Pre-compute function field masks for this instruction
        const functionMasks = [];
        for (const field of instruction.fields) {
            if (field.type === "cop") {
                functionMasks.push({
                    startbit: field.startbit,
                    stopbit: field.stopbit,
                    expectedValue: field.valueField,
                    word: field.word,
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
 * Checks if a candidate instruction matches the given binary instruction
 *
 * @param {Object} candidate - The candidate instruction object
 * @param {string} instruction - The binary instruction to match against
 * @returns {boolean} True if the candidate matches, false otherwise
 */
function checkCandidateOpcode(candidate, instruction) {
    if (candidate.functionMasks.length === 0) {
        // No function fields to check
        return true;
    }

    // Split instruction into words
    const nwords = instruction.length / WORDSIZE;
    const words = [];
    for (let i = 0; i < nwords; i++) {
        const word = instruction.substring(i * WORDSIZE, (i + 1) * WORDSIZE);
        words.push(word);
    }

    // Check all function fields
    for (const mask of candidate.functionMasks) {
        // Get the word that contains this field
        const wordIndex = mask.word || 0;
        if (wordIndex >= words.length) {
            return false;
        }

        const word = words[wordIndex];
        const fieldValue = word.substring(
            WORDSIZE - mask.startbit - 1,
            WORDSIZE - mask.stopbit,
        );
        if (fieldValue !== mask.expectedValue) {
            return false;
        }
    }

    return true;
}

/**
 * Fast instruction matching using pre-computed lookup table
 *
 * @param {string} binaryInstruction - The binary instruction string to match
 * @returns {Object|null} The matching instruction object or null if no match found
 */
function findMatchingInstruction(
    binaryInstruction,
    variableOpcodeSize = false,
) {
    const lookupTable = buildInstructionLookupTable();
    const nwords = binaryInstruction.length / WORDSIZE;
    if (binaryInstruction.length % WORDSIZE !== 0) {
        throw new Error(
            "Binary instruction length is not a multiple of WORDSIZE",
        );
    }
    // Words array
    const words = [];
    for (let i = 0; i < nwords; i++) {
        const word = binaryInstruction.substring(
            i * WORDSIZE,
            (i + 1) * WORDSIZE,
        );
        words.push(word);
    }

    // Try incrementally: first 1 word, then 2 words, etc.
    for (let wordCount = 1; wordCount <= nwords; wordCount++) {
        const currentBinaryInstruction = words.slice(0, wordCount).join("");
        const matchingInstructions = [];

        // Try different opcode positions and sizes with current word count
        for (const [key, candidates] of lookupTable) {
            const [opcodeValue, startBitStr, stopBitStr] = key.split("_");
            const startBit = parseInt(startBitStr, 10);
            const stopBit = parseInt(stopBitStr, 10);

            // Extract opcode from instruction at the expected position
            // Use the actual startbit and stopbit positions to extract the opcode
            const extractedOpcode = currentBinaryInstruction.substring(
                currentBinaryInstruction.length - startBit - 1,
                currentBinaryInstruction.length - stopBit,
            );

            if (extractedOpcode !== opcodeValue) continue;

            // Check candidates with this opcode
            for (const candidate of candidates) {
                if (checkCandidateOpcode(candidate, binaryInstruction)) {
                    matchingInstructions.push(candidate.instruction);
                }
            }
        }

        // If we found matches for this word count, process them
        if (matchingInstructions.length > 0) {
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
                    const enumPreference = checkEnumFieldPreference(
                        inst1,
                        inst2,
                    );
                    if (enumPreference !== null) {
                        return enumPreference;
                    }
                }

                logger.error(
                    `Ambiguous instruction match for opcode (found ${matchingInstructions.length} matches)`,
                );
                return null;
            }

            // Return the single match found
            return matchingInstructions[0];
        }
        if (!variableOpcodeSize) {
            // If variable opcode size is not allowed, we can stop here
            break;
        }
    }

    return null;
}

/**
 * Processes all instruction fields and returns an array indexed by field.order.
 * Undefined indices are left as holes (later filtered by the caller).
 * This removes the need to build an intermediate Map and then re-materialize
 * an ordered array.
 *
 * @param {Object} instruction - The instruction definition object
 * @param {string} binaryInstruction - The binary instruction string
 * @returns {Array<string|number|Object>} Array where index == field.order
 */
function processAllFields(instruction, binaryInstruction) {
    // Find the maximum order to size the array minimally once.
    let maxOrder = -1;
    for (const field of instruction.fields) {
        if (
            (field.order || field.type === "co") &&
            (field.order ?? 0) > maxOrder
        ) {
            maxOrder = field.order ?? 0;
        }
    }
    const ordered = new Array(maxOrder + 1);

    for (const field of instruction.fields) {
        // Skip fields without an order unless they are opcode (co)
        if (!field.order && field.type !== "co") continue;

        const value = processInstructionField(
            field,
            binaryInstruction,
            instruction.nwords,
        );

        const targetIndex = field.order || 0;

        if (field.type === "co") {
            ordered[targetIndex] = {
                name: "opcode",
                type: field.type,
                value: instruction.name,
                prettyValue: instruction.name,
            };
        } else if (value !== null) {
            let prettyValue = value;
            let finalValue = value;
            if (typeof value === "number") {
                finalValue = BigInt(value);
            }
            if (field.prefix) prettyValue = field.prefix + prettyValue;
            if (field.suffix) prettyValue += field.suffix;
            ordered[targetIndex] = {
                name: field.name,
                type: field.type,
                value: finalValue,
                prettyValue,
            };
        }
    }
    // before returning, ensure the array is compact (no holes)
    return ordered.filter(item => item !== undefined);
}

/**
 * Decodes a binary instruction from a Uint8Array.
 *
 * @param {string|Uint8Array} toDecode - The instruction to decode  (Uint8Array)
 * @param {string} [outputFormat="new"] - Used for testing the decoder. Can be "new" (default) or "decodedOnly".
 *                                       "new" returns an object with status, instruction, and decodedFields.
 *                                       "decodedOnly" returns just the assembly string of the instruction.
 * @returns {string|Object} Decoded instruction in the requested format
 * @throws {Error} When instruction cannot be decoded or is unknown
 */
export function decode_instruction(toDecode, outputFormat = "new") {
    let binaryInstruction;
    if (toDecode instanceof Uint8Array) {
        binaryInstruction = Array.from(toDecode)
            .map(byte => byte.toString(2).padStart(8, "0"))
            .join("");
    } else {
        throw new Error("toDecode must be a Uint8Array");
    }

    // Use fast instruction matching
    const matchedInstruction = findMatchingInstruction(binaryInstruction);

    if (!matchedInstruction) {
        const errorValue = `0x${Array.from(toDecode)
            .map(b => b.toString(16).padStart(2, "0"))
            .join("")
            .toUpperCase()}`;
        return {
            status: "error",
            reason: `Illegal Instruction: ${errorValue}`,
        };
    }

    const instructionArray = processAllFields(
        matchedInstruction,
        binaryInstruction,
    );

    const instructionAssembly = instructionArray
        .filter(x => x !== undefined)
        .map(x => x.prettyValue)
        .join(" ");

    if (outputFormat === "decodedOnly") {
        return instructionAssembly;
    } else if (outputFormat === "new") {
        return {
            status: "ok",
            instruction: matchedInstruction,
            decodedFields: instructionArray,
        };
    } else {
        throw new Error(`Unknown output format: ${outputFormat}`);
    }
}
