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
import { instructions } from "../../core/assembler/assembler.mjs";
import { cliState } from "../state.mts";
import { colorText } from "../display.mts";
import type { Instruction } from "../types.mts";

/**
 * Display the instructions table header
 */
function displayInstructionsHeader(): void {
    if (cliState.binaryLoaded) {
        console.log(
            "    B | Address | Label      | Decoded Instruction     | Machine Code (hex)",
        );
    } else {
        console.log(
            "    B | Address | Label      | Loaded Instruction      | User Instruction",
        );
    }
    console.log(
        "   ---|---------|------------|-------------------------|------------------------",
    );
}

/**
 * Display a single instruction row
 */
function displayInstruction(
    instr: Instruction,
    currentPC: string,
    hideLibrary = false,
): void {
    const address = instr.Address.padEnd(8);
    const label = (instr.Label || "").padEnd(11);
    let loaded = (instr.loaded || "").padEnd(23);
    const loadedIsBinary = /^[01]+$/.test(loaded);
    const rightColumn = instr.user || "";
    const breakpointMark = instr.Break ? "●" : " ";

    // If the loaded instruction is binary, convert it to hex
    if (loadedIsBinary && !cliState.binaryLoaded) {
        if (hideLibrary) {
            loaded = "********".padEnd(23);
        } else {
            const instructionHex = parseInt(loaded, 2).toString(16);
            loaded = `0x${instructionHex.padStart(8, "0").toUpperCase().padEnd(21)}`;
        }
    }

    const currentMark = instr.Address === currentPC ? "➤" : " ";

    let line = `${currentMark}   ${breakpointMark} | ${address}| ${label}| ${loaded} | ${rightColumn}`;

    if (instr.Address === currentPC) {
        line = colorText(line, "32"); // Green for current instruction
    } else if (instr.Address === cliState.previousPC) {
        line = colorText(line, "33"); // Yellow for previously executed instruction
    } else if (instr.Break) {
        line = colorText(line, "31"); // Red for breakpoint
    }

    console.log(line);
}

/**
 * Handle instructions/list command - display loaded instructions
 */
export function handleInstructionsCommand(limit?: number): void {
    if (instructions.length === 0) {
        console.log("No instructions loaded.");
        return;
    }

    const currentPC = "0x" + creator.getPC().toString(16);

    displayInstructionsHeader();

    const count =
        typeof limit === "number" && limit > 0
            ? Math.min(limit, instructions.length)
            : instructions.length;

    for (let i = 0; i < count; i++) {
        displayInstruction(instructions[i], currentPC);
    }
}

/**
 * Find instruction by address or label
 */
export function findInstructionByAddressOrLabel(
    userInput: string,
): { address: string; index: number } | null {
    userInput = userInput.trim();
    let address: string;

    if (userInput.startsWith("0x")) {
        address = userInput.toLowerCase();
    } else {
        const labelMatch = instructions.find(
            instr => instr.Label === userInput,
        );

        if (labelMatch) {
            address = labelMatch.Address.toLowerCase();
        } else {
            const isValidHex = /^[0-9a-fA-F]+$/.test(userInput);

            if (isValidHex) {
                address = "0x" + userInput.toLowerCase();
            } else {
                console.log(
                    `No label or valid address found for '${userInput}'`,
                );
                return null;
            }
        }
    }

    const index = instructions.findIndex(
        instr => instr.Address.toLowerCase() === address.toLowerCase(),
    );

    if (index === -1) {
        console.log(`No instruction found at address ${address}`);
        return null;
    }

    return { address, index };
}

/**
 * Toggle breakpoint at instruction index
 */
export function toggleBreakpoint(index: number): void {
    instructions[index]!.Break = !instructions[index]!.Break;

    const instr = instructions[index];
    const status = instr!.Break ? "set" : "removed";

    console.log(
        `Breakpoint ${status} at ${instr!.Address}${
            instr!.Label ? ` (${instr!.Label})` : ""
        }: ${instr!.loaded}`,
    );
}

/**
 * List all breakpoints
 */
function listBreakpoints(): void {
    const breakpoints = instructions.filter(instr => instr.Break === true);

    if (breakpoints.length === 0) {
        console.log("No breakpoints set.");
        return;
    }

    console.log("Current breakpoints:");

    for (const bp of breakpoints) {
        console.log(
            `  ${bp.Address}${bp.Label ? ` (${bp.Label})` : ""}: ${bp.loaded}`,
        );
    }
}

/**
 * Handle breakpoint command
 */
export function handleBreakpointCommand(args: string[]): void {
    if (args.length < 2) {
        listBreakpoints();
        return;
    }

    const result = findInstructionByAddressOrLabel(args[1]!);
    if (!result) {
        return;
    }

    toggleBreakpoint(result.index);
}

/**
 * Set/toggle breakpoint at current PC
 */
export function handleBreakpointAtCurrentPC(): void {
    const currentPC = "0x" + creator.getPC().toString(16);

    const index = instructions.findIndex(
        instr => instr.Address.toLowerCase() === currentPC.toLowerCase(),
    );

    if (index === -1) {
        console.log(`No instruction found at current PC: ${currentPC}`);
        return;
    }

    toggleBreakpoint(index);
}
