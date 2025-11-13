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

import { register_size_bits } from "../core.mjs";
import {
    checkTypeIEEE,
    float2bin,
    float32_to_uint,
    float64_to_uint,
    uint_to_float32,
    uint_to_float64,
} from "../utils/utils.mjs";
import { console_log } from "../utils/creator_logger.mjs";

export function capi_uint2int(value, bits = register_size_bits) {
    // This function is exported to be used in capi_validation.js
    return BigInt.asIntN(bits, BigInt(value));
}

export const FP = {
    split_double(reg, index) {
        const value = reg.toString(16).padStart(16, "0");
        console_log(value);
        if (index === 0) {
            return value.substring(0, 8);
        }
        if (index === 1) {
            return value.substring(8, 16);
        }
        return null;
    },

    uint2float32(value) {
        return uint_to_float32(value);
    },

    float322uint(value) {
        return float32_to_uint(value);
    },

    int2uint(value, bits = register_size_bits) {
        return BigInt.asUintN(bits, BigInt(value));
    },

    uint2int(value) {
        return capi_uint2int(value);
    },

    uint2float64(value0, value1) {
        return uint_to_float64(value0, value1);
    },

    float642uint(value) {
        return float64_to_uint(value);
    },

    check_ieee(s, e, m) {
        return checkTypeIEEE(s, e, m);
    },

    float2bin(f) {
        return float2bin(f);
    },
};
