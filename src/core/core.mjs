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
 */

import { initCAPI } from "./capi/initCAPI.mts";

import { register_value_deserialize } from "./utils/bigint.mjs";
import { getHexTwosComplement } from "./utils/utils.mjs";

import { logger } from "./utils/creator_logger.mjs";
import {
    assembly_compiler,
    instructions,
    precomputeInstructions,
    setInstructions,
} from "./assembler/assembler.mjs";
import { Memory } from "./memory/Memory.mts";
import yaml from "js-yaml";
import { crex_findReg } from "./register/registerLookup.mjs";
import { readRegister } from "./register/registerOperations.mjs";
import { StackTracker } from "./memory/StackTracker.mts";
import { creator_ga } from "./utils/creator_ga.mjs";
import { creator_callstack_reset } from "./sentinel/sentinel.mjs";
import { resetStats } from "./executor/stats.mts";
import { resetCache } from "./executor/decoder.mjs";
import { enableInterrupts, ExecutionMode } from "./executor/interrupts.mts";
import { initialize_execution } from "./executor/executor.mjs";
import { resetDevices } from "./executor/devices.mts";

export const code_assembly = "";
export let update_binary = "";
export let backup_stack_address;
export let backup_data_address;

export let architecture_hash = [];
/** @type {import("./core.d.ts").Architecture} */
export let architecture = {};
export let newArchitecture;

/** @type {import("vue").ComponentPublicInstance}*/
export let app;

/** @type {import("./core.d.ts").Status} */
export let status = {
    execution_init: 1,
    executedInstructions: 0,
    clkCycles: 0,
    run_program: 0, // 0: stopped, 1: running, 2: stopped-by-breakpoint, 3: stopped-by-mutex-read

    keyboard: "",
    display: "",
    execution_index: 0,
    virtual_PC: 0n, // This is the PC the instructions see.
    error: 0,
    execution_mode: ExecutionMode.User,
    interrupts_enabled: false,
};

export let arch;
export const ARCHITECTURE_VERSION = "2.0";
/** @type {number} */
export let WORDSIZE;
/** @type {number} */
export let BYTESIZE;
export let ENDIANNESSARR = [];
export let MAXNWORDS;
/** @type {import("./core.d.ts").RegisterBank[]} */
export let REGISTERS;
export let REGISTERS_BACKUP = [];
export const register_size_bits = 64; //TODO: load from architecture
/** @type {Memory} */
export let main_memory;
/** @type {StackTracker} */
export let stackTracker;
/** @type {Memory} */
export let main_memory_backup;
export function updateMainMemoryBackup(value) {
    main_memory_backup = value;
}

export let execution_mode = 0; // 0: instruction by instruction, 1: run program
export function set_execution_mode(value) {
    execution_mode = value;
} // it's the only way
export const instructions_packed = 100;

let code_binary = "";

export { initCAPI }; // Instead of calling it here, which causes circular dependencies, we re-export it so it can be called by the main application.
let creator_debug = false;

BigInt.prototype.toJSON = function () {
    return JSON.rawJSON(this.toString());
};

export function set_debug(enable_debug) {
    creator_debug = enable_debug;
    if (creator_debug) {
        logger.enable();
        logger.setLevel("DEBUG");
    } else {
        logger.disable();
    }
}

// load components
function load_arch_select(cfg) {
    const ret = {
        errorcode: "",
        token: "",
        type: "",
        update: "",
        status: "ok",
    };

    const auxArchitecture = cfg;
    architecture = register_value_deserialize(auxArchitecture);
    WORDSIZE = newArchitecture.config.word_size;
    BYTESIZE = newArchitecture.config.byte_size;
    const endianness = newArchitecture.config.endianness;

    const bytesPerWord = WORDSIZE / BYTESIZE;

    if (endianness === "big_endian") {
        ENDIANNESSARR = Array.from({ length: bytesPerWord }, (_, i) => i);
    } else if (endianness === "little_endian") {
        ENDIANNESSARR = Array.from(
            { length: bytesPerWord },
            (_, i) => bytesPerWord - 1 - i,
        );
    } else if (Array.isArray(endianness)) {
        ENDIANNESSARR = endianness;
    }

    REGISTERS = architecture.components;

    architecture_hash = [];
    for (let i = 0; i < REGISTERS.length; i++) {
        architecture_hash.push({
            name: REGISTERS[i].name,
            index: i,
        });
    }

    backup_stack_address = architecture.memory_layout.stack.start;
    backup_data_address = architecture.memory_layout.data.end;

    // Initialize main memory with architecture layout support

    // Calculate the total size of the memory
    // Get the smallest memory address in the memory layout
    const minMemoryAddress = Math.min(
        ...Object.values(architecture.memory_layout).map(({ start }) => start),
    );
    // Get the largest memory address in the memory layout
    const maxMemoryAddress = Math.max(
        ...Object.values(architecture.memory_layout).map(({ end }) => end),
    );
    // Calculate the total size
    const totalMemorySize = maxMemoryAddress - minMemoryAddress + 1;

    // Create memory with layout support
    main_memory = new Memory({
        sizeInBytes: totalMemorySize,
        bitsPerByte: BYTESIZE,
        wordSize: WORDSIZE / BYTESIZE,
        memoryLayout: Object.entries(architecture.memory_layout),
        baseAddress: BigInt(minMemoryAddress),
        endianness: ENDIANNESSARR,
    });

    // Initialize stack tracker and other related components
    // This must happen before creating the register backup
    stackTracker = new StackTracker();

    // Create deep copy backup of REGISTERS after all initialization is complete
    // This ensures the backup contains the correct values for all registers, including SP
    REGISTERS_BACKUP = JSON.parse(JSON.stringify(REGISTERS));

    ret.token = "The selected architecture has been loaded correctly";
    ret.type = "success";
    return ret;
}

