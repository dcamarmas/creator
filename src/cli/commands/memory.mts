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
import { cliState } from "../state.mts";
import { colorText, getHintColors } from "../display.mts";

/**
 * Apply hint highlighting to memory value
 */
function applyHintHighlighting(
    memValue: string,
    hintsInRange: Array<{
        hint: { tag: string; type: string; sizeInBits?: number };
        offset: number;
    }>,
    wordSize: number,
): string {
    let highlightedValue = memValue;
    const colors = getHintColors();

    for (let k = hintsInRange.length - 1; k >= 0; k--) {
        const { hint, offset } = hintsInRange[k];
        if (!hint.sizeInBits) continue;

        const sizeInBytes = Math.ceil(hint.sizeInBits / 8);
        const startChar = 2 + offset * 2;
        const endChar = startChar + sizeInBytes * 2;

        if (offset + sizeInBytes <= wordSize) {
            const before = highlightedValue.substring(0, startChar);
            const toHighlight = highlightedValue.substring(startChar, endChar);
            const after = highlightedValue.substring(endChar);

            const colorCode = colors[k % colors.length];
            highlightedValue =
                before + colorText(toHighlight, colorCode!) + after;
        }
    }
    return highlightedValue;
}

/**
 * Display memory contents at address
 */
function displayMemory(address: number, count: number): void {
    const wordSize = creator.main_memory.getWordSize();

    for (let i = 0; i < count; i += wordSize) {
        const currentAddr = address + i;
        const bytes = creator.dumpAddress(currentAddr, wordSize);
        const formattedAddr = `0x${currentAddr.toString(16).padStart(8, "0")}`;

        const hintsInRange: Array<{
            hint: { tag: string; type: string; sizeInBits?: number };
            offset: number;
        }> = [];
        for (let j = 0; j < wordSize; j++) {
            const byteAddr = BigInt(currentAddr + j);
            const hint = creator.main_memory.getHint(byteAddr);
            if (hint) {
                hintsInRange.push({ hint, offset: j });
            }
        }

        let memValue = `0x${bytes}`;
        const hintTexts: string[] = [];

        if (hintsInRange.length > 0) {
            hintsInRange.sort((a, b) => a.offset - b.offset);

            if (!cliState.accessible) {
                memValue = applyHintHighlighting(
                    memValue,
                    hintsInRange,
                    wordSize,
                );
            }

            const colors = getHintColors();
            for (let k = 0; k < hintsInRange.length; k++) {
                const { hint, offset } = hintsInRange[k];
                const tag = hint.tag || "";
                const type = hint.type || "";
                const shortHint = type && tag ? `${tag}:${type}` : type || tag;
                const sizeInfo = hint.sizeInBits
                    ? ` (${hint.sizeInBits}b)`
                    : "";
                const offsetInfo =
                    hintsInRange.length > 1 ? ` @+${offset}` : "";
                const hintText = `${shortHint}${sizeInfo}${offsetInfo}`;

                if (cliState.accessible) {
                    hintTexts.push(hintText);
                } else {
                    const colorCode = colors[k % colors.length];
                    hintTexts.push(colorText(hintText, colorCode!));
                }
            }
        }

        let output = `${formattedAddr}: ${memValue}`;

        if (hintTexts.length > 0) {
            const allHints = hintTexts.join(", ");
            output += ` // ${allHints}`;
        }

        console.log(output);
    }
}

/**
 * Handle mem command - display memory contents
 */
export function handleMemCommand(args: string[]): void {
    if (args.length > 1) {
        const address = parseInt(args[1]!, 16);
        const wordSize = creator.main_memory.getWordSize();
        const count = args.length > 2 ? parseInt(args[2]!, 10) : wordSize;
        displayMemory(address, count);
    } else {
        console.log("Usage: mem <address> [count]");
    }
}

/**
 * Handle hexview command - hex dump of memory
 */
export function handleHexViewCommand(args: string[]): void {
    if (args.length > 1) {
        const address = parseInt(args[1]!, 16);
        const count = args.length > 2 ? parseInt(args[2]!, 10) : 16;
        const bytesPerLine = parseInt(args[3]!, 10) || 16;
        console.log(creator.dumpMemory(address, count, bytesPerLine));
    } else {
        console.log("Usage: hexview <address> [count] [bytesPerLine]");
    }
}
