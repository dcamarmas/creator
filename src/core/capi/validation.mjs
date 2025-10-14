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

import { capi_uint2int } from "./fp.mjs";

export function raise(msg) {
    if (typeof document !== "undefined" && document.app) {
        document.app.exception(msg);
    } else {
        throw new Error(msg);
    }
}

export function isOverflow(op1, op2, res_u) {
    const op1_u = capi_uint2int(op1);
    const op2_u = capi_uint2int(op2);
    res_u = capi_uint2int(res_u);

    return (
        (op1_u > 0 && op2_u > 0 && res_u < 0) ||
        (op1_u < 0 && op2_u < 0 && res_u > 0)
    );
}

export function isMisaligned(addr, type) {
    return false;
}

// Object export for initCAPI spreading
export const VALIDATION = {
    raise,
    isOverflow,
    isMisaligned,
};