/**
 * Find the template matching an instruction type
 * @param {Object} architectureObj - The architecture object
 * @param {Object} instruction - The instruction definition
 * @returns {Object|null} - The matching template or null if not found
 */
function findTemplateForInstruction(architectureObj, instruction) {
    const templateType = instruction.template;
    return architectureObj.templates.find(t => t.name === templateType);
}

/**
 * Update an existing field with instruction-specific properties
 * @param {Object} existingField - The template field to update
 * @param {Object} instructionField - The instruction field with override values
 */
function updateExistingField(existingField, instructionField) {
    // Override value if specified
    if (instructionField.value) {
        existingField.valueField = instructionField.value;
    }

    // Override type if specified
    if (instructionField.type) {
        existingField.type = instructionField.type;
    }

    // Override any other properties
    Object.keys(instructionField).forEach(key => {
        if (key !== "field" && key !== "value" && key !== "type") {
            existingField[key] = instructionField[key];
        }
    });
}

/**
 * Create a new field from instruction field definition
 * @param {Object} instructionField - The instruction field definition
 * @returns {Object} - The new field object
 */
function createNewField(instructionField) {
    const newField = {
        ...instructionField,
        name: instructionField.field,
    };

    // Convert 'value' property to 'valueField' to match template format
    if (instructionField.value) {
        newField.valueField = instructionField.value;
        delete instructionField.value;
    }

    delete newField.field; // Remove the field property after converting
    return newField;
}

/**
 * Merge template fields with instruction-specific fields
 * @param {Object} template - The template object
 * @param {Object} instruction - The instruction definition
 * @returns {Array} - Merged fields array
 */
function mergeTemplateAndInstructionFields(template, instruction) {
    // Start with deep copy of template fields
    const mergedFields = [...template.fields].map(field => ({ ...field }));

    // Process instruction fields if they exist
    if (instruction.fields && Array.isArray(instruction.fields)) {
        for (const instructionField of instruction.fields) {
            // Skip null fields
            if (instructionField === null) continue;

            const fieldName = instructionField.field;

            const existingFieldIndex = mergedFields.findIndex(
                field => field.name === fieldName,
            );

            if (existingFieldIndex !== -1) {
                // Update existing field
                updateExistingField(
                    mergedFields[existingFieldIndex],
                    instructionField,
                );
            } else {
                // Add new field
                mergedFields.push(createNewField(instructionField));
            }
            // Remove any null attributes from the merged field (they take precedence over the template)
            for (const key in instructionField) {
                if (instructionField[key] === null) {
                    delete mergedFields[existingFieldIndex][key];
                }
            }
        }
    }

    return mergedFields;
}

/**
 * Build a complete instruction object
 * @param {Object} instruction - The instruction definition
 * @param {Object} template - The template object
 * @param {Array} mergedFields - The merged fields array
 * @param {boolean} legacy - Flag for legacy support
 * @returns {Object} - The complete instruction object
 */

