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

import { instructions, tag_instructions } from "../assembler/assembler.mjs";
import {
    status,
    WORDSIZE,
    BYTESIZE,
    MAXNWORDS,
    main_memory,
    stackTracker,
    newArchitecture,
} from "../core.mjs";
import { crex_findReg_bytag } from "../register/registerLookup.mjs";
import {
    readRegister,
    writeRegister,
} from "../register/registerOperations.mjs";
import { creator_ga } from "../utils/creator_ga.mjs";
import { logger } from "../utils/creator_logger.mjs";
import { decode_instruction } from "./decoder.mjs";
import { buildInstructionPreload } from "./preload.mjs";
import { show_notification } from "@/web/utils.mjs";
import { updateStats } from "./stats.mts";
import {
    checkInterrupt,
    handleInterrupt,
    ExecutionMode,
} from "./interrupts.mts";
import { handleDevices } from "./devices.mts";
import { handleTimer } from "./timers.mts";

const instructionCache = new Map();

export function packExecute(error, err_msg, err_type, draw) {
    const ret = {};

    ret.error = error;
    ret.msg = err_msg;
    ret.type = err_type;
    ret.draw = draw;

    return ret;
}

export function getPC() {
    const pc_reg = crex_findReg_bytag("program_counter");
    const pc_address = readRegister(pc_reg.indexComp, pc_reg.indexElem);
    return BigInt(pc_address);
}

export function setPC(value) {
    const pc_reg = crex_findReg_bytag("program_counter");
    writeRegister(value, pc_reg.indexComp, pc_reg.indexElem);
    logger.debug(
        "PC register updated to " +
            readRegister(pc_reg.indexComp, pc_reg.indexElem),
    );
    const offset = BigInt(newArchitecture.config.pc_offset || 0n);
    status.virtual_PC = BigInt(value + offset);
    logger.debug("Virtual PC register updated to " + status.virtual_PC);
    return null;
}

export function hasVirtualPCChanged(oldVirtualPC) {
    return oldVirtualPC !== status.virtual_PC;
}

/**
 * Performs validation checks to determine if execution should continue. This is used to prevent the execution from continuing AFTER it has already finished, but the user tries to step again.
 * @param {boolean} includeLogging - Whether to include debug logging statements
 * @returns {Object|null} - Returns execution result object if validation fails, or null if validation passes
 */
function performExecutionChecks() {
    if (status.execution_index < -1) {
        return packExecute(true, "The program has finished", "warning", null);
    }
    if (status.execution_index === -1) {
        return packExecute(
            true,
            "The program has finished with errors",
            "danger",
            null,
        );
    } else if (status.run_program === 3) {
        return packExecute(false, "", "info", null);
    }

    return null;
}

/**
 * Returns the address of the program's entrypoint.
 *
 * @returns {Number | undefined}
 */
function get_entrypoint() {
    // search main tag
    const entrypoint = instructions.find(
        i => i.Label === newArchitecture.config.main_function,
    )?.Address;

    return entrypoint
        ? parseInt(entrypoint, 16)
        : newArchitecture.config.start_address;
}

/**
 * Initializes the execution, setting the PC to the desired address.
 */
export function initialize_execution() {
    if (status.execution_init !== 1) {
        return;
    }

    // Set the PC to the entry point of the architecture. Specified in the architecture
    const pc_reg = crex_findReg_bytag("program_counter");

    const address = get_entrypoint();

    if (address === undefined || address === null) {
        throw new Error(
            "Start address not defined in architecture configuration",
        );
    }
    writeRegister(address, pc_reg.indexComp, pc_reg.indexElem);
    status.execution_init = 0;

    // set execution index
    const entrypoint_index = instructions.findIndex(
        i => parseInt(i.Address, 16) === Number(getPC()),
    );
    status.execution_index = entrypoint_index === -1 ? 0 : entrypoint_index;
}

function handle_interrupts(draw) {
    if (status.interrupts_enabled && checkInterrupt()) {
        draw.warning.push(status.execution_index); // Print interrupt badge on instruction
        handleInterrupt();

        // update execution_index accordingly
        const currentIndex = instructions.findIndex(
            i => parseInt(i.Address, 16) === Number(getPC()),
        );
        status.execution_index = currentIndex === -1 ? 0 : currentIndex;
    }
}

