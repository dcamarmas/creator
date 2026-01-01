/**
 * Copyright 2018-2026 CREATOR Team.
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

import {
    bin2hex,
    double2bin,
    float2bin,
    hex2double,
    hex2float,
} from "./utils.mjs";

/**
 * Converts a BigInt value to a single-precision floating-point number
 * @param {BigInt} big_int_value - The BigInt value to convert
 * @returns {number} Single-precision floating-point representation
 */
export function bi_BigIntTofloat(big_int_value) {
    let hex = big_int_value.toString(16);

    if (hex.length > 8) {
        hex = hex.substring(hex.length - 8, hex.length);
    }

    return hex2float("0x" + hex);
}

/**
 * Converts a BigInt value to a double-precision floating-point number
 * @param {BigInt} big_int_value - The BigInt value to convert
 * @returns {number} Double-precision floating-point representation
 */
export function bi_BigIntTodouble(big_int_value) {
    const hex = big_int_value.toString(16).padStart(16, "0");
    // if the first 8 characters are 0, it's a 32-bit float, not a double
    if (hex.substring(0, 8) === "00000000") {
        return hex2float("0x" + hex.substring(8, 16));
    }

    return hex2double("0x" + hex);
}

/**
 * Converts a single-precision floating-point number to BigInt
 * @param {number} float_value - The float value to convert
 * @returns {BigInt} BigInt representation of the float value
 */
export function bi_floatToBigInt(float_value) {
    const binValue = float2bin(float_value);
    const hexValue = bin2hex(binValue);
    return BigInt("0x" + hexValue);
}

/**
 * Converts a double-precision floating-point number to BigInt
 * @param {number} double_value - The double-precision value to convert
 * @returns {BigInt} BigInt representation of the double value
 */
export function bi_doubleToBigInt(double_value) {
    const binValue = double2bin(double_value);
    const hexValue = bin2hex(binValue);
    return BigInt("0x" + hexValue);
}