function buildCompleteInstruction(
    instruction,
    template,
    mergedFields,
    legacy = true,
) {
    // Start with template properties as base
    const result = { ...template };

    // Override with instruction properties (instruction takes precedence)
    Object.assign(result, instruction);

    // Set the specific properties that should always be used
    result.name = instruction.name;
    result.fields = mergedFields;
    result.definition = instruction.definition;
    result.type = instruction.type || "Other";
    result.help = instruction.help ?? "";

    if (legacy) {
        // This will eventually be removed!!

        result.description = "";
        result.separated = [];
        // Create arrays to hold ordered fields
        const orderedFields = [];

        // Collect fields that have an order property
        for (let i = 0; i < mergedFields.length; i++) {
            if (typeof mergedFields[i].order !== "undefined") {
                orderedFields.push({
                    index: i,
                    order: mergedFields[i].order,
                    name: mergedFields[i].name,
                    type: mergedFields[i].type,
                    valueField: mergedFields[i].valueField,
                });

                // Include prefix and suffix if they exist
                if (mergedFields[i].prefix) {
                    orderedFields[orderedFields.length - 1].prefix =
                        mergedFields[i].prefix;
                }
                if (mergedFields[i].suffix) {
                    orderedFields[orderedFields.length - 1].suffix =
                        mergedFields[i].suffix;
                }
            }
        }

        // Sort by order value
        orderedFields.sort((a, b) => a.order - b.order);

        // Compute signature_definition - format: "F0 F4 F3 F2"
        // Each Fx represents the index of the field in the fields array
        const signatureDefParts = orderedFields.map(field => {
            let part = "F" + field.index;
            // Add prefix and suffix if they exist
            if (field.prefix) {
                part = field.prefix + part;
            }
            if (field.suffix) {
                part += field.suffix;
            }
            return part;
        });
        result.signature_definition = signatureDefParts.join(" ");

        // Compute signature - format: "name,type1,type2,..."
        // Compute signatureRaw - format: "name fieldName1 fieldName2 ..."
        const signatureParts = [];
        const signatureRawParts = [];
        for (const field of orderedFields) {
            let signaturePart;
            let signatureRawPart;

            // Special case: replace "opcode" field name with instruction name
            if (field.name === "opcode") {
                signaturePart = instruction.name;
                signatureRawPart = instruction.name;
                result.co = field.valueField;
            } else {
                signaturePart = field.type;
                signatureRawPart = field.name;
            }

            // Add prefix and suffix to both signature parts
            if (field.prefix) {
                signaturePart = field.prefix + signaturePart;
                signatureRawPart = field.prefix + signatureRawPart;
            }
            if (field.suffix) {
                signaturePart += field.suffix;
                signatureRawPart += field.suffix;
            }

            signatureParts.push(signaturePart);
            signatureRawParts.push(signatureRawPart);
        }
        result.signature = signatureParts.join(",");
        result.signatureRaw = signatureRawParts.join(" ");
    }

    return result;
}

/**
 * Process instructions and add them to the architecture
 * @param {Object} architectureObj - The architecture object
 * @param {Array} instructions - Array of instruction definitions
 */
// eslint-disable-next-line max-lines-per-function
function processInstructions(architectureObj) {
    architectureObj.instructionsProcessed = [];
    for (const instruction of architectureObj.instructions) {
        const template = findTemplateForInstruction(
            architectureObj,
            instruction,
        );

        if (template) {
            const mergedFields = mergeTemplateAndInstructionFields(
                template,
                instruction,
            );

            // merge template type and instruction type
            instruction.type = instruction.type || template.type;

            // We need a marker to help distinguish the user definition from the pre-operation and post-operation definitions, so we can later perform the preload correctly.
            // The marker can be any string.
            instruction.definition =
                "// BEGIN USERDEF\n" +
                instruction.definition +
                "\n// END USERDEF\n";

            // If it has a "preoperation" or "postoperation" field, we need to concatenate it with the "definition"
            // field, and remove them
            if (instruction.preoperation) {
                instruction.definition =
                    "// PREOPERATION\n" +
                    instruction.preoperation +
                    "\n// DEFINITION\n" +
                    instruction.definition;
                delete instruction.preoperation;
            }
            if (instruction.postoperation) {
                instruction.definition =
                    instruction.definition +
                    "\n// POSTOPERATION\n" +
                    instruction.postoperation;
                delete instruction.postoperation;
            }
            // Check to convert (if needed) the "valueField" property from hex to binary
            for (const field of mergedFields) {
                if (field.valueField !== undefined) {
                    // If the valueField is a string, it might be in hex format
                    if (typeof field.valueField === "string") {
                        // If it starts with "0x", convert it to binary
                        if (field.valueField.startsWith("0x")) {
                            const hexValue = field.valueField.slice(2);
                            const binaryValue = parseInt(hexValue, 16).toString(
                                2,
                            );
                            // Pad to maintain the same bit width as the original hex
                            const expectedBitWidth = hexValue.length * 4;
                            field.valueField = binaryValue.padStart(
                                expectedBitWidth,
                                "0",
                            );
                        }
                    }
                }
            }
            // We need to find if any field is optional, because if it is, we need to
            // construct two different instructions, one with the field and one without it

            // This works for 1 optional field, but not for 2 or more. Supporting more
            // than 1 optional field is not in the roadmap.
            const mergedFieldsOriginal = JSON.parse(
                JSON.stringify(mergedFields),
            );
            const optionalFields = mergedFields.filter(
                field => field.optional === true,
            );
            if (optionalFields.length === 1) {
                // We need to create two instructions, one with the field and one without it
                // Let's first check whether the optional field is of type "enum"

                const optionalField = optionalFields[0];
                if (optionalField.type === "enum") {
                    // get the enum_name
                    const enumName = optionalField.enum_name;
                    // get the enum values from the architecture
                    const enumValues = architectureObj.enums[enumName];

                    const defaultEnum = enumValues.DEFAULT;
                    // if its not undefined...
                    if (defaultEnum === undefined) {
                        logger.error(
                            `Enum '${enumName}' does not have a DEFAULT value. Cannot process instruction '${instruction.name}' with optional field '${optionalField.name}'.`,
                        );
                        return;
                    }
                    // Then DEFAULT has the name of the value which contains the default value
                    optionalField.valueField = enumValues[defaultEnum];
                    // and convert it to a string, in binary
                    optionalField.valueField =
                        optionalField.valueField.toString(2);

                    delete optionalField.order;
                    optionalField.type = "inm-unsigned";
                    // remove the optional property
                    delete optionalField.optional;

                    // Now we can build the instruction with the field
                    const instructionWithDefault = buildCompleteInstruction(
                        instruction,
                        template,
                        mergedFields,
                    );
                    architectureObj.instructionsProcessed.push(
                        instructionWithDefault,
                    );
                    // And the original instruction for the non default case
                    const instructionWithFields = buildCompleteInstruction(
                        instruction,
                        template,
                        mergedFieldsOriginal,
                    );
                    architectureObj.instructionsProcessed.push(
                        instructionWithFields,
                    );
                } else {
                    // If the optional field is not an enum, we can just filter out the optional field
                    const instructionWithFields = buildCompleteInstruction(
                        instruction,
                        template,
                        mergedFieldsOriginal,
                    );
                    architectureObj.instructionsProcessed.push(
                        instructionWithFields,
                    );
                    const instructionWithoutFields = buildCompleteInstruction(
                        instruction,
                        template,
                        mergedFieldsOriginal.filter(
                            field => field.optional !== true,
                        ),
                    );
                    architectureObj.instructionsProcessed.push(
                        instructionWithoutFields,
                    );
                }
            } // If no optional fields, just add the instruction
            else if (optionalFields.length === 0) {
                const fullInstruction = buildCompleteInstruction(
                    instruction,
                    template,
                    mergedFields,
                );
                architectureObj.instructionsProcessed.push(fullInstruction);
            } else {
                logger.error(
                    `Instruction '${instruction.name}' has more than one optional field. This is not supported.`,
                );
            }
        } else {
            logger.error(
                `Template '${instruction.template}' not found for instruction '${instruction.name}'`,
            );
        }
    }
    architectureObj.instructions = architectureObj.instructionsProcessed;
    delete architectureObj.instructionsProcessed;
    // If enums exist, for each enum, find whether there's a "DEFAULT" value.
    // If there is, DELETE it
    if (architectureObj.enums) {
        Object.keys(architectureObj.enums).forEach(enumName => {
            const enumValues = architectureObj.enums[enumName];
            if (enumValues.DEFAULT !== undefined) {
                delete enumValues.DEFAULT;
            }
        });
    }
}