function updateExecutionStatus(draw) {
    // Check for program termination due to error
    if (status.execution_index === -1) {
        status.error = 1;
        return packExecute(false, "", "info", null);
    } else if (status.execution_index === -2) {
        // Normal program termination
        return packExecute(false, "", "info", null);
    }

    // If no error occurred and we haven't reached the end of instructions
    if (status.error !== 1 && status.execution_index < instructions.length) {
        // Find which instruction corresponds to the current PC value
        const pc_address = getPC();
        let found = false;

        // mark previous instruction
        draw.info.push(status.execution_index);

        for (let i = 0; i < instructions.length; i++) {
            const address = BigInt(instructions[i].Address);

            if (address === pc_address) {
                // PC matches this instruction - update execution index and mark as success
                status.execution_index = i;
                draw.success.push(status.execution_index);
                found = true;
                break;
            }
        }

        // Handle case when PC doesn't match any instruction address
        if (!found) {
            draw.space.push(status.execution_index);

            // Set execution index past the end to indicate completion
            if (status.run_program === 3) {
                // For run_program=3 (specific execution mode)
                status.execution_index = instructions.length + 1;
            } else {
                // For standard execution modes
                status.execution_index = instructions.length + 1;
            }
        }
    }

    // Return null to continue execution
    return null;
}

function incrementProgramCounter(nwords) {
    const increment = BigInt((nwords * WORDSIZE) / BYTESIZE);
    const pc_address = BigInt(getPC());
    setPC(pc_address + increment);
    logger.debug("PC register updated to " + getPC());
    return null;
}

function executeInstructionAndHandlePC(draw, preloadFunction) {
    /*
     *  Depending on the architecture, the PC can point to different
     *  addresses. For example, in MIPS/RISC-V, the PC points to the
     *  CURRENT instruction, but in ARM, the PC points to the
     *  NEXT instruction + 4, so we need to adapt the value of the
     *  PC that will be seen by the instruction.
     *
     *  We solve this by using a "virtual" PC that is used by the
     *  instruction and the real PC that is used by the
     *  architecture.
     *
     *  The virtual PC is stored in status.virtual_pc and is
     *  updated by the instruction. The real PC is stored in
     *  the PC register and is updated by the architecture.
     */
    // Store initial virtual PC before instruction execution
    const initialVirtualPC = status.virtual_PC;

    // Execute instruction and handle errors
    if (preloadFunction) {
        try {
            preloadFunction();
        } catch (e) {
            logger.error("Preload function error: " + e.stack);
            draw.danger.push(status.execution_index);
            status.execution_index = -1; // Set execution index to -1 to indicate error
            return packExecute(
                true,
                "Error executing preload function: " + e.message,
                "danger",
                draw,
            );
        }
    }

    // Check if PC has changed
    if (hasVirtualPCChanged(initialVirtualPC)) {
        // Update the real PC with the new virtual PC
        setPC(status.virtual_PC);
        logger.debug(
            "Virtual PC changed, updating real PC to " + status.virtual_PC,
        );
    }

    return null; // No errors
}

/**
 * Processes the current instruction (fetch, decode, execute)
 * @param {Object} draw - The drawing object for UI updates
 * @param {boolean} enableCache - A flag to enable or disable the instruction cache.
 * @returns {Object|null} - Returns execution result object if execution should stop, or null to continue
 */
