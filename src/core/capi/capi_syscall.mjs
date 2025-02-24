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
import { status } from "../core.mjs";
import {
    creator_executor_exit,
    packExecute,
    total_clk_cycles,
} from "../executor/executor.mjs";
import {
    display_print,
    keyboard_read,
    kbd_read_int,
    kbd_read_float,
    kbd_read_double,
    kbd_read_char,
    kbd_read_string,
} from "../executor/IO.mjs";
import { readMemory } from "../memory/memoryOperations.mjs";
import { creator_memory_alloc } from "../memory/memoryManager.mjs";
import { crex_findReg } from "../register/registerLookup.mjs";
import {
    readRegister,
    writeRegister,
} from "../register/registerOperations.mjs";
import { full_print, float2bin, double2bin } from "../utils/utils.mjs";
import { creator_ga } from "../utils/creator_ga.mjs";

export const CAPI_SYSCALL = {
    exit: function () {
        creator_ga("execute", "execute.syscall", "execute.syscall.exit");
        return creator_executor_exit(false);
    },

    print_int: function (value1) {
        creator_ga("execute", "execute.syscall", "execute.syscall.print_int");

        const ret1 = crex_findReg(value1);
        if (ret1.match === 0) {
            throw packExecute(
                true,
                "capi_syscall: register " + value1 + " not found",
                "danger",
                null,
            );
        }

        const value = readRegister(ret1.indexComp, ret1.indexElem);
        const val_int = parseInt(value.toString()) >> 0;

        display_print(full_print(val_int, null, false));
    },

    print_float: function (value1) {
        /* Google Analytics */
        creator_ga("execute", "execute.syscall", "execute.syscall.print_float");

        /* Get register id */
        const ret1 = crex_findReg(value1);
        if (ret1.match == 0) {
            throw packExecute(
                true,
                "capi_syscall: register " + value1 + " not found",
                "danger",
                null,
            );
        }

        /* Print float */
        const value = readRegister(ret1.indexComp, ret1.indexElem, "SFP-Reg");
        const bin = float2bin(value);

        display_print(full_print(value, bin, true));
    },

    print_double: function (value1) {
        /* Google Analytics */
        creator_ga(
            "execute",
            "execute.syscall",
            "execute.syscall.print_double",
        );

        /* Get register id */
        const ret1 = crex_findReg(value1);
        if (ret1.match == 0) {
            throw packExecute(
                true,
                "capi_syscall: register " + value1 + " not found",
                "danger",
                null,
            );
        }

        /* Print double */
        const value = readRegister(ret1.indexComp, ret1.indexElem, "DFP-Reg");
        const bin = double2bin(value);

        display_print(full_print(value, bin, true));
    },
    print_char: function (value1) {
        /* Google Analytics */
        creator_ga("execute", "execute.syscall", "execute.syscall.print_char");

        /* Get register id */
        const ret1 = crex_findReg(value1);
        if (ret1.match == 0) {
            throw packExecute(
                true,
                "capi_syscall: register " + value1 + " not found",
                "danger",
                null,
            );
        }

        /* Print char */
        const aux = readRegister(ret1.indexComp, ret1.indexElem);
        const aux2 = aux.toString(16);
        const length = aux2.length;

        let value = aux2.substring(length - 2, length);
        value = String.fromCharCode(parseInt(value, 16));

        display_print(value);
    },
    print_string: function (value1) {
        /* Google Analytics */
        creator_ga(
            "execute",
            "execute.syscall",
            "execute.syscall.print_string",
        );

        /* Get register id */
        const ret1 = crex_findReg(value1);
        if (ret1.match == 0) {
            throw packExecute(
                true,
                "capi_syscall: register " + value1 + " not found",
                "danger",
                null,
            );
        }

        /* Print string */
        const addr = readRegister(ret1.indexComp, ret1.indexElem);
        const msg = readMemory(parseInt(addr), "string");
        display_print(msg);
    },

    read_int: function (value1) {
        /* Google Analytics */
        creator_ga("execute", "execute.syscall", "execute.syscall.read_int");

        /* Get register id */
        const ret1 = crex_findReg(value1);
        if (ret1.match == 0) {
            throw packExecute(
                true,
                "capi_syscall: register " + value1 + " not found",
                "danger",
                null,
            );
        }

        /* Read integer */
        if (typeof document !== "undefined") {
            document.getElementById("enter_keyboard").scrollIntoView();
        }

        status.run_program = 3;
        return keyboard_read(kbd_read_int, ret1);
    },

    read_float: function (value1) {
        /* Google Analytics */
        creator_ga("execute", "execute.syscall", "execute.syscall.read_float");

        /* Get register id */
        const ret1 = crex_findReg(value1);
        if (ret1.match == 0) {
            throw packExecute(
                true,
                "capi_syscall: register " + value1 + " not found",
                "danger",
                null,
            );
        }

        if (typeof document !== "undefined") {
            document.getElementById("enter_keyboard").scrollIntoView();
        }

        status.run_program = 3;
        return keyboard_read(kbd_read_float, ret1);
    },

    read_double: function (value1) {
        /* Google Analytics */
        creator_ga("execute", "execute.syscall", "execute.syscall.read_double");

        /* Get register id */
        const ret1 = crex_findReg(value1);
        if (ret1.match == 0) {
            throw packExecute(
                true,
                "capi_syscall: register " + value1 + " not found",
                "danger",
                null,
            );
        }

        if (typeof document !== "undefined") {
            document.getElementById("enter_keyboard").scrollIntoView();
        }

        status.run_program = 3;
        return keyboard_read(kbd_read_double, ret1);
    },

    read_char: function (value1) {
        /* Google Analytics */
        creator_ga("execute", "execute.syscall", "execute.syscall.read_char");

        /* Get register id */
        const ret1 = crex_findReg(value1);
        if (ret1.match == 0) {
            throw packExecute(
                true,
                "capi_syscall: register " + value1 + " not found",
                "danger",
                null,
            );
        }

        if (typeof document !== "undefined") {
            document.getElementById("enter_keyboard").scrollIntoView();
        }

        status.run_program = 3;
        return keyboard_read(kbd_read_char, ret1);
    },

    read_string: function (value1, value2) {
        /* Google Analytics */
        creator_ga("execute", "execute.syscall", "execute.syscall.read_string");

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

        /* Read string */
        if (typeof document !== "undefined") {
            document.getElementById("enter_keyboard").scrollIntoView();
        }

        ret1.indexComp2 = ret2.indexComp;
        ret1.indexElem2 = ret2.indexElem;

        status.run_program = 3;
        return keyboard_read(kbd_read_string, ret1);
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
