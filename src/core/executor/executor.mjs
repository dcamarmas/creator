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
import { instructions } from "../compiler/compiler.mjs";
import {
    status,
    architecture,
    architecture_hash,
    backup_stack_address,
    backup_data_address,
    stats,
    stats_value,
    app,
} from "../core.mjs";
import { creator_memory_zerofill } from "../memory/memoryManager.mjs";
import { creator_memory_reset } from "../memory/memoryOperations.mjs";
import { crex_findReg_bytag } from "../register/registerLookup.mjs";
import {
    readRegister,
    writeRegister,
} from "../register/registerOperations.mjs";
import { creator_callstack_reset } from "../sentinel/sentinel.mjs";
import {
    track_stack_reset,
    track_stack_setsp,
} from "../memory/stackTracker.mjs";
import {
    bi_intToBigInt,
    bi_BigIntTofloat,
    bi_floatToBigInt,
} from "../utils/bigint.mjs";
import { creator_ga } from "../utils/creator_ga.mjs";
import { logger } from "../utils/creator_logger.mjs";
import { bin2hex, float2bin, hex2double } from "../utils/utils.mjs";
import { decode_instruction } from "./decoder.mjs";
import { buildInstructionPreload } from "./preload.mjs";

export function packExecute(error, err_msg, err_type, draw) {
    const ret = {};

    ret.error = error;
    ret.msg = err_msg;
    ret.type = err_type;
    ret.draw = draw;

    return ret;
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
        if (e instanceof SyntaxError)
            msg =
                "The definition of the instruction contains errors, please review it" +
                e.stack;
        else msg = e.msg;

        logger.error("Error: " + e.stack);
        draw.danger.push(status.execution_index);
        status.execution_index = -1;

        return packExecute(true, msg, "danger", draw);
    }
}

function perform_pre_execute_checks() {
    logger.debug("Execution Index:" + status.execution_index);
    logger.debug("Register (0,0): " + readRegister(0, 0));

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
        return packExecute(false, "", "info", null);
    }

    return null;
}

function perform_in_loop_checks() {
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
        return packExecute(false, "", "info", null);
    }
    return null;
}