function processCurrentInstruction(draw, enableCache = true) {
    // 1. Fetch
    // When fetching, we could have an instruction that spans multiple words,
    // so to make sure we always get the full instruction, we read however many
    // words the longest instruction needs (MAXNWORDS).

    let pc_address = getPC();
    let instruction;
    let asm;
    let machineCode;
    let preloadFunction;

    // Check for instruction in cache only if caching is enabled
    if (enableCache && instructionCache.has(pc_address)) {
        // If instruction is already cached, retrieve it
        ({ instruction, asm, machineCode, preloadFunction } =
            instructionCache.get(pc_address));
        // Increment PC based on instruction size
        incrementProgramCounter(instruction.nwords);
    } else {
        // This block executes if cache is disabled OR if it's a cache miss.
        const words = [];
        const word_size_in_bytes = BigInt(WORDSIZE / BYTESIZE);

        for (let i = 0; i < MAXNWORDS; i++) {
            // Calculate the target address based on the original pc_address and the loop index
            const target_address = pc_address + BigInt(i) * word_size_in_bytes;
            let wordBytes;
            try {
                // Read the word at the calculated address
                wordBytes = main_memory.readWord(target_address);
            } catch (e) {
                draw.danger.push(status.execution_index);
                status.execution_index = -1; // Set execution index to -1 to indicate error
                return packExecute(
                    true,
                    "Error reading memory at address: " + target_address + " - " + e.message,
                    "danger",
                    draw,
                );
            }
            const word = Array.from(new Uint8Array(wordBytes))
                .map(byte => byte.toString(16).padStart(2, "0"))
                .join("");

            words.push(word);
        }
        // Join the words to form the full instruction word
        const word = words.join("");

        // 2. Decode instruction
        const returnValue = decode_instruction("0x" + word);
        if (returnValue.status === "error") {
            // If decoding fails, return an error
            draw.danger.push(status.execution_index);
            status.execution_index = -1; // Set execution index to -1 to indicate error
            return packExecute(
                true,
                "Error decoding instruction: " + returnValue.reason,
                "danger",
                draw,
            );
        }
        instruction = returnValue.value;

        asm = instruction.instructionExecPartsWithProperNames.join(" ");
        machineCode = words.slice(0, instruction.nwords).join("");

        // 3. Build instruction preload
        preloadFunction = buildInstructionPreload(instruction);

        // check privileged instructions
        if (
            status.execution_mode === ExecutionMode.User &&
            instruction.properties?.includes("privileged")
        ) {
            throw new Error(
                "💀 Can't execute privileged instruction '" +
                    instruction.name +
                    "' in User mode.",
            );
        }

        // Store the newly fetched and decoded instruction in the cache if enabled
        if (enableCache) {
            instructionCache.set(pc_address, {
                instruction,
                asm,
                machineCode,
                preloadFunction,
            });
        }
        // 4. Increment PC based on instruction size
        incrementProgramCounter(instruction.nwords);
    }

    // 5. Execute instruction and handle PC changes
    const executeResult = executeInstructionAndHandlePC(draw, preloadFunction);
    if (executeResult !== null) {
        return executeResult;
    }
    // 6. Update execution statistics
    updateStats(instruction.type, instruction.clk_cycles);

    // Return instruction data for CLI display
    return {
        asm,
        machineCode,
        success: true,
    };
}

/**
 * Creates a drawing object used for UI updates
 * @returns {Object} Draw object with arrays for different instruction states
 */
function createDrawObject() {
    return {
        space: [],
        info: [],
        success: [],
        warning: [],
        danger: [],
        flash: [],
    };
}
/**
 * Executes a single instruction cycle (fetch-decode-execute)
 * @param {Object} draw - The drawing object for UI updates
 * @returns {Object|null} - Returns execution result object if execution should stop, or null to continue
 */
function executeInstructionCycle(draw) {
    // Log debug information
    logger.debug("Execution Index:" + status.execution_index);
    logger.debug("PC Register: " + readRegister(0, 0));

    // Special check for stack visualization purposes
    if (
        status.execution_index ===
        instructions.findIndex(
            i => parseInt(i.Address, 16) === get_entrypoint(),
        )
    ) {
        stackTracker.newFrame(tag_instructions[getPC()]?.tag || "");
    }

    // Check for conditions that would stop execution
    const inLoopCheckResult = performExecutionChecks();
    if (inLoopCheckResult !== null) {
        return inLoopCheckResult;
    }

    // Update execution index based on PC
    // get_execution_index(draw);

    // Process the current instruction
    const processingResult = processCurrentInstruction(draw);
    if (processingResult !== null && !processingResult.success) {
        return processingResult;
    }

    // Handle any pending interrupts
    handle_interrupts(draw);

    // handle timer
    handleTimer();
    
    // Handle Devices
    handleDevices();

    // Update execution status and determine next instruction
    const statusResult = updateExecutionStatus(draw);

    // Return the processing result with instruction data, or combine with status result if there's an error
    if (statusResult === null) {
        return processingResult;
    } else {
        return {
            ...statusResult,
            instructionData: processingResult,
        };
    }
}

