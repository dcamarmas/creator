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
 */
import { MEM } from "./memory.mts";
import { SYSCALL } from "./syscall.mjs";
import { VALIDATION } from "./validation.mjs";
import { CHECK_STACK } from "./checkStack.mjs";
import { DRAW_STACK } from "./drawStack.mjs";
import { FP } from "./fp.mjs";
import { RISCV } from "./arch/riscv.mjs";
import { REG } from "./registers.mts";
import { INTERRUPTS } from "./interrupts.mts";

// Export all CAPI functions and make them globally available
export function initCAPI() {
    const CAPI = {
        MEM,
        SYSCALL,
        VALIDATION,
        CHECK_STACK,
        DRAW_STACK,
        FP,
        RISCV,
        REG,
        INTERRUPTS,
    };

    // Make CAPI available as a global object
    globalThis.CAPI = CAPI;
}