function processPseudoInstructions(architectureObj, legacy = true) {
    architectureObj.pseudoinstructionsProcessed = [];
    architectureObj.pseudoinstructions.forEach(pseudoinstruction => {
        let fields = [];
        if (legacy) {
            // Convert new field format to legacy format
            if (
                pseudoinstruction.fields &&
                Array.isArray(pseudoinstruction.fields)
            ) {
                fields = pseudoinstruction.fields.map(field => ({
                    name: field.field,
                    type: field.type,
                    ...(field.prefix && {prefix: field.prefix}),
                    ...(field.suffix && {suffix: field.suffix}),
                }));
            }

            // Create signature_definition: "name F0 F1 F2..."
            const signatureDefParts = [pseudoinstruction.name];
            for (let i = 0; i < fields.length; i++) {
                let part = `F${i}`;
                if (fields[i].prefix) part = fields[i].prefix + part;
                if (fields[i].suffix) part += fields[i].suffix;
                signatureDefParts.push(part);
            }

            // Create signature: "name,TYPE1,TYPE2,..."
            const signatureParts = [pseudoinstruction.name];
            fields.forEach(field => {
                let part = field.type;
                if (field.prefix) part = field.prefix + part;
                if (field.suffix) part += field.suffix;
                signatureParts.push(part);
            });

            // Create signatureRaw: "name fieldname1 fieldname2..."
            const signatureRawParts = [pseudoinstruction.name];
            fields.forEach(field => {
                let part = field.name;
                if (field.prefix) part = field.prefix + part;
                if (field.suffix) part += field.suffix;
                signatureRawParts.push(part);
            });

            // Create the full legacy pseudoinstruction object
            const legacyPseudoinstruction = {
                name: pseudoinstruction.name,
                signature_definition: signatureDefParts.join(" "),
                signature: signatureParts.join(","),
                signatureRaw: signatureRawParts.join(" "),
                help: "",
                properties: [],
                nwords: 1,
                fields,
                definition: pseudoinstruction.definition,
            };

            // Add to architecture
            architectureObj.pseudoinstructionsProcessed.push(
                legacyPseudoinstruction,
            );
        } else {
            // For non-legacy mode, just add the pseudoinstruction as is
            architectureObj.pseudoinstructionsProcessed.push(pseudoinstruction);
        }
    });
    architectureObj.pseudoinstructions =
        architectureObj.pseudoinstructionsProcessed;
    delete architectureObj.pseudoinstructionsProcessed;
}

