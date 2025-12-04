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

import { CONFIG } from "./creator6.mts";

// eslint-disable-next-line max-lines-per-function
export function displayHelp() {
    console.log("Available commands:");

    console.log(
        "  step                                         - Execute one instruction",
    );
    console.log(
        "  unstep                                       - Undo last instruction",
    );
    console.log(
        "  run [n]                                      - Run n instructions or until program completes",
    );
    console.log(
        "  silent [n]                                   - Run silently",
    );
    console.log(
        "  break [addr]                                 - Set/unset breakpoint at address or list all",
    );
    console.log(
        "  reg list                                     - List available register types",
    );
    console.log(
        "  reg <type>                                   - Display registers of type",
    );
    console.log(
        "  reg <name>                                   - Display specific register",
    );
    console.log(
        "  mem <address> [count]                        - Display memory (count in bytes)",
    );
    console.log(
        "  insn                                         - Show current instruction",
    );
    console.log(
        "  list                                         - Show all loaded instructions",
    );
    console.log("  hexview <address> [count] [bytesPerLine]     - Hex viewer");
    console.log(
        "  reset                                        - Reset program to initial state",
    );
    console.log(
        "  snapshot [filename]                          - Save a complete snapshot of current state",
    );
    console.log(
        "  restore <filename>                           - Restore a previously saved snapshot",
    );
    console.log(
        "  stack                                        - Display call stack hierarchy and frame info",
    );
    console.log(
        "  clear                                        - Clear the console screen",
    );
    console.log(
        "  help                                         - Show this help message",
    );
    console.log(
        "  alias                                        - Show available aliases",
    );
    console.log(
        "  about                                        - Show information about the simulator",
    );
    console.log(
        "  quit                                         - Quit the simulator",
    );

    // Display keyboard shortcuts from configuration if they are enabled
    if (CONFIG.settings.keyboard_shortcuts) {
        console.log("\nKeyboard shortcuts (when enabled):");

        // Create a map to display shortcuts in a more user-friendly way
        const ctrlKeyMap: { [key: string]: string } = {
            "\x01": "Ctrl+A",
            "\x02": "Ctrl+B",
            "\x03": "Ctrl+C",
            "\x04": "Ctrl+D",
            "\x05": "Ctrl+E",
            "\x06": "Ctrl+F",
            "\x07": "Ctrl+G",
            "\x08": "Ctrl+H",
            "\x09": "Ctrl+I",
            "\x0A": "Ctrl+J",
            "\x0B": "Ctrl+K",
            "\x0C": "Ctrl+L",
            "\x0D": "Ctrl+M",
            "\x0E": "Ctrl+N",
            "\x0F": "Ctrl+O",
            "\x10": "Ctrl+P",
            "\x11": "Ctrl+Q",
            "\x12": "Ctrl+R",
            "\x13": "Ctrl+S",
            "\x14": "Ctrl+T",
            "\x15": "Ctrl+U",
            "\x16": "Ctrl+V",
            "\x17": "Ctrl+W",
            "\x18": "Ctrl+X",
            "\x19": "Ctrl+Y",
            "\x1A": "Ctrl+Z",
        };

        // Format the shortcuts two per line
        const shortcuts = CONFIG.shortcuts || {};
        const shortcutEntries = Object.entries(shortcuts);

        for (let i = 0; i < shortcutEntries.length; i += 2) {
            const leftKey = shortcutEntries[i][0];
            const leftCmd = shortcutEntries[i][1];
            const leftDisplay =
                ctrlKeyMap[leftKey] || `Key ${leftKey.charCodeAt(0)}`;

            let line = `  ${leftDisplay.padEnd(5)} - ${leftCmd.padEnd(10)}`;

            if (i + 1 < shortcutEntries.length) {
                const rightKey = shortcutEntries[i + 1][0];
                const rightCmd = shortcutEntries[i + 1][1];
                const rightDisplay =
                    ctrlKeyMap[rightKey] || `Key ${rightKey.charCodeAt(0)}`;
                line += `${rightDisplay.padEnd(5)} - ${rightCmd}`;
            }

            console.log(line);
        }

        console.log(
            "\nShortcuts can be customized in your configuration file.",
        );
    }
}
