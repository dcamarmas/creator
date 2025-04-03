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
import { status } from "../core.mjs";
import {
    readRegister,
    writeRegister,
} from "../register/registerOperations.mjs";
import { writeMemory } from "../memory/memoryOperations.mjs";
import process from "node:process";
import readlineSync from "readline-sync";
import { packExecute } from "./executor.mjs";

export function display_print(info) {
    if (typeof app !== "undefined") app._data.display += info;
    else process.stdout.write(info + "\n");

    status.display += info;
}

export function kbd_read_char(keystroke, params) {
    const value = keystroke.charCodeAt(0);
    writeRegister(value, params.indexComp, params.indexElem);

    return value;
}

export function kbd_read_int(keystroke, params) {
    const value = parseInt(keystroke, 10);
    writeRegister(value, params.indexComp, params.indexElem);

    return value;
}

export function kbd_read_float(keystroke, params) {
    const value = parseFloat(keystroke, 10);
    writeRegister(value, params.indexComp, params.indexElem, "SFP-Reg");

    return value;
}

export function kbd_read_double(keystroke, params) {
    const value = parseFloat(keystroke, 10);
    writeRegister(value, params.indexComp, params.indexElem, "DFP-Reg");

    return value;
}

export function kbd_read_string(keystroke, params) {
    let value = "";
    let neltos = readRegister(params.indexComp2, params.indexElem2);
    for (let i = 0; i < neltos && i < keystroke.length; i++) {
        value += keystroke.charAt(i);
    }

    neltos = readRegister(params.indexComp, params.indexElem);
    writeMemory(value, parseInt(neltos), "string");

    return value;
}

// eslint-disable-next-line max-lines-per-function
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
        try {
            const keystroke = prompt("Input:");
            const value = fn_post_read(keystroke, fn_post_params);
            status.keyboard = status.keyboard + " " + value;

            return packExecute(
                false,
                "The data has been uploaded",
                "info",
                null,
            );
        } catch (e) {
            console.error("Error reading input:", e);
            return packExecute(false, "Error reading input", "danger", null);
        }
    }

    // Web/UI mode
    app._data.enter = false;

    if (status.run_program === 3) {
        setTimeout(keyboard_read, 1000, fn_post_read, fn_post_params);
        return;
    }

    fn_post_read(app._data.keyboard, fn_post_params);

    app._data.keyboard = "";
    app._data.enter = null;

    show_notification("The data has been uploaded", "info");

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

    if (status.run_program === 1) {
        $("#playExecution").trigger("click");
    }
}
