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
import { SYSCALL } from "./syscall.mts";
import { VALIDATION } from "./validation.mjs";
import { CHECK_STACK } from "./checkStack.mjs";
import { DRAW_STACK } from "./drawStack.mjs";
import { FP } from "./fp.mjs";
import { ARCH as RISCV} from "./arch/riscv.mjs";
import { ARCH as Z80 } from "./arch/z80.mjs";
import { ARCH as MIPS } from "./arch/mips.mjs";
import { REG } from "./registers.mts";
import { INTERRUPTS } from "./interrupts.mts";

export interface CAPIType {
    MEM: typeof MEM;
    SYSCALL: typeof SYSCALL;
    VALIDATION: typeof VALIDATION;
    CHECK_STACK: typeof CHECK_STACK;
    DRAW_STACK: typeof DRAW_STACK;
    FP: typeof FP;
    ARCH: unknown; // The architecture plugin will be loaded here
    REG: typeof REG;
    INTERRUPTS: typeof INTERRUPTS;
}

declare global {
    var CAPI: CAPIType;
}

interface ArchPlugins {
    [key: string]: object;
}

const ARCH_PLUGINS: ArchPlugins = {
    z80: Z80,
    riscv: RISCV,
    mips: MIPS,
};

// Export all CAPI functions and make them globally available
export function initCAPI(pluginName?: string) {
    let ARCH_PLUGIN = null;
    
    if (pluginName) {
        ARCH_PLUGIN = ARCH_PLUGINS[pluginName];
    }
    
    const CAPI = {
        MEM,
        SYSCALL,
        VALIDATION,
        CHECK_STACK,
        DRAW_STACK,
        FP,
        ARCH: ARCH_PLUGIN,
        REG,
        INTERRUPTS,
    };
    
    globalThis.CAPI = CAPI;
}