export function step() {
    // Create draw object for UI updates
    const draw = createDrawObject();
    status.error = 0;

    // Execute a single instruction cycle
    const cycleResult = executeInstructionCycle(draw);

    // Check if error occurred during execution
    if (status.execution_index === -1) {
        status.error = 1;
    }

    // Capture instruction data from the executed cycle before checking PC validity
    let instructionData = null;
    if (cycleResult && cycleResult.instructionData) {
        instructionData = cycleResult.instructionData;
    } else if (cycleResult && cycleResult.asm) {
        // If cycleResult is the instruction data itself
        instructionData = cycleResult;
    }

    // Check if the PC is outside valid execution segments
    const pc_address = getPC();
    // const currentSegment = main_memory.getSegmentForAddress(pc_address);

    // if (!main_memory.isValidAccess(pc_address, "execute")) {
    //     status.execution_index = -2;
    //     const result = packExecute(
    //         false,
    //         `The execution of the program has finished - PC in non-executable segment '${currentSegment}'`,
    //         "success",
    //         draw,
    //     );
    //     // Include the instruction data from the last executed instruction
    //     if (instructionData) {
    //         result.instructionData = instructionData;
    //     }
    //     return result;
    // }

    // const segments = main_memory.getMemorySegments();
    // const textSegment = segments.get("text");
    // if (textSegment) {
    //     const written = main_memory.getWrittenAddresses();
    //     // Only consider addresses within the text segment
    //     const textWritten = written.filter(
    //         addr =>
    //             addr >= Number(textSegment.start) &&
    //             addr <= Number(textSegment.end),
    //     );
    //     if (textWritten.length > 0) {
    //         const maxTextAddr = Math.max(...textWritten);
    //         if (pc_address > BigInt(maxTextAddr)) {
    //             status.execution_index = -2;
    //             const result = packExecute(
    //                 false,
    //                 `The execution of the program has finished - PC (${pc_address}) is higher than the highest written address (${maxTextAddr}) in the text segment`,
    //                 "success",
    //                 draw,
    //             );
    //             if (instructionData) {
    //                 result.instructionData = instructionData;
    //             }
    //             return result;
    //         }
    //     }
    // }

    // Return execution result with instruction data
    const result = packExecute(status.error, cycleResult.msg, null, draw);
    if (instructionData) {
        result.instructionData = instructionData;
    }

    return result;
}

//Exit syscall

export function creator_executor_exit(error) {
    // Google Analytics
    creator_ga("execute", "execute.exit");

    if (error) {
        status.execution_index = -1;
    } else {
        status.execution_index = -2; // Set to -2 to indicate normal exit
    }
}
/*
 * Auxiliar functions
 */

export function crex_show_notification(msg, level) {
    if (typeof window !== "undefined") show_notification(msg, level);
    else console.log(level.toUpperCase() + ": " + msg);
}

/**
 * Modifies the stack limit
 *
 * @param {bigint} stackLimit
 */
export function writeStackLimit(stackLimit) {
    const draw = {
        space: [],
        info: [],
        success: [],
        warning: [],
        danger: [],
        flash: [],
    };

    if (stackLimit === null) {
        return;
    }

    // Convert to BigInt if not already
    const stackLimitBigInt = BigInt(stackLimit);

    // Get memory segments from the Memory object
    const segments = main_memory.getMemorySegments();
    const dataSegment = segments.get("data");
    const textSegment = segments.get("text");

    // // Check if stack pointer would be placed in data segment
    // if (
    //     dataSegment &&
    //     stackLimitBigInt <= dataSegment.end &&
    //     stackLimitBigInt >= dataSegment.start
    // ) {
    //     draw.danger.push(status.execution_index);
    //     throw packExecute(
    //         true,
    //         "Stack pointer cannot be placed in the data segment",
    //         "danger",
    //         null,
    //     );
    // }

    // // Check if stack pointer would be placed in text segment
    // if (
    //     textSegment &&
    //     stackLimitBigInt <= textSegment.end &&
    //     stackLimitBigInt >= textSegment.start
    // ) {
    //     draw.danger.push(status.execution_index);
    //     throw packExecute(
    //         true,
    //         "Stack pointer cannot be placed in the text segment",
    //         "danger",
    //         null,
    //     );
    // }

    // Get current stack pointer from memory segments
    const stackSegment = segments.get("stack");

    // Check if stack pointer would be placed in stack segment
    if (stackSegment && stackLimitBigInt > stackSegment.end) {
        draw.danger.push(status.execution_index);
        throw packExecute(
            true,
            "Stack pointer cannot be outside the stack segment",
            "danger",
            null,
        );
    }

    stackTracker.updateCurrentFrame(stackLimit);

    // Update the stack segment in the memory layout if it exists
    if (stackSegment) {
        // Update the memory segment's start address to reflect the new stack pointer
        stackSegment.start = Number(stackLimitBigInt);
        // And update the size of the stack segment
        stackSegment.size = stackSegment.end - stackSegment.start;
    }
}
