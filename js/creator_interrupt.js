/*
 *  Copyright 2018-2025 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos, Luis Daniel Casais Mezquida
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

/* INTERRUPT HANDLING */

let interruptsEnabled = false;

const InterruptType = {
    Software: 'InterruptType.Software',
    Timer: 'InterruptType.Timer',
    External: 'InterruptType.External',
    EnvironmentCall: 'InterruptType.EnvironmentCall',
};

const ExecutionMode = {
    User: 'ExecutionMode.User',
    Kernel: 'ExecutionMode.Kernel',
};

let currentExecutionMode = ExecutionMode.User;

/**
 * Enables interrupts
 */
function enableInterrupts() {
    interruptsEnabled = true;
    return eval(architecture.interrupts.interrupt_enable);
}

/**
 * Disables interrupts
 */
function disableInterrupts() {
    interruptsEnabled = false;
    return eval(architecture.interrupts.interrupt_disable);
}

/**
 * Checks if an interrupt has occured
 * @return {InterruptType, null}
 */
function checkInterrupt() {
    return eval(architecture.interrupts.interrupt_check);
}

/**
 * Handles an interrupt
 */
function handleInterrupt() {
    console_log('Interruption detected');
    currentExecutionMode = ExecutionMode.Kernel;

    // save PC to EPC
    var epc_reg = crex_findReg_bytag('exception_program_counter');
    var pc_reg = crex_findReg_bytag('program_counter');

    var pc_reg_value = readRegister(pc_reg.indexComp, pc_reg.indexElem);
    writeRegister(pc_reg_value, epc_reg.indexComp, epc_reg.indexElem);

    // jump to interruption handler
    let handler_address = eval(architecture.interrupts.get_handler_addr);
    writeRegister(handler_address, pc_reg.indexComp, pc_reg.indexElem);

    // clear interruption
    eval(architecture.interrupts.clear_interrupt);
}
