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
 */
"use strict";
import { register_size_bits } from "../core.mjs";
import {
    bin2hex,
    double2bin,
    float2bin,
    hex2double,
    hex2float,
} from "./utils.mjs";

/**
 * Converts an integer value to a BigInt with proper register size normalization
 * @param {number|string} int_value - The integer value to convert
 * @param {number} int_base - The base of the input number (default: 10)
 * @param {number} bits - The number of bits for the register (default: register_size_bits)
 * @returns {BigInt} Normalized unsigned BigInt value
 */
export function bi_intToBigInt(
    int_value,
    int_base = 10,
    bits = register_size_bits,
) {
    // Convert input to BigInt, respecting the base
    const bigIntValue = BigInt(int_value.toString(int_base));

    // Normalize to unsigned integer
    // This has to be the size of the register it's saving to.
    // If the number is positive it doesn't matter, but when converting
    // negative numbers, if the value is not set to the size of the register
    // it will break due to 2's complement representation being dependent on
    // the size of the register.
    // E.g. -1 in a 4-bit register is 1111, but in an 8-bit register it's 11111111.
    return BigInt.asUintN(bits, bigIntValue);
}
/**
 * Converts a floating-point number to its BigInt representation
 * @param {number} float_value - The floating-point value to convert
 * @returns {BigInt} BigInt representation of the float value
 */
export function bi_floatToBigInt(float_value) {
    let BigInt_value = null;
    const bin = float2bin(float_value);
    const hex = bin2hex(bin);

    BigInt_value = BigInt("0x" + hex)

    return BigInt_value
}
/**
 * Converts a BigInt back to a floating-point number
 * @param {BigInt} big_int_value - The BigInt value to convert
 * @returns {number} Floating-point representation of the BigInt value
 */
export function bi_BigIntTofloat(big_int_value) {
    let hex = big_int_value.toString(16)

    if (hex.length > 8) {
        hex = hex.substring(hex.length - 8, hex.length)
    }

    return hex2float("0x" + hex)
}
/**
 * Converts a double-precision floating-point number to BigInt
 * @param {number} double_value - The double-precision value to convert
 * @returns {BigInt} BigInt representation of the double value
 */
export function bi_doubleToBigInt(double_value) {
    let BigInt_value = null;
    const bin = double2bin(double_value);
    const hex = bin2hex(bin);

    BigInt_value = BigInt("0x" + hex)

    return BigInt_value
}
/**
 * Converts a BigInt back to a double-precision floating-point number
 * @param {BigInt} big_int_value - The BigInt value to convert
 * @returns {number} Double-precision floating-point representation of the BigInt value
 */
export function bi_BigIntTodouble(big_int_value) {
    const hex = big_int_value.toString(16).padStart(16, "0");
    // if the first 8 characters are 0, it's a 32-bit float, not a double
    if (hex.substring(0, 8) === "00000000") {
        return hex2float("0x" + hex.substring(8, 16));
    }

    return hex2double("0x" + hex)
}
/**
 * Deserializes register values in an architecture from string/number to BigInt
 * @param {Object} architecture - The architecture object containing components and elements
 * @returns {Object} Modified architecture with deserialized values
 */
export function register_value_deserialize(architecture) {
    //var architecture = architecture;
    for (let i = 0; i < architecture.components.length; i++) {
        for (let j = 0; j < architecture.components[i].elements.length; j++) {
            if (architecture.components[i].type != "fp_registers") {
                architecture.components[i].elements[j].value = bi_intToBigInt(
                    architecture.components[i].elements[j].value,
                    10,
                )
            } else {
                architecture.components[i].elements[j].value = bi_floatToBigInt(
                    architecture.components[i].elements[j].value,
                )
            }

            if (architecture.components[i].double_precision !== true) {
                if (architecture.components[i].type != "fp_registers") {
                    architecture.components[i].elements[j].default_value =
                        bi_intToBigInt(
                            architecture.components[i].elements[j]
                                .default_value,
                            10,
                        );
                } else {
                    architecture.components[i].elements[j].default_value =
                        bi_floatToBigInt(
                            architecture.components[i].elements[j]
                                .default_value,
                        );
                }
            }
        }
    }

    return architecture
}
// /**
//  * Serializes register values in an architecture from BigInt to string/number
//  * @param {Object} architecture - The architecture object containing components and elements
//  * @returns {Object} New architecture object with serialized values
//  */
// function register_value_serialize(architecture) {
//     const aux_architecture = structuredClone(architecture);
//     for (let i = 0; i < architecture.components.length; i++) {
//         for (let j = 0; j < architecture.components[i].elements.length; j++) {
//             if (architecture.components[i].type != "fp_registers") {
//                 aux_architecture.components[i].elements[j].value = architecture
//                     .components[i].elements[j].value.toString();
//             } else {
//                 aux_architecture.components[i].elements[j].value =
//                     bi_BigIntTofloat(
//                         architecture.components[i].elements[j].value,
//                     );
//             }

//             if (architecture.components[i].double_precision !== true) {
//                 if (architecture.components[i].type != "fp_registers") {
//                     aux_architecture.components[i].elements[j].default_value =
//                         architecture.components[i].elements[
//                             j
//                         ].default_value.toString();
//                 } else {
//                     aux_architecture.components[i].elements[j].default_value =
//                         bi_BigIntTofloat(
//                             architecture.components[i].elements[j]
//                                 .default_value,
//                         );
//                 }
//             }
//         }
//     }

//     return aux_architecture;
// }