function initialize_execution(draw) {
    if (status.execution_init === 1) {
        for (let i = 0; i < instructions.length; i++) {
            if (instructions[i].Label == architecture.arch_conf[5].value) {
                writeRegister(
                    bi_intToBigInt(instructions[i].Address, 10),
                    0,
                    0,
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
    const pc_reg = crex_findReg_bytag("program_counter");
    const pc_reg_value = readRegister(pc_reg.indexComp, pc_reg.indexElem);

    // Save current PC to EPC
    writeRegister(pc_reg_value, epc_reg.indexComp, epc_reg.indexElem);

    // Jump to handler
    const handler_address = 0;
    writeRegister(handler_address, pc_reg.indexComp, pc_reg.indexElem);

    // Update execution index
    // get_execution_index(draw); TODO: This is used for the UI

    // Clear interrupt
    writeRegister(0, i_reg.indexComp, i_reg.indexElem);
}

//Get execution index by PC
function get_execution_index(draw) {
    const pc_reg = crex_findReg_bytag("program_counter");
    const pc_reg_value = readRegister(pc_reg.indexComp, pc_reg.indexElem);
    let found_index = -1;
    // The value of the program counter is DECIMAL
    // The value of the Address is HEXADECIMAL
    // When calling the BigInt function, the address is converted to DECIMAL
    for (let i = 0; i < instructions.length; i++) {
        // Mark current instruction and update execution index if PC matches
        const address = BigInt(instructions[i].Address);
        if (address === pc_reg_value) {
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
function handle_next_instruction(draw, error) {
    if (status.execution_index === -1) {
        error = 1;
        return packExecute(false, "", "info", null);
    }

    if (error !== 1 && status.execution_index < instructions.length) {
        for (let i = 0; i < instructions.length; i++) {
            const pc_reg = crex_findReg_bytag("program_counter");
            const pc_reg_value = readRegister(
                pc_reg.indexComp,
                pc_reg.indexElem,
            );
            // We're converting to BigInt AND to DECIMAL in the same line
            const address = BigInt(instructions[i].Address);
            if (address === pc_reg_value) {
                status.execution_index = i;
                draw.success.push(status.execution_index);
                break;
            } else if (
                i == instructions.length - 1 &&
                status.run_program === 3
            ) {
                status.execution_index = instructions.length + 1;
            } else if (i == instructions.length - 1) {
                draw.space.push(status.execution_index);
                status.execution_index = instructions.length + 1;
            }
        }
    }

    if (
        status.execution_index >= instructions.length &&
        status.run_program === 3
    ) {
        for (let i = 0; i < instructions.length; i++) {
            draw.space.push(i);
        }
        draw.info = [];
        return packExecute(
            false,
            "The execution of the program has finished",
            "success",
            draw,
        );
    } else if (
        status.execution_index >= instructions.length &&
        status.run_program != 3
    ) {
        for (let i = 0; i < instructions.length; i++) {
            draw.space.push(i);
        }
        draw.info = [];
        status.execution_index = -2;
        return packExecute(
            false,
            "The execution of the program has finished",
            "success",
            draw,
        );
    } else if (error !== 1) {
        draw.success.push(status.execution_index);
    }

    return null;
}

// eslint-disable-next-line max-lines-per-function
function execute_instruction() {
    // 1. Prepare drawing object and local variables
    const draw = {
        space: [],
        info: [],
        success: [],
        warning: [],
        danger: [],
        flash: [],
    };

    let error = 0;
    let pc_reg;
    let epc_reg;
    let pc_reg_value;

    // 2. Perform checks before the loop
    const pre_check_result = perform_pre_execute_checks();
    if (pre_check_result !== null) {
        return pre_check_result;
    }

    // 3. Execute instructions in a loop until conditions break
    do {
        // 3.1 Logging and debugging info
        logger.debug("Execution Index:" + status.execution_index);
        logger.debug("Register (0,0): " + readRegister(0, 0));

        // 3.2 Check for empty instruction set or finished program
        const in_loop_check_result = perform_in_loop_checks();
        if (in_loop_check_result !== null) {
            return in_loop_check_result;
        }

        // 3.3 Initialize execution (find main label if needed)
        const init_result = initialize_execution(draw);
        if (init_result !== null) {
            return init_result;
        }

        // 3.4 Get execution index by PC
        const _exec_index = get_execution_index(draw); // TODO: Return value might be used in the UI

        // 3.5 Handle interruptions if any
        handle_interruptions(draw);

        // 3.6 Identify and prepare the instruction to be executed
        const instruction = instructions[status.execution_index].loaded;
        const decoded = decode_instruction(instruction);
        let {
            type,
            signatureDef,
            signatureParts,
            signatureRawParts,
            instructionExec,
            instructionExecParts,
            auxDef,
            nwords,
        } = decoded;

        // 3.7 Increase PC register to point to the next instruction
        pc_reg = crex_findReg_bytag("program_counter");
        const arch_bits = parseInt(architecture.arch_conf[1].value, 10);
        const word_size = arch_bits / 8;
        writeRegister(
            readRegister(pc_reg.indexComp, pc_reg.indexElem) +
                BigInt(nwords * word_size),
            0,
            0,
        );
        logger.debug(
            "PC register updated to " +
                readRegister(pc_reg.indexComp, pc_reg.indexElem),
        );
        logger.debug("auxDef: " + auxDef);

        // 3.8 Preload instruction resources if needed
        const build_preload_result = buildInstructionPreload(
            signatureDef,
            instructionExec,
            instructionExecParts,
            signatureRawParts,
            signatureParts,
            auxDef,
            instructions[status.execution_index].preload,
            status.execution_index,
        );
        if (build_preload_result !== null) {
            return build_preload_result;
        }

        // 3.9 Execute preload function and handle errors
        const preloadError = executePreload(draw, error);
        if (preloadError) {
            return preloadError;
        }

        // 3.10 Update stats and clock cycles
        stats_update(type);
        clk_cycles_update(type);

        // 3.11 Resolve next instruction or program end
        const next_instruction_result = handle_next_instruction(draw, error);
        if (next_instruction_result !== null) {
            return next_instruction_result;
        }
    } while (instructions[status.execution_index].hide === true);

    // 4. Return final packExecute result
    return packExecute(false, null, null, draw);
}

export function executeProgramOneShot(limit_n_instructions) {
    let ret = null;

    // Google Analytics
    creator_ga("execute", "execute.run");

    // execute program
    for (let i = 0; i < limit_n_instructions; i++) {
        ret = execute_instruction();

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

// eslint-disable-next-line max-lines-per-function
function reset() {
    // Google Analytics
    creator_ga("execute", "execute.reset");

    status.execution_index = 0;
    status.execution_init = 1;
    status.run_program = 0;

    // Reset stats
    stats_reset();

    //Power consumption reset
    clk_cycles_reset();

    // Reset console
    status.keyboard = "";
    status.display = "";

    for (let i = 0; i < architecture_hash.length; i++) {
        for (let j = 0; j < architecture.components[i].elements.length; j++) {
            if (
                architecture.components[i].double_precision === false ||
                (architecture.components[i].double_precision === true &&
                    architecture.components[i].double_precision_type ==
                        "extended")
            ) {
                architecture.components[i].elements[j].value =
                    architecture.components[i].elements[j].default_value;
            } else {
                var aux_value;
                var aux_sim1;
                var aux_sim2;

                for (let a = 0; a < architecture_hash.length; a++) {
                    for (
                        let b = 0;
                        b < architecture.components[a].elements.length;
                        b++
                    ) {
                        if (
                            architecture.components[a].elements[
                                b
                            ].name.includes(
                                architecture.components[i].elements[j]
                                    .simple_reg[0],
                            ) !== false
                        ) {
                            aux_sim1 = bin2hex(
                                float2bin(
                                    bi_BigIntTofloat(
                                        architecture.components[a].elements[b]
                                            .default_value,
                                    ),
                                ),
                            );
                        }
                        if (
                            architecture.components[a].elements[
                                b
                            ].name.includes(
                                architecture.components[i].elements[j]
                                    .simple_reg[1],
                            ) !== false
                        ) {
                            aux_sim2 = bin2hex(
                                float2bin(
                                    bi_BigIntTofloat(
                                        architecture.components[a].elements[b]
                                            .default_value,
                                    ),
                                ),
                            );
                        }
                    }
                }

                aux_value = aux_sim1 + aux_sim2;
                architecture.components[i].elements[j].value = bi_floatToBigInt(
                    hex2double("0x" + aux_value),
                );
            }
        }
    }

    architecture.memory_layout[4].value = backup_stack_address;
    architecture.memory_layout[3].value = backup_data_address;

    // reset memory
    creator_memory_reset();

    //Stack Reset
    creator_callstack_reset();
    track_stack_reset();

    return true;
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
    if (
        stackLimit <= parseInt(architecture.memory_layout[3].value) &&
        stackLimit >= parseInt(parseInt(architecture.memory_layout[2].value))
    ) {
        draw.danger.push(status.execution_index);
        throw packExecute(
            true,
            "Stack pointer cannot be placed in the data segment",
            "danger",
            null,
        );
    } else if (
        stackLimit <= parseInt(architecture.memory_layout[1].value) &&
        stackLimit >= parseInt(architecture.memory_layout[0].value)
    ) {
        draw.danger.push(status.execution_index);
        throw packExecute(
            true,
            "Stack pointer cannot be placed in the text segment",
            "danger",
            null,
        );
    } else {
        const diff = parseInt(architecture.memory_layout[4].value) - stackLimit;
        if (diff > 0) {
            creator_memory_zerofill(stackLimit, diff);
        }

        track_stack_setsp(stackLimit);
        architecture.memory_layout[4].value =
            "0x" + stackLimit.toString(16).padStart(8, "0").toUpperCase();
    }
}
/*
 * Stats
 */
function stats_update(type) {
    for (let i = 0; i < stats.length; i++) {
        if (type == stats[i].type) {
            stats[i].number_instructions++;
            stats_value[i]++;

            status.totalStats++;
            if (typeof app !== "undefined") {
                app._data.status.totalStats++;
            }
        }
    }

    for (let i = 0; i < stats.length; i++) {
        stats[i].percentage = (
            (stats[i].number_instructions / status.totalStats) *
            100
        ).toFixed(2);
    }
}
function stats_reset() {
    status.totalStats = 0;
    if (typeof app !== "undefined") {
        app._data.status.totalStats = 0;
    }

    for (let i = 0; i < stats.length; i++) {
        stats[i].percentage = 0;

        stats[i].number_instructions = 0;
        stats_value[i] = 0;
    }
}
/*
 * CLK Cycles
 */

export var total_clk_cycles = 0;
const clk_cycles_value = [
    {
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
];
const clk_cycles = [
    { type: "Arithmetic floating point", clk_cycles: 0, percentage: 0 },
    { type: "Arithmetic integer", clk_cycles: 0, percentage: 0 },
    { type: "Comparison", clk_cycles: 0, percentage: 0 },
    { type: "Conditional bifurcation", clk_cycles: 0, percentage: 0 },
    { type: "Control", clk_cycles: 0, percentage: 0 },
    { type: "Function call", clk_cycles: 0, percentage: 0 },
    { type: "I/O", clk_cycles: 0, percentage: 0 },
    { type: "Logic", clk_cycles: 0, percentage: 0, abbreviation: "Log" },
    { type: "Memory access", clk_cycles: 0, percentage: 0 },
    { type: "Other", clk_cycles: 0, percentage: 0 },
    { type: "Syscall", clk_cycles: 0, percentage: 0 },
    { type: "Transfer between registers", clk_cycles: 0, percentage: 0 },
    { type: "Unconditional bifurcation", clk_cycles: 0, percentage: 0 },
];
function clk_cycles_update(type) {
    for (let i = 0; i < clk_cycles.length; i++) {
        if (type == clk_cycles[i].type) {
            clk_cycles[i].clk_cycles++;

            clk_cycles_value[0].data[i]++;

            total_clk_cycles++;
            if (typeof app !== "undefined") {
                app._data.total_clk_cycles++;
            }
        }
    }

    for (let i = 0; i < stats.length; i++) {
        clk_cycles[i].percentage = (
            (clk_cycles[i].clk_cycles / total_clk_cycles) *
            100
        ).toFixed(2);
    }
}
function clk_cycles_reset() {
    total_clk_cycles = 0;
    if (typeof app !== "undefined") {
        app._data.total_clk_cycles = 0;
    }

    for (let i = 0; i < clk_cycles.length; i++) {
        clk_cycles[i].percentage = 0;

        clk_cycles_value[0].data[i] = 0;
    }
}

/*
 *  Execute binary
 */
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
function get_number_binary(bin) {
    return "0x" + bin2hex(bin);
}
