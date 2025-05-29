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
import { instructions } from "../compiler/compiler.mjs";
import {
    app,
    architecture,
    stats_update,
    status,
    REGISTERS,
    clk_cycles_update,
} from "../core.mjs";
import { creator_memory_zerofill } from "../memory/memoryManager.mjs";
import { crex_findReg_bytag } from "../register/registerLookup.mjs";
import {
    readRegister,
    writeRegister,
} from "../register/registerOperations.mjs";
import { track_stack_setsp } from "../memory/stackTracker.mjs";
import { bi_intToBigInt } from "../utils/bigint.mjs";
import { creator_ga } from "../utils/creator_ga.mjs";
import { logger } from "../utils/creator_logger.mjs";
import { decode_instruction } from "./decoder.mjs";
import { buildInstructionPreload } from "./preload.mjs";
import { dumpMemory } from "../core.mjs"; // To use with debugger
import { main_memory, main_memory_write_value } from "../memory/memoryCore.mjs"; // For debugging only

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
    return pc_address;
}

export function setPC(value) {
    const pc_reg = crex_findReg_bytag("program_counter");
    writeRegister(value, pc_reg.indexComp, pc_reg.indexElem);
    logger.debug(
        "PC register updated to " +
            readRegister(pc_reg.indexComp, pc_reg.indexElem),
    );
    const offset = -4n;
    status.virtual_PC = BigInt(value + offset); // TODO: This should depend on the architecture
    logger.debug("Virtual PC register updated to " + status.virtual_PC);
    return null;
}

export function hasVirtualPCChanged(oldVirtualPC) {
    return oldVirtualPC !== status.virtual_PC;
}

function executePreload(draw) {
    try {
        const result = instructions[status.execution_index].preload();
        if (typeof result !== "undefined" && result.error) {
            return result;
        }
        return null;
    } catch (e) {
        let msg = "";
        if (e instanceof SyntaxError) {
            msg =
                "The definition of the instruction contains errors, please review it" +
                e.stack;
        } else msg = e.msg;

        logger.error("Error: " + e.stack);
        draw.danger.push(status.execution_index);
        status.execution_index = -1;

        return packExecute(true, msg, "danger", draw);
    }
}

/**
 * Performs validation checks to determine if execution should continue
 * @param {boolean} includeLogging - Whether to include debug logging statements
 * @returns {Object|null} - Returns execution result object if validation fails, or null if validation passes
 */
function performExecutionChecks(includeLogging = false) {
    if (includeLogging) {
        logger.debug("Execution Index:" + status.execution_index);
        logger.debug("Register (0,0): " + readRegister(0, 0));
    }

    if (instructions.length === 0) {
        return packExecute(true, "No instructions in memory", "danger", null);
    }
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
        // TODO: Is this needed?
        return null;
        // return packExecute(false, "", "info", null);
    }

    return null;
}

function initialize_execution(draw) {
    if (status.execution_init === 1) {
        for (let i = 0; i < instructions.length; i++) {
            if (instructions[i].Label == architecture.arch_conf[5].value) {
                // Set the program counter to the address of the label
                const pc_reg = crex_findReg_bytag("program_counter");
                const pc_size_bits = parseInt(
                    REGISTERS[0].elements[0].nbits,
                    10,
                );
                writeRegister(
                    bi_intToBigInt(instructions[i].Address, 10, pc_size_bits),
                    pc_reg.indexComp,
                    pc_reg.indexElem,
                );
                status.execution_init = 0;
                break;
            } else if (i == instructions.length - 1) {
                status.execution_index = -1;
                return packExecute(
                    true,
                    'Label "' + architecture.arch_conf[5].value + '" not found',
                    "danger",
                    null,
                );
            }
        }
    }
    return null;
}
function handle_interruptions(draw) {
    const i_reg = crex_findReg_bytag("event_cause");
    if (i_reg.match == 0) {
        return;
    }

    const i_reg_value = readRegister(i_reg.indexComp, i_reg.indexElem);
    if (i_reg_value == 0) {
        return;
    }

    logger.info("Interruption detected");
    draw.warning.push(status.execution_index);

    const epc_reg = crex_findReg_bytag("exception_program_counter");

    // Save current PC to EPC
    writeRegister(pc_reg_value, epc_reg.indexComp, epc_reg.indexElem);

    // Jump to handler
    const handler_address = 0;
    setPC(handler_address);

    // Update execution index
    // get_execution_index(draw); TODO: This is used for the UI

    // Clear interrupt
    writeRegister(0, i_reg.indexComp, i_reg.indexElem);
}