/**
 * Parse architecture YAML into an object
 * @param {string} architectureYaml - YAML string containing architecture definition
 * @returns {Object} - Parsed architecture object or throws error
 */
function parseArchitectureYaml(architectureYaml) {
    try {
        return yaml.load(architectureYaml);
    } catch (error) {
        logger.error(`Failed to parse architecture YAML: ${error.message}`);
        throw new Error(`Failed to parse architecture YAML: ${error.message}`);
    }
}

/**
 * Find any requested ISAs that don't exist in the available sets
 * @param {Array} requestedISAs - The ISAs requested by the user
 * @param {Array} availableInstructionSets - All available instruction sets
 * @returns {Array} - Invalid ISAs that don't exist
 */
function findInvalidISAs(requestedISAs, availableInstructionSets) {
    return requestedISAs.filter(isa => !availableInstructionSets.includes(isa));
}

/**
 * Recursively gather all dependencies of an ISA
 * @param {string} isa - The ISA to gather dependencies for
 * @param {Object} extensions - The extensions object with dependency info
 * @param {Set} requiredISAs - Set to collect all required ISAs
 * @param {Set} visited - Set to track visited ISAs
 */
function gatherDependencies(isa, extensions, requiredISAs, visited) {
    if (visited.has(isa)) return; // Prevent circular dependencies

    visited.add(isa);
    requiredISAs.add(isa);

    // Get dependencies from extension
    const extension = extensions[isa];
    if (extension && extension.implies && Array.isArray(extension.implies)) {
        for (const dependentISA of extension.implies) {
            requiredISAs.add(dependentISA);
            gatherDependencies(dependentISA, extensions, requiredISAs, visited);
        }
    }
}

/**
 * Calculate all required ISAs including dependencies
 * @param {Array} requestedISAs - The ISAs explicitly requested by the user
 * @param {Object} extensions - The extensions object with dependencies
 * @param {string} baseISA - The base ISA
 * @param {Array} availableInstructionSets - All available instruction sets
 * @returns {Object} - Object containing required ISAs and missing dependencies
 */
function calculateRequiredISAs(
    requestedISAs,
    extensions,
    baseISA,
    availableInstructionSets,
) {
    const explicitlyRequestedISAs = new Set(requestedISAs);
    const requiredISAs = new Set(requestedISAs);

    // Always ensure base ISA is included
    requiredISAs.add(baseISA);

    // Gather all dependencies
    const visited = new Set();
    for (const isa of [...requiredISAs]) {
        gatherDependencies(isa, extensions, requiredISAs, visited);
    }

    // Find dependencies that weren't explicitly requested
    const missingDependencies = [...requiredISAs].filter(
        isa => !explicitlyRequestedISAs.has(isa),
    );

    // Check if any required ISAs don't exist in the architecture
    const nonExistentISAs = [...requiredISAs].filter(
        isa => !availableInstructionSets.includes(isa),
    );

    if (nonExistentISAs.length > 0) {
        const message = `There are nonexistant dependencies in the architecture: ${nonExistentISAs.join(
            ", ",
        )}`;
        logger.error(message);
        return {
            requiredISAs: [],
            missingDependencies: [],
            status: "ko",
            message,
        };
    }

    return {
        requiredISAs,
        missingDependencies,
    };
}

/**
 * Find the base ISA from the extensions
 * @param {Object} extensions - The extensions object
 * @returns {string} - The base ISA
 */
function findBaseISA(extensions) {
    let baseISA;

    // Try to find it from the extensions definition
    for (const [name, value] of Object.entries(extensions)) {
        if (value && value.type === "base") {
            baseISA = name;
            break;
        }
    }
    // If not found, raise an error
    if (!baseISA) {
        logger.error("Base ISA not found in the architecture definition.");
        return null;
    }
    return baseISA;
}

/**
 * Determine which instruction sets to load based on user selections
 * @param {Object} architectureObj - The architecture object
 * @param {Array} requestedISAs - User-requested instruction sets to load
 * @returns {Object} - Object with selected ISAs and status
 */

