/**
 *  Copyright 2018-2025 Felix Garcia Carballeira, Diego Camarmas Alonso,
 *                      Alejandro Calderon Mateos, Luis Daniel Casais Mezquida
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

import { architecture, status } from "../core.mjs";
import { crex_findReg_bytag } from "../register/registerLookup.mjs";
import {
    readRegister,
    writeRegister,
} from "../register/registerOperations.mjs";
import { console_log } from "../utils/creator_logger.mjs";

export enum InterruptType {
    Software = "SOFTWARE",
    Timer = "TIMER",
    External = "EXTERNAL",
    EnvironmentCall = "ECALL",
}

export enum ExecutionMode {
    User,
    Kernel,
}

/**
 * Enables interrupts
 */
export function enableInterrupts() {
    status.interrupts_enabled = true;
    return eval(architecture.interrupts.enable);
}

/**
 * Disables interrupts
 */
export function disableInterrupts() {
    status.interrupts_enabled = false;
    return eval(architecture.interrupts.disable);
}

/**
 * Checks if an interrupt has occured
 */
export function checkInterrupt(): InterruptType | null {
    return eval(architecture.interrupts.check);
}

/**
 * Creates an interrupt of the specified type.
 */
export function makeInterrupt(type: InterruptType): void {
    return eval(architecture.interrupts.create)(type);
}

/**
 * Handles an interrupt
 */
export function handleInterrupt() {
    console_log("Interruption detected");
    status.execution_mode = ExecutionMode.Kernel;

    // save PC to EPC (if EPC exists in the current architecture)
    const epc_reg = crex_findReg_bytag("exception_program_counter");
    const pc_reg = crex_findReg_bytag("program_counter");

    const pc_reg_value = readRegister(pc_reg.indexComp, pc_reg.indexElem);
    if (epc_reg.match === 1) {
        writeRegister(pc_reg_value, epc_reg.indexComp, epc_reg.indexElem);
    }

    // jump to interruption handler
    const handler_address = eval(architecture.interrupts.get_handler_addr);
    writeRegister(handler_address, pc_reg.indexComp, pc_reg.indexElem);

    // clear interruption
    eval(architecture.interrupts.clear);
}