//Get execution index by PC
function get_execution_index(draw) {
    const pc_address = getPC();
    let found_index = -1;
    // The value of the program counter is DECIMAL
    // The value of the Address is HEXADECIMAL
    // When calling the BigInt function, the address is converted to DECIMAL
    for (let i = 0; i < instructions.length; i++) {
        // Mark current instruction and update execution index if PC matches
        const address = BigInt(instructions[i].Address);
        if (address === pc_address) {
            status.execution_index = i;
            found_index = i;

            logger.debug(
                `Instruction Hidden Status: ${instructions[i].hide}`,
                "DEBUG",
            );
            logger.debug(
                `Current Execution Index: ${i} of ${instructions.length}`,
                "DEBUG",
            );
            logger.debug(
                `Instruction Address: ${instructions[i].Address}`,
                "DEBUG",
            );

            if (!instructions[i].hide) {
                draw.info.push(i);
            }
        } else if (!instructions[status.execution_index].hide) {
            draw.space.push(i);
        }
    }

    if (found_index === -1) {
        logger.error("Execution index not found");
    }

    return found_index;
}

// eslint-disable-next-line max-lines-per-function
function updateExecutionStatus(draw) {
    // Check for program termination due to error
    if (status.execution_index === -1) {
        status.error = 1;
        return packExecute(false, "", "info", null);
    }

    // If no error occurred and we haven't reached the end of instructions
    if (status.error !== 1 && status.execution_index < instructions.length) {
        // Find which instruction corresponds to the current PC value
        const pc_address = getPC();
        let found = false;

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

    // Handle program termination conditions
    if (status.execution_index >= instructions.length) {
        // Mark all instructions as space (not active)
        for (let i = 0; i < instructions.length; i++) {
            draw.space.push(i);
        }
        draw.info = [];

        // Set special execution index (-2) to indicate normal termination
        status.execution_index = -2;

        return packExecute(
            false,
            "The execution of the program has finished",
            "success",
            draw,
        );
    } // Case 2: Continuing execution (no error)
    else if (status.error !== 1) {
        draw.success.push(status.execution_index);
    }

    // Return null to continue execution
    return null;
}

function incrementProgramCounter(nwords) {
    const arch_bits = parseInt(architecture.arch_conf[1].value, 10);
    const word_size = arch_bits / 8;
    const increment = BigInt(nwords * word_size);
    const pc_address = BigInt(getPC());
    setPC(pc_address + increment);
    logger.debug("PC register updated to " + getPC());
    return null;
}

function executeInstructionAndHandlePC(draw) {
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
    const preloadError = executePreload(draw);
    if (preloadError) {
        return preloadError;
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
 * @returns {Object|null} - Returns execution result object if execution should stop, or null to continue
 */
function processCurrentInstruction(draw) {
    // 1. Fetch instruction
    const instruction = instructions[status.execution_index].loaded;

    // 2. Decode instruction
    const decoded = decode_instruction(instruction);
    const {
        type,
        signatureDef,
        signatureParts,
        signatureRawParts,
        instructionExec,
        instructionExecParts,
        auxDef,
        nwords,
    } = decoded;

    // 3. Increment PC based on instruction size
    incrementProgramCounter(nwords);

    // 4. Build instruction preload
    const buildPreloadResult = buildInstructionPreload(
        signatureDef,
        instructionExec,
        instructionExecParts,
        signatureRawParts,
        signatureParts,
        auxDef,
        instructions[status.execution_index].preload,
        status.execution_index,
    );
    if (buildPreloadResult !== null) {
        return buildPreloadResult;
    }

    // 5. Execute instruction and handle PC changes
    const executeResult = executeInstructionAndHandlePC(draw);
    if (executeResult !== null) {
        return executeResult;
    }

    // 6. Update execution statistics
    stats_update(type);
    clk_cycles_update(type);

    return null;
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
    logger.debug("Register (0,0): " + readRegister(0, 0));

    // Check for conditions that would stop execution
    const inLoopCheckResult = performExecutionChecks();
    if (inLoopCheckResult !== null) {
        return inLoopCheckResult;
    }

    // Initialize execution environment if needed
    const initResult = initialize_execution(draw);
    if (initResult !== null) {
        return initResult;
    }

    // Update execution index based on PC
    get_execution_index(draw);

    // Handle any pending interruptions
    handle_interruptions(draw);

    // Process the current instruction
    const processingResult = processCurrentInstruction(draw);
    if (processingResult !== null) {
        return processingResult;
    }

    // Update execution status and determine next instruction
    return updateExecutionStatus(draw);
}

export function step() {
    // Create draw object for UI updates
    const draw = createDrawObject();
    status.error = 0;
    // Main execution loop
    do {
        // Execute a single instruction cycle
        const cycleResult = executeInstructionCycle(draw);
        if (cycleResult !== null) {
            return cycleResult;
        }

        // Check if error occurred during execution
        if (status.execution_index === -1) {
            status.error = 1;
            break;
        }
    } while (instructions[status.execution_index].hide === true);

    // Return execution result
    return packExecute(false, null, null, draw);
}

export function executeProgramOneShot(limit_n_instructions) {
    let ret = null;

    // Google Analytics
    creator_ga("execute", "execute.run");

    // execute program
    for (let i = 0; i < limit_n_instructions; i++) {
        ret = step();

        if (ret.error === true) {
            return ret;
        }
        if (status.execution_index < -1) {
            return ret;
        }
    }

    return packExecute(
        true,
        '"ERROR:" number of instruction limit reached :-(',
        null,
        null,
    );
}

//Exit syscall

export function creator_executor_exit(error) {
    // Google Analytics
    creator_ga("execute", "execute.exit");

    if (error) {
        status.execution_index = -1;
    } else {
        status.execution_index = instructions.length + 1;
    }
}
/*
 * Auxiliar functions
 */

export function crex_show_notification(msg, level) {
    if (typeof window !== "undefined") show_notification(msg, level);
    else console.log(level.toUpperCase() + ": " + msg);
}
// Modify the stack limit

export function writeStackLimit(stackLimit) {
    const draw = {
        space: [],
        info: [],
        success: [],
        warning: [],
        danger: [],
        flash: [],
    };

    if (stackLimit == null) {
        return;
    }

    // Convert to BigInt if not already
    const stackLimitBigInt = BigInt(stackLimit);

    // Convert memory layout values to BigInt for proper comparison
    const dataSegmentEnd = BigInt(architecture.memory_layout[3].value);
    const dataSegmentStart = BigInt(architecture.memory_layout[2].value);
    const textSegmentEnd = BigInt(architecture.memory_layout[1].value);
    const textSegmentStart = BigInt(architecture.memory_layout[0].value);
    const currentStackPointer = BigInt(architecture.memory_layout[4].value);

    if (
        stackLimitBigInt <= dataSegmentEnd &&
        stackLimitBigInt >= dataSegmentStart
    ) {
        draw.danger.push(status.execution_index);
        throw packExecute(
            true,
            "Stack pointer cannot be placed in the data segment",
            "danger",
            null,
        );
    } else if (
        stackLimitBigInt <= textSegmentEnd &&
        stackLimitBigInt >= textSegmentStart
    ) {
        draw.danger.push(status.execution_index);
        throw packExecute(
            true,
            "Stack pointer cannot be placed in the text segment",
            "danger",
            null,
        );
    } else {
        const diff = Number(currentStackPointer - stackLimitBigInt);
        if (diff > 0) {
            creator_memory_zerofill(Number(stackLimitBigInt), diff);
        }

        track_stack_setsp(Number(stackLimitBigInt));
        architecture.memory_layout[4].value =
            "0x" + stackLimitBigInt.toString(16).padStart(8, "0").toUpperCase();
    }
}