function determineInstructionSetsToLoad(architectureObj, requestedISAs = []) {
    // Get all available instruction sets in the architecture
    const availableInstructionSets = [
        ...new Set([
            ...Object.keys(architectureObj.instructions || {}),
            ...Object.keys(architectureObj.pseudoinstructions || {}),
        ]),
    ];

    // If no ISAs specified, use all available ones
    if (!requestedISAs || requestedISAs.length === 0) {
        return {
            instructionSets: [...availableInstructionSets],
            status: "ok",
        };
    }

    // Get extensions and find base ISA
    const extensions = architectureObj.extensions || {};

    const baseISA = findBaseISA(extensions);
    if (!baseISA) {
        return {
            instructionSets: [],
            status: "error",
            message: "Base ISA not found in the architecture definition.",
        };
    }

    // Validate all requested ISAs exist
    const invalidISAs = findInvalidISAs(
        requestedISAs,
        availableInstructionSets,
    );
    if (invalidISAs.length > 0) {
        const message = `The following requested ISAs do not exist: ${invalidISAs.join(
            ", ",
        )}`;
        logger.error(message);
        return {
            instructionSets: [],
            status: "error",
            message,
        };
    }

    // Calculate all required ISAs including dependencies
    const { requiredISAs, missingDependencies, status, message } =
        calculateRequiredISAs(
            requestedISAs,
            extensions,
            baseISA,
            availableInstructionSets,
        );
    if (status === "ko") {
        return {
            instructionSets: [],
            status: "error",
            message,
        };
    }

    // Check if any dependencies are missing from the user request
    if (missingDependencies.length > 0) {
        const message = `Missing required dependencies. To use the requested ISA(s), you must also include: ${missingDependencies.join(
            ", ",
        )}`;
        logger.error(message);

        return {
            instructionSets: [],
            status: "error",
            message,
        };
    }

    // Log which ISAs were selected
    logger.info(`Loading ISAs: ${[...requiredISAs].join(", ")}`);

    return {
        instructionSets: [...requiredISAs],
        status: "ok",
    };
}
/**
 * Collect instructions and pseudoinstructions from selected instruction sets
 * @param {Object} architectureObj - The architecture object
 * @param {Array} instructionSetsToLoad - Array of instruction set names to load
 * @returns {Object} - Updated architecture object with collected instructions
 */
function collectInstructionsFromSets(architectureObj, instructionSetsToLoad) {
    let selectedInstructions = [];
    let selectedPseudoInstructions = [];

    // Process each instruction set
    for (const requestedISA of instructionSetsToLoad) {
        // Add instructions if available for this ISA
        const isaInstructions = architectureObj.instructions[requestedISA];
        if (isaInstructions) {
            selectedInstructions = [
                ...selectedInstructions,
                ...isaInstructions,
            ];
        }
        // Add pseudoinstructions if available for this ISA
        const ISAPseudoInstructions =
            architectureObj.pseudoinstructions?.[requestedISA];
        if (ISAPseudoInstructions) {
            selectedPseudoInstructions = [
                ...selectedPseudoInstructions,
                ...ISAPseudoInstructions,
            ];
        }
    }

    // Create a new architecture object with the updated instructions
    const updatedArchObj = { ...architectureObj };
    updatedArchObj.instructions = selectedInstructions;
    updatedArchObj.pseudoinstructions = selectedPseudoInstructions;

    return updatedArchObj;
}

/**
 * Prepare architecture for use by processing instructions and initializing WASM
 * @param {Object} architectureObj - The architecture object
 * @param {boolean} skipCompiler - Whether to skip initializing the WASM compiler
 * @param {boolean} dump - Whether to dump architecture to file for debugging
 * @returns {Object} - The processed architecture object
 */
function prepareArchitecture(architectureObj, dump = false) {
    // Process the selected instructions and pseudoinstructions
    processInstructions(architectureObj);
    processPseudoInstructions(architectureObj, true);

    // Calculate MAXNWORDS from all processed instructions
    MAXNWORDS = architectureObj.instructions.reduce((max, instruction) => {
        return Math.max(max, instruction.nwords || 1);
    }, 1);


    return architectureObj;
}

/**
 * Check if the architecture version is supported
 * @param {Object} architectureObj - The architecture object
 * @returns {boolean} - True if supported, false otherwise
 */
function isVersionSupported(architectureObj) {
    const architectureVersion = architectureObj.version;
    const architerctureVersionParts = architectureVersion.split(".");
    const architectureMajor = parseInt(architerctureVersionParts[0], 10);
    const supportedVersionParts = ARCHITECTURE_VERSION.split(".");
    const supportedMajor = parseInt(supportedVersionParts[0], 10);
    if (architectureMajor !== supportedMajor) {
        return false;
    }
    return true;
}

/**
 * Load architecture from YAML string and prepare for use
 * @param {string} architectureYaml - YAML string containing architecture definition
 * @param {boolean} dump - Whether to dump architecture to file for debugging
 * @param {Array} isa - Array of instruction set names to load
 * @returns {Object} - Result object with load status
 */
export function newArchitectureLoad(architectureYaml, dump = false, isa = []) {
    try {
        // Parse YAML to object
        const architectureObj = parseArchitectureYaml(architectureYaml);
        newArchitecture = architectureObj;

        // Check the version
        if (!isVersionSupported(architectureObj)) {
            return {
                errorcode: "unsupported_version",
                token: "Unsupported architecture version",
                type: "error",
                update: "",
                status: "ko",
            };
        }

        // Transform arch_conf to the format expected by the code
        // const transformedArchObj = transformArchConf(architectureObj);

        // Determine which instruction sets to load
        const isaResult = determineInstructionSetsToLoad(architectureObj, isa);
        if (isaResult.status === "error") {
            return {
                errorcode: "invalid_isa",
                token: isaResult.message,
                type: "error",
                update: "",
                status: "ko",
            };
        }

        // Collect instructions from selected sets
        const updatedArchObj = collectInstructionsFromSets(
            architectureObj,
            isaResult.instructionSets,
        );

        // Prepare architecture (process instructions, initialize WASM)
        const preparedArchObj = prepareArchitecture(updatedArchObj, dump);

        // Load the architecture into the system
        return load_arch_select(preparedArchObj);
    } catch (error) {
        logger.error(`Error loading architecture: ${error}`);
        return {
            errorcode: "load_error",
            token: `Failed to load architecture: ${error.message || error}`,
            type: "error",
            update: "",
            status: "ko",
        };
    }
}

