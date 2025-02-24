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
import { CAPI_MEMORY } from "./capi_memory.mjs";
import { CAPI_SYSCALL } from "./capi_syscall.mjs";
import { CAPI_VALIDATION } from "./capi_validation.mjs";
import { CAPI_CHECK_STACK } from "./capi_check_stack.mjs";
import { CAPI_DRAW_STACK } from "./capi_draw_stack.mjs";
import { CAPI_FP } from "./capi_fp.mjs";

// Export all CAPI functions and make them globally available
export function initCAPI() {
    const CAPI = {
        ...CAPI_MEMORY,
        ...CAPI_SYSCALL,
        ...CAPI_VALIDATION,
        ...CAPI_CHECK_STACK,
        ...CAPI_DRAW_STACK,
        ...CAPI_FP,
    };

    // Make functions globally available for eval
    Object.entries(CAPI).forEach(([key, value]) => {
        globalThis[`capi_${key}`] = value;
    });

    return CAPI;
}
