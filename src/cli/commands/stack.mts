/**
 * Copyright 2018-2025 CREATOR Team.
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
import { cliState } from "../state.mts";
import { colorText, getFrameColor } from "../display.mts";

/**
 * Handle stack command - display call stack hierarchy and frame info
 */
// eslint-disable-next-line max-lines-per-function
export function handleStackCommand(args: string[]): void {
    const stackTracker = creator.stackTracker;

    const stackFrames = stackTracker.getAllFrames();
    const stackHints = stackTracker.getAllHints();
    const totalFrames = stackTracker.length();

    if (totalFrames === 0) {
        console.log("No stack information available.");
        return;
    }

    // 1. Display call stack hierarchy
    console.log(cliState.accessible ? "Call Stack:" : colorText("Call Stack:", "36"));

    for (const [i, frame] of stackFrames.toReversed().entries()) {
        const functionName = frame.name ?? "";
        const depth = totalFrames - 1 - i;
        const indent = "  ".repeat(depth);
        const frameSize: number = frame.begin - frame.end;
        const prefix = i === totalFrames - 1 ? "►" : "•";

        const color = getFrameColor(i, totalFrames);

        const beginAddress = BigInt(frame.begin);
        const beginAddressHex = `0x${beginAddress.toString(16).toUpperCase()}`;
        const endAddress = BigInt(frame.end);
        const endAddressHex = `0x${endAddress.toString(16).toUpperCase()}`;

        console.log(
            colorText(
                `${indent}${prefix} ${functionName} (${beginAddressHex} - ${endAddressHex}, ${frameSize} bytes)`,
                color,
            ),
        );
    }

    // 2. Show stack frame details for the current (top) frame
    const stackTop = stackFrames.at(-1);

    if (stackTop === undefined) {
        return;
    }

    console.log(colorText("\nCurrent Frame Details:", "36"));

    const currentFuncName = stackTop.name ?? "";

    console.log(`Function: ${currentFuncName}`);

    const beginAddress = BigInt(stackTop.begin);
    const beginAddressHex = `0x${beginAddress.toString(16).toUpperCase()}`;
    const endAddress = BigInt(stackTop.end);
    const endAddressHex = `0x${endAddress.toString(16).toUpperCase()}`;

    console.log(`Frame: ${beginAddressHex} - ${endAddressHex}`);

    const frameSize = stackTop.begin - stackTop.end;
    console.log(`Size: ${frameSize} bytes`);

    if (totalFrames > 1) {
        // @ts-ignore: stackFrame should have at least two elements
        const callerFuncName = stackFrames.at(-2).name ?? "";

        const callerBeginAddress = BigInt(stackTop.begin);
        const callerBeginAddressHex = `0x${callerBeginAddress.toString(16).toUpperCase()}`;
        const callerEndAddress = BigInt(stackTop.end);
        const callerEndAddressHex = `0x${callerEndAddress.toString(16).toUpperCase()}`;

        console.log(`Caller: ${callerFuncName}`);
        console.log(
            `Caller frame: ${callerBeginAddressHex} - ${callerEndAddressHex}`,
        );
    }

    // 3. Show stack memory contents
    console.log(colorText("\nStack Memory Contents:", "36"));

    const startAddressHex = stackTop.end;
    const startAddress = BigInt(startAddressHex);

    let stackEndAddress = startAddress;
    for (const frame of stackFrames) {
        const frameBegin = BigInt(frame.begin);
        if (frameBegin > stackEndAddress) {
            stackEndAddress = frameBegin;
        }
    }

    const maxBytesToShow = args.length > 2 ? parseInt(args[2]!, 10) : 256;
    const actualBytesToShow = stackEndAddress - startAddress;

    if (actualBytesToShow > BigInt(maxBytesToShow)) {
        stackEndAddress = startAddress + BigInt(maxBytesToShow);
    }

    const wordSize = creator.main_memory.getWordSize();
    for (
        let addr = startAddress;
        addr < stackEndAddress;
        addr += BigInt(wordSize)
    ) {
        const bytes = creator.dumpAddress(addr, wordSize);
        const valueStr = "0x" + bytes.padStart(wordSize * 2, "0").toUpperCase();
        const formattedAddr = `0x${addr.toString(16).padStart(8, "0").toUpperCase()}`;

        let annotation = "";
        let frameIndex = -1;

        for (const [i, frame] of stackFrames.entries()) {
            if (addr >= BigInt(frame.end) && addr < BigInt(frame.begin)) {
                frameIndex = i;
                break;
            }
        }

        if (stackHints) {
            const hint = stackHints.get(Number(addr));
            if (hint) {
                annotation += (annotation ? ", " : "") + `"${hint}"`;
            }
        }

        const stackPointer = BigInt(stackTop.end);
        if (addr === stackPointer) {
            annotation += (annotation ? ", " : "") + "← SP";
        }

        for (const frame of stackFrames) {
            if (addr === BigInt(frame.end)) {
                annotation +=
                    (annotation ? ", " : "") + `← ${frame.name} frame start`;
            }

            if (addr === BigInt(frame.begin)) {
                annotation +=
                    (annotation ? ", " : "") + `← ${frame.name} frame end`;
            }
        }

        let line = `${formattedAddr}: ${valueStr.padEnd(10)} ${annotation}`;
        if (frameIndex >= 0) {
            const colorCode = getFrameColor(frameIndex, totalFrames);
            line = colorText(line, colorCode);
        }

        console.log(line);
    }
}
