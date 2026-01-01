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

import { cliState } from "./state.mts";

export const CLI_VERSION = "0.1.0";

export const CREATOR_ASCII = `
 ██████╗██████╗ ███████╗ █████╗ ████████╗ ██████╗ ██████╗ 
██╔════╝██╔══██╗██╔════╝██╔══██╗╚══██╔══╝██╔═══██╗██╔══██╗
██║     ██████╔╝█████╗  ███████║   ██║   ██║   ██║██████╔╝
██║     ██╔══██╗██╔══╝  ██╔══██║   ██║   ██║   ██║██╔══██╗
╚██████╗██║  ██║███████╗██║  ██║   ██║   ╚██████╔╝██║  ██║
 ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝
    didaCtic and geneRic assEmbly progrAmming simulaTOR
`;

/**
 * Clear the console screen
 */
export function clearConsole(): void {
    console.clear();
}

/**
 * Apply ANSI color codes to text (unless in accessible mode)
 */
export function colorText(text: string, colorCode: string): string {
    return !cliState.accessible ? `\x1b[${colorCode}m${text}\x1b[0m` : text;
}

/**
 * Get array of hint colors for memory display
 */
export function getHintColors(): string[] {
    return [
        "93", // bright yellow
        "92", // bright green
        "96", // bright cyan
        "95", // bright magenta
        "94", // bright blue
        "91", // bright red
        "97", // bright white
        "90", // bright black/gray
    ];
}

/**
 * Get frame color for stack display
 */
export function getFrameColor(frameIndex: number, totalFrames: number): string {
    const colorCodes = ["32", "33", "36", "35", "34"]; // green, yellow, cyan, magenta, blue

    if (frameIndex === totalFrames - 1) {
        return colorCodes[0]!; // green for current/top frame
    }

    return colorCodes[(frameIndex + 1) % colorCodes.length]!;
}
