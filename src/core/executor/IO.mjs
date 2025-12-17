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

import { status, main_memory } from "../core.mjs";
import {
    readRegister,
    writeRegister,
} from "../register/registerOperations.mjs";
import process from "node:process";
import { packExecute } from "../utils/utils.mjs";
import os from "node:os";
import { show_notification } from "../utils/notifications.mts";
import { instructions } from "../assembler/assembler.mjs";
import { coreEvents, CoreEventTypes } from "../events.mts";

export function display_print(info) {
    if (typeof document !== "undefined" && document.app) {
        document.app.$data.display += info;
    } else {
        // Deno environment
        // Make sure that info is a string
        if (typeof info !== "string") {
            info = info.toString();
        }
        process.stdout.write(info);
    }

    status.display += info;
}

export function kbd_read_char(keystroke, params) {
    const value = keystroke.charCodeAt(0);
    writeRegister(value, params.indexComp, params.indexElem);

    return value;
}

export function kbd_read_int(keystroke, params) {
    // eslint-disable-next-line radix
    let value = parseInt(keystroke);

    // validate input
    if (isNaN(value)) {
        if (typeof document !== "undefined" && document.app) {
            show_notification(
                `Invalid input: '${keystroke}' is not an integer`,
                "danger",
            );
        } else {
            throw new Error(
                `\nInvalid input: '${keystroke}' is not an integer`,
            );
        }
        return null;
    }

    value = BigInt(value);

    writeRegister(value, params.indexComp, params.indexElem);

    return value;
}

export function kbd_read_float(keystroke, params) {
    const value = parseFloat(keystroke, 10);

    // validate input
    if (typeof document !== "undefined" && document.app && isNaN(value)) {
        show_notification(
            `Invalid input: '${keystroke}' is not a float`,
            "danger",
        );
        return null;
    }

    writeRegister(value, params.indexComp, params.indexElem);

    return value;
}

export function kbd_read_double(keystroke, params) {
    const value = parseFloat(keystroke, 10);

    // validate input
    if (typeof document.app !== "undefined" && isNaN(value)) {
        show_notification(
            `Invalid input: '${keystroke}' is not a double`,
            "danger",
        );
        return null;
    }

    writeRegister(value, params.indexComp, params.indexElem, "DFP-Reg");

    return value;
}

export function kbd_read_string(keystroke, params) {
    const addr = readRegister(params.indexComp, params.indexElem);

    const bytes = new TextEncoder().encode(keystroke);
    // Write the string to memory byte by byte
    for (let i = 0n; i < keystroke.length && i < params.size; i++) {
        main_memory.write(BigInt(addr + BigInt(i)), bytes[i]);
    }

    return keystroke;
}

function checkEnter(buf) {
    if (os.type() === "Darwin") {
        // MacOS
        return buf[0] === 13;
    } else if (os.type() === "Windows_NT") {
        // Windows
        return buf[0] === 13 || buf[0] === 10;
    } else {
        return buf[0] === 10;
    }
}

/**
 * Custom prompt function for Deno
 * @returns {string} - The user input without extra space or newline
 */
function rawPrompt() {
    // Build input character by character until we hit Enter
    const chunks = [];
    const decoder = new TextDecoder();
    const buf = new Uint8Array(1);
    Deno.stdin.setRaw(true, { cbreak: true });
    while (true) {
        const bytesRead = Deno.stdin.readSync(buf);
        if (bytesRead === null || bytesRead === 0) break;

        if (checkEnter(buf)) {
            // Enter key pressed
            chunks.push("\n");
            break;
        } else if (buf[0] === 8 || buf[0] === 127) {
            // Backspace or Delete key pressed
            if (chunks.length > 0) {
                chunks.pop(); // Remove the last character
                process.stdout.write("\b \b"); // Move cursor back, erase character, move cursor back again
            }
        } else {
            const char = decoder.decode(buf);
            process.stdout.write(char); // Echo the character
            chunks.push(char);
        }
    }

    return chunks.join("");
}

export function keyboard_read(fn_post_read, fn_post_params) {
    const draw = {
        space: [],
        info: [],
        success: [],
        warning: [],
        danger: [],
        flash: [],
    };

    // Check for Deno environment
    if (typeof Deno !== "undefined") {
        const keystroke = rawPrompt();
        const value = fn_post_read(keystroke, fn_post_params);
        status.keyboard = status.keyboard + " " + value;
        status.run_program = 0; // Reset run_program status

        return null;
    }

    // Web/UI mode
    document.app.$data.enter = false; // signal UI to wait for keyboard read

    if (status.run_program === 3) {
        setTimeout(keyboard_read, 1000, fn_post_read, fn_post_params);
        return draw;
    }

    const val = fn_post_read(document.app.$data.keyboard, fn_post_params);

    document.app.$data.keyboard = ""; // clear input

    if (val === null) {
        // error parsing input, retry
        status.run_program = 3;
        return keyboard_read(fn_post_read, fn_post_params);
    }

    document.app.$data.enter = null; // reset keyboard

    if (status.execution_index >= instructions.length) {
        for (let i = 0; i < instructions.length; i++) {
            draw.space.push(i);
        }

        status.execution_index = -2;
        return packExecute(
            true,
            "The execution of the program has finished",
            "success",
            null,
        );
    }

    // If program was running before waiting for input, continue execution automatically
    if (status.run_program === 1) {
        // Trigger the play button to continue execution
        const playButton = document.getElementById("playExecution");
        if (playButton) {
            playButton.click();
        }
    }

    // Re-enable buttons using event emitter for proper reactivity
    if (typeof document !== "undefined" && document.app) {
        coreEvents.emit(CoreEventTypes.EXECUTOR_BUTTONS_UPDATE, {
            instruction_disable: false,
            run_disable: false,
        });
    }

    return draw;
}