export function load_architecture(arch_str) {
    logger.warn(
        "load_architecture is deprecated, use newArchitectureLoad instead",
    );
    arch = ArchitectureJS.from_json(arch_str);
    const arch_obj = JSON.parse(arch_str);
    const ret = load_arch_select(arch_obj);

    return ret;
}

export function load_library(lib_str) {
    const ret = {
        status: "ok",
        msg: "",
    };

    code_binary = lib_str;
    update_binary = JSON.parse(code_binary);

    return ret;
}

// compilation

export async function assembly_compile(code, compiler) {
    const ret = await assembly_compiler(code, false, compiler);
    switch (ret.status) {
        case "error":
            break;

        case "warning":
            ret.msg = "warning: " + ret.token;
            break;

        case "ok":
            ret.msg = "Compilation completed successfully";
            main_memory_backup = main_memory.dump();
            break;

        default:
            ret.msg = "Unknow assembly compiler code :-/";
            break;
    }

    // Initialize execution environment
    initialize_execution();

    return ret;
}

// execution

export function reset() {
    // Google Analytics
    creator_ga("execute", "execute.reset");

    status.execution_index = 0;
    status.execution_init = 1;
    status.run_program = 0;

    // Reset stats
    resetStats();

    // Reset decoder cache
    resetCache();

    status.executedInstructions = 0;
    status.clkCycles = 0;

    // Reset console
    status.keyboard = "";
    status.display = "";

    // reset registers
    if (typeof document !== "undefined" && document.app) {
        // I'd _like_ to use REGISTERS_BACKUP and call it a day... but if I do
        // that Vue doesn't notice the change and it doesn't update visually
        for (const bank of REGISTERS) {
            for (const reg of bank.elements) {
                reg.value = reg.default_value;
            }
        }
    } else {
        REGISTERS = JSON.parse(JSON.stringify(REGISTERS_BACKUP));
    }

    architecture.memory_layout.stack.start = backup_stack_address;
    architecture.memory_layout.data.end = backup_data_address;

    // reset memory and restore initial hints from backup (if it exists)
    if (typeof main_memory_backup !== "undefined") {
        main_memory.restore(main_memory_backup);
    }

    // Stack Reset
    stackTracker.reset();
    creator_callstack_reset();

    // clear all read timeouts
    // eslint-disable-next-line no-empty-function
    let id = setTimeout(() => {}, 0); // dummy timeout to get max ID
    while (id--) {
        clearTimeout(id); // will do nothing if no timeout with id is present
    }

    // reset interrupts
    if (newArchitecture.interrupts?.enabled) enableInterrupts();

    // reset devices
    resetDevices();

    // Initialize execution environment
    initialize_execution();

    return true;
}

export function snapshot(extraData) {
    // Dump architecture object to file
    const architectureJson = JSON.stringify(architecture);
    const instructionsJson = JSON.stringify(instructions);

    // Use sparse memory dump for efficiency
    const memoryDump = main_memory.dump();
    const memoryJson = JSON.stringify(memoryDump);

    // And the status
    const statusJson = JSON.stringify(status);

    // And the registers
    const registersJson = JSON.stringify(REGISTERS);

    // And the stack
    const stackData = stackTracker.dump();

    // Combine all JSON strings into a single snapshot string
    const combinedState = JSON.stringify({
        architecture: architectureJson,
        instructions: instructionsJson,
        memory: memoryJson,
        status: statusJson,
        registers: registersJson,
        stack: stackData,
        extraData,
    });

    // Return the snapshot string
    return combinedState;
}

