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
"use strict";
import { status, total_clk_cycles, main_memory } from "../core.mjs";
import { crex_findReg } from "../register/registerLookup.mjs";
import { creator_executor_exit, packExecute } from "../executor/executor.mjs";
import {
    display_print,
    keyboard_read,
    kbd_read_int,
    kbd_read_float,
    kbd_read_double,
    kbd_read_char,
    kbd_read_string,
} from "../executor/IO.mjs";
import {
    readRegister,
    writeRegister,
} from "../register/registerOperations.mjs";
import { full_print } from "../utils/utils.mjs";
import { creator_ga } from "../utils/creator_ga.mjs";

export const SYSCALL = {
    exit: function () {
        creator_ga("execute", "execute.syscall", "execute.syscall.exit");
        return creator_executor_exit(false);
    },

    print: function (value, type) {
        creator_ga(
            "execute",
            "execute.syscall",
            `execute.syscall.print.${type}`,
        );

        switch (type) {
            case "int": {
                const val_int = parseInt(value, 10);
                display_print(full_print(val_int, null, false));
                break;
            }
            case "float":
            case "double": {
                display_print(value);
                break;
            }
            case "char": {
                const char_code = Number(value & 0xffn);
                display_print(String.fromCharCode(char_code));
                break;
            }
            case "string": {
                const buffer = [];
                // read byte by byte until a null terminator is found
                for (let i = 0; i < main_memory.size; i++) {
                    const byte = main_memory.read(value + BigInt(i));
                    if (byte === 0) break; // null terminator
                    buffer.push(String.fromCharCode(byte));
                }
                const msg = buffer.join("");
                display_print(msg);
                break;
            }
            default:
                throw packExecute(
                    true,
                    `capi_syscall: unknown print type '${type}'`,
                    "danger",
                    null,
                );
        }
    },

    read: function (dest_reg_info, type, aux_info) {
        creator_ga(
            "execute",
            "execute.syscall",
            `execute.syscall.read.${type}`,
        );

        if (typeof document !== "undefined") {
            document.getElementById("enter_keyboard").scrollIntoView();
        }
        status.run_program = 3;

        switch (type) {
            case "int":
                return keyboard_read(kbd_read_int, dest_reg_info);
            case "float":
                return keyboard_read(kbd_read_float, dest_reg_info);
            case "double":
                return keyboard_read(kbd_read_double, dest_reg_info);
            case "char":
                return keyboard_read(kbd_read_char, dest_reg_info);
            case "string":
                // dest_reg_info is for the buffer address register
                // aux_info is the register info for the length
                if (!aux_info) {
                    throw packExecute(
                        true,
                        "capi_syscall: missing length register info for read string",
                        "danger",
                        null,
                    );
                }
                dest_reg_info.indexComp2 = aux_info.indexComp;
                dest_reg_info.indexElem2 = aux_info.indexElem;
                return keyboard_read(kbd_read_string, dest_reg_info);
            default:
                status.run_program = 1; // Revert run_program status
                throw packExecute(
                    true,
                    `capi_syscall: unknown read type '${type}'`,
                    "danger",
                    null,
                );
        }
    },

    sbrk: function (value1, value2) {
        /* Google Analytics */
        creator_ga("execute", "execute.syscall", "execute.syscall.sbrk");

        /* Get register id */
        const ret1 = crex_findReg(value1);
        if (ret1.match === 0) {
            throw packExecute(
                true,
                "capi_syscall: register " + value1 + " not found",
                "danger",
                null,
            );
        }

        const ret2 = crex_findReg(value2);
        if (ret2.match === 0) {
            throw packExecute(
                true,
                "capi_syscall: register " + value2 + " not found",
                "danger",
                null,
            );
        }

        /* Request more memory */
        const new_size = parseInt(readRegister(ret1.indexComp, ret1.indexElem));
        if (new_size < 0) {
            throw packExecute(
                true,
                "capi_syscall: negative size",
                "danger",
                null,
            );
        }

        const new_addr = creator_memory_alloc(new_size);
        writeRegister(new_addr, ret2.indexComp, ret2.indexElem);
    },

    get_clk_cycles: function () {
        /* Google Analytics */
        creator_ga(
            "execute",
            "execute.syscall",
            "execute.syscall.get_clk_cycles",
        );

        return total_clk_cycles;
    },
};
