/**
 *  Copyright 2018-2025 Felix Garcia Carballeira, Alejandro Calderon Mateos,
 *                      Diego Camarmas Alonso
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

import { status, main_memory } from "../core.mjs";
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
import { readRegister } from "../register/registerOperations.mjs";
import { creator_ga } from "../utils/creator_ga.mjs";
import type { Memory } from "../memory/Memory.mts";

export const SYSCALL = {
    exit() {
        creator_ga("execute", "execute.syscall", "execute.syscall.exit");
        return creator_executor_exit(false);
    },

    print(value: number | bigint, type: string) {
        creator_ga(
            "execute",
            "execute.syscall",
            `execute.syscall.print.${type}`,
        );

        const mainMemory = main_memory as Memory;

        switch (type) {
            case "int": {
                display_print(value);
                break;
            }
            case "float":
            case "double": {
                display_print(value);
                break;
            }
            case "char": {
                const char_code = Number(value as bigint & 0xffn);
                display_print(String.fromCharCode(char_code));
                break;
            }
            case "string": {
                const buffer = [];
                // read byte by byte until a null terminator is found
                for (let i = 0; i < mainMemory.getSize(); i++) {
                    const byte = mainMemory.read((value as bigint) + BigInt(i));
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

    read(dest_reg_info: string, type: string, aux_info: string | null) {
        creator_ga(
            "execute",
            "execute.syscall",
            `execute.syscall.read.${type}`,
        );

        if (typeof document !== "undefined") {
            document.getElementById("enter_keyboard")!.scrollIntoView();
        }
        status.run_program = 3;
        const register = crex_findReg(dest_reg_info);
        if (register.match === 0) {
            throw packExecute(
                true,
                "capi_syscall: register '" + dest_reg_info + "' not found",
                "danger",
                null,
            );
        }

        switch (type) {
            case "int":
                return keyboard_read(kbd_read_int, register);
            case "float":
                return keyboard_read(kbd_read_float, register);
            case "double":
                return keyboard_read(kbd_read_double, register);
            case "char":
                return keyboard_read(kbd_read_char, register);
            case "string":
                if (aux_info !== null) {
                    const auxreg = crex_findReg(aux_info);
                    if (auxreg.match === 0) {
                        throw packExecute(
                            true,
                            "capi_syscall: register " + aux_info + " not found",
                            "danger",
                            null,
                        );
                    }
                    const size = readRegister(
                        auxreg.indexComp,
                        auxreg.indexElem,
                    );
                    const funct_params = {
                        indexComp: register.indexComp,
                        indexElem: register.indexElem,
                        size,
                    };
                    return keyboard_read(kbd_read_string, funct_params);
                }

                return keyboard_read(kbd_read_string, register);

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

    sbrk(value1: string, value2: string) {
        // TODO: this is (probably) broken
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
        const new_size = readRegister(ret1.indexComp, ret1.indexElem);
        if (new_size < 0) {
            throw packExecute(
                true,
                "capi_syscall: negative size",
                "danger",
                null,
            );
        }

        // const new_addr = creator_memory_alloc(new_size);
        // writeRegister(new_addr, ret2.indexComp, ret2.indexElem);
    },

    get_clk_cycles(): number {
        /* Google Analytics */
        creator_ga(
            "execute",
            "execute.syscall",
            "execute.syscall.get_clk_cycles",
        );

        return status.clkCycles;
    },
};