export function restore(snapshot) {
    // Parse the snapshot string back into an object
    const parsedSnapshot = JSON.parse(snapshot);
    const architectureJson = parsedSnapshot.architecture;
    const memoryJson = parsedSnapshot.memory;
    const instructionsJson = parsedSnapshot.instructions;
    const statusJson = parsedSnapshot.status;
    const registersJson = parsedSnapshot.registers;
    const architectureObj = JSON.parse(architectureJson);
    const memoryObj = JSON.parse(memoryJson);
    const instructionsObj = JSON.parse(instructionsJson);
    const statusObj = JSON.parse(statusJson);
    const registersObj = registersJson ? JSON.parse(registersJson) : null;
    const stackData = parsedSnapshot.stack;

    main_memory.restore(memoryObj);

    // Restore the instructions
    setInstructions(instructionsObj);
    // Restore the architecture object
    architecture = architectureObj;
    // Restore the registers
    if (registersObj) {
        REGISTERS = registersObj;
    }
    // Restore the stack
    stackTracker.load(stackData);

    // Restore the status
    status = statusObj;
}
export function dumpMemory(startAddr, numBytes, bytesPerRow = 16) {
    startAddr = BigInt(startAddr);
    numBytes = BigInt(numBytes);
    bytesPerRow = BigInt(bytesPerRow);

    let output = "";
    let currentAddr = startAddr;
    const endAddr = startAddr + numBytes;

    // Create header
    output += "       ";
    for (let i = 0n; i < bytesPerRow; i++) {
        output += " " + i.toString(16).padStart(2, "0");
    }
    output += "  | ASCII\n";
    output +=
        "-------" +
        "-".repeat(Number(bytesPerRow) * 3) +
        "---" +
        "-".repeat(Number(bytesPerRow)) +
        "\n";

    // Create rows
    while (currentAddr < endAddr) {
        // Address column
        output += "0x" + currentAddr.toString(16).padStart(4, "0") + ": ";

        let hexValues = "";
        let asciiValues = "";

        // Process bytes for this row
        for (let i = 0n; i < bytesPerRow; i++) {
            if (currentAddr + i < endAddr) {
                const byte = main_memory.read(currentAddr + i);
                const byteValue = byte.toString(16).padStart(2, "0");
                hexValues += byteValue + " ";

                // Try to convert to ASCII, use dot for non-printable chars
                const charCode = parseInt(byteValue, 16);
                if (charCode >= 32 && charCode <= 126) {
                    // Printable ASCII range
                    asciiValues += String.fromCharCode(charCode);
                } else {
                    asciiValues += ".";
                }
            } else {
                // Padding for incomplete row
                hexValues += "   ";
                asciiValues += " ";
            }
        }

        output += hexValues + "| " + asciiValues + "\n";
        currentAddr += bytesPerRow;
    }

    return output;
}

export function dumpAddress(startAddr, numBytes) {
    startAddr = BigInt(startAddr);
    numBytes = BigInt(numBytes);

    const result = [];
    let currentAddr = startAddr;
    const endAddr = startAddr + numBytes;

    while (currentAddr < endAddr) {
        const byteValue = main_memory.read(currentAddr);
        result.push(byteValue);
        currentAddr += 1n;
    }
    // Convert the result to a string representation
    const resultString = result
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");

    return resultString;
}

export function dumpRegister(register, format = "hex") {
    if (typeof register === "undefined") {
        return ret;
    }

    const result = crex_findReg(register);
    const registerSize =
        REGISTERS[result.indexComp].elements[result.indexElem].nbits;

    if (result.match === 1) {
        if (format === "hex") {
            const value = readRegister(
                result.indexComp,
                result.indexElem,
            ).toString(16);
            return value;
        } else if (format === "twoscomplement") {
            const value = readRegister(result.indexComp, result.indexElem);
            const twosComplement = getHexTwosComplement(value, registerSize);
            return twosComplement;
        } else if (format === "raw") {
            const value =
                REGISTERS[result.indexComp].elements[
                    result.indexElem
                ].value.toString(16);
            return value;
        } else if (format === "decimal") {
            const value = readRegister(result.indexComp, result.indexElem);
            return value;
        }
    }
    return null;
}

export function getRegisterTypes() {
    // Extract unique register types from architecture components
    const registerTypes = REGISTERS.filter(component =>
        component.type.includes("registers"),
    ).map(component => component.type);

    return registerTypes;
}

export function getRegistersByBank(regType) {
    // Find the component with the specified register type
    const component = REGISTERS.find(comp => comp.type === regType);

    if (!component) {
        return null;
    }

    return {
        name: component.name,
        type: component.type,
        elements: component.elements,
        double_precision: component.double_precision,
        double_precision_type: component.double_precision_type,
    };
}

export function getRegisterInfo(regName) {
    // Find the register in all components
    for (const component of REGISTERS) {
        if (component.type.includes("registers")) {
            for (const element of component.elements) {
                // Check if this register matches by any of its names
                if (element.name.includes(regName)) {
                    return {
                        ...element,
                        type: component.type,
                        nbits: element.nbits,
                    };
                }
            }
        }
    }

    return null;
}
export function loadBinaryFile(filePath, offset = 0n) {
    try {
        // Load the binary file into memory
        main_memory.loadBinaryFile(filePath, offset);

        // Create a new backup of memory that includes the loaded binary data
        // This ensures that reset() will restore to the state with the binary loaded
        main_memory_backup = main_memory.dump();

        precomputeInstructions();

        return {
            status: "ok",
            msg: "Binary file loaded successfully",
        };
    } catch (error) {
        return {
            status: "error",
            msg: `Error loading binary file: ${error.message}`,
        };
    }
}
