/**
 * Copyright 2018-2026 CREATOR Team.
 *
 * This file is part of CREATOR.
 *
 * CREATOR is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * CREATOR is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with CREATOR.  If not, see <http://www.gnu.org/licenses/>.
 */

import * as creator from "../../core/core.mjs";
import { step } from "../../core/executor/executor.mjs";
import { instructions } from "../../core/assembler/assembler.mjs";
import { cliState } from "../state.mts";
import { colorText } from "../display.mts";
import type { ReturnType, StepResult } from "../types.mts";

/**
 * Execute a single instruction step
 */
export function executeStep(): StepResult {
    if (creator.status.execution_index === -2) {
        return { output: ``, completed: true, error: false };
    }

    // Save current state for unstepping
    const state = creator.snapshot({ PREVIOUS_PC: cliState.previousPC });
    cliState.saveState(state);

    // Get current PC value
    const pc_value = creator.getPC();

    // Store the current PC as previous PC before executing the step
    cliState.previousPC = "0x" + pc_value.toString(16);

    const ret: ReturnType = step();
    if (ret.error) {
        return { output: ``, completed: true, error: true, errormsg: ret.msg };
    }

    // Get instruction data from the step result
    const instructionData = ret.instructionData;
    let instruction = "unknown";
    let asmString = "unknown";

    if (instructionData) {
        instruction = instructionData.machineCode || "unknown";
        asmString = instructionData.asm || "unknown";
    }

    return {
        output: `0x${pc_value} (0x${instruction}) ${asmString}`,
        completed: creator.status.execution_index === -2,
    };
}

/**
 * Handle step command - execute one instruction
 */
export function handleStepCommand(): void {
    const { output, completed, error } = executeStep();
    if (output) {
        console.log(output);
    }
    if (error) {
        console.error(colorText("Error during execution.", "31"));
    } else if (completed) {
        console.log(colorText("Program execution completed.", "32"));
    }
}

/**
 * Handle unstep command - undo last instruction
 */
export function handleUnstepCommand(): void {
    if (!cliState.hasPreviousStates()) {
        console.log(
            colorText("No previous states available for unstepping.", "31"),
        );
        return;
    }

    const prevState = cliState.popState();
    if (!prevState) {
        console.log(colorText("No previous state available.", "31"));
        return;
    }

    // Restore the previous state
    creator.restore(prevState);

    // Restore the previous PC from the state
    const stateData = JSON.parse(prevState);
    cliState.previousPC = stateData.extraData.PREVIOUS_PC;
}

/**
 * Handle run command - execute multiple instructions
 */
export function handleRunCommand(args: string[], silent = false): void {
    const instructionsToRun =
        args.length > 1 ? parseInt(args[1]!, 10) : cliState.MAX_INSTRUCTIONS;

    if (args.length > 1 && isNaN(instructionsToRun)) {
        console.log("Invalid number of instructions");
        return;
    }

    if (cliState.executionPaused) {
        cliState.executionPaused = false;
    }

    const CHUNK_SIZE = 1000;
    let iterations = 0;
    let breakpointHit = false;

    function processChunk() {
        if (
            creator.status.execution_index === -2 ||
            iterations >= instructionsToRun ||
            breakpointHit ||
            cliState.executionPaused
        ) {
            return;
        }

        const chunkEnd = Math.min(iterations + CHUNK_SIZE, instructionsToRun);

        while (
            iterations < chunkEnd &&
            creator.status.execution_index !== -2 &&
            !breakpointHit
        ) {
            const currentPC = "0x" + creator.getPC().toString(16);

            for (const instr of instructions) {
                if (instr.Address === currentPC && instr.Break === true) {
                    console.log(
                        colorText("Breakpoint hit at " + currentPC, "31"),
                    );
                    breakpointHit = true;
                    break;
                }
            }
            if (breakpointHit) break;

            const { output, completed, error, errormsg } = executeStep();
            if (!silent) {
                console.log(output);
            }
            iterations++;

            if (error) {
                console.error(errormsg);
                return;
            } else if (completed) {
                console.log(colorText("Program execution completed.", "32"));
                return;
            }
        }

        setTimeout(processChunk, 0);
    }

    processChunk();
}

/**
 * Handle continue command - resume execution from pause or breakpoint
 */
export function handleContinueCommand(): void {
    if (cliState.executionPaused) {
        cliState.executionPaused = false;
        console.log("Resuming execution...");
        handleRunCommand(["run"], false);
    } else {
        handleStepCommand();
        handleRunCommand(["run"], false);
    }
}

/**
 * Handle pause command - toggle execution pause
 */
export function handlePauseCommand(): void {
    cliState.executionPaused = !cliState.executionPaused;

    if (!cliState.executionPaused) {
        handleRunCommand(["run"], true);
    }
}

/**
 * Handle nur command - run backwards until breakpoint
 */
export function handleNurCommand(): void {
    if (!cliState.hasPreviousStates()) {
        console.log(
            colorText("No previous states available for unstepping.", "31"),
        );
        return;
    }

    let iterations = 0;
    let breakpointHit = false;

    while (
        cliState.hasPreviousStates() &&
        iterations < cliState.MAX_INSTRUCTIONS
    ) {
        const prevState = cliState.popState();
        if (!prevState) break;

        creator.restore(prevState);

        const stateData = JSON.parse(prevState);
        cliState.previousPC = stateData.extraData.PREVIOUS_PC;

        const currentPC = "0x" + creator.getPC().toString(16);

        for (const instr of instructions) {
            if (instr.Address === currentPC && instr.Break === true) {
                console.log(colorText("Breakpoint hit at " + currentPC, "31"));
                breakpointHit = true;
                break;
            }
        }
        if (breakpointHit) break;

        iterations++;
    }
}

/**
 * Handle reset command - reset program to initial state
 */
export function handleResetCommand(): void {
    creator.reset();
    cliState.resetExecutionState();
    console.log(colorText("Program reset.", "32"));
}
