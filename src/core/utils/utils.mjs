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

export function packExecute(error, err_msg, err_type, draw) {
    const ret = {};

    ret.error = error;
    ret.msg = err_msg;
    ret.type = err_type;
    ret.draw = draw;

    return ret;
}

export function getPrimaryKey(instr) {
    let key = "";
    for (const field of instr.fields) {
        if (field.type === "co" || field.type === "cop") {
            key += `${field.value}:${field.startbit}:${field.stopbit}-`;
        }
    }
    return key;
}

/**
 * Check the type of a number in IEEE 754 format.
 * @param {string} s - Sign bit (0 for positive, 1 for negative)
 * @param {string} e - Exponent binary string
 * @param {string} m - Mantissa binary string
 * @returns {number} Returns a 10-bit mask where the position of the set bit
 * indicates the type of the IEEE 754 number:
 *      0 -> -inf
 *      1 -> -normalized number
 *      2 -> -non-normalized number
 *      3 -> -0
 *      4 -> +0
 *      5 -> +non-normalized number
 *      6 -> +normalized number
 *      7 -> +inf
 *      8 -> signaling NaN
 *      9 -> quiet NaN
 */
export function checkTypeIEEE(s, e, m) {
    let rd;
    const s_int = parseInt(s, 2);
    const e_int = parseInt(e, 2);
    const m_int = parseInt(m, 2);

    if (!m_int && !e_int)
        rd = s_int ? 3 : 4; // mantisa and exponent are 0 => ±0
    else if (!e_int)
        rd = s_int ? 2 : 5; // exponent is 0 but mantisa isn't => ±non-normalized number
    // exponent is all 1s
    else if (!e.includes("0"))
        if (m_int)
            // mantisa isn't 0 => NaN. It's signaling if the MSB of the mantisa is 0
            rd = m[0] === "0" ? 8 : 9;
        // mantisa is 0 => ±inf
        else rd = s_int ? 0 : 7;
    else rd = s_int ? 1 : 6; // any other case is a normalized number
    return 1 << rd;
}
function binaryStringToInt(bstring) {
    return parseInt(bstring, 2);
}
function validInteger(value) {
    return value <= Number.MAX_SAFE_INTEGER && value >= Number.MIN_SAFE_INTEGER;
}
/*
 * Convert to...
 */
export function hex2char8(hexvalue) {
    const num_char = hexvalue.toString().length / 2;
    let pos = 0;

    const valuec = [];

    for (let i = 0; i < num_char; i++) {
        const auxHex = hexvalue.substring(pos, pos + 2);
        valuec[i] = String.fromCharCode(parseInt(auxHex, 16));
        pos += 2;
    }

    let characters = "";

    for (let i = 0; i < valuec.length; i++) {
        characters = characters + valuec[i] + " ";
    }

    return characters;
}

export function hex2float(hexvalue) {
    let value = hexvalue.replace("0x", "");
    if (typeof value !== "undefined" && value.length > 8) {
        value = value.substring(0, 8);
    }

    let value_bit = "";

    for (let i = 0; i < value.length; i++) {
        let aux = value.charAt(i);
        aux = parseInt(aux, 16).toString(2).padStart(4, "0");
        value_bit += aux;
    }

    value_bit = value_bit.padStart(32, "0");

    const buffer = new ArrayBuffer(4);
    new Uint8Array(buffer).set(value_bit.match(/.{8}/g).map(binaryStringToInt));
    return new DataView(buffer).getFloat32(0, false);
}
/**
 * Converts a 32-bit unsigned integer to a 32-bit float.
 * @param {number} value - The 32-bit unsigned integer to convert
 * @returns {number} The converted 32-bit float value
 */
export function uint_to_float32(value) {
    if (validInteger(value)) {
        const buf = new ArrayBuffer(4);
        value = Number(value);
        new Uint32Array(buf)[0] = value;
        return new Float32Array(buf)[0];
    } else {
        return -1;
    }
}
/**
 * Converts a 32-bit float to a 32-bit unsigned integer.
 * @param {number} value - The 32-bit float to convert
 * @returns {number} The converted 32-bit unsigned integer
 */
export function float32_to_uint(value) {
    const buf = new ArrayBuffer(4);
    new Float32Array(buf)[0] = value;
    return new Uint32Array(buf)[0];
}
/**
 * Converts 32-bit unsigned integers to a 64-bit float.
 * Supports two calling conventions:
 * 1. Single BigInt argument: converts a 64-bit integer directly
 * 2. Two 32-bit arguments: converts low and high 32-bit parts
 * @param {number|bigint} value0 - Lower 32 bits (as number) or full 64-bit value (as BigInt)
 * @param {number} [value1] - Higher 32 bits (only used when value0 is a number)
 * @returns {number} The converted 64-bit float value
 */
export function uint_to_float64(value0, value1) {
    const buf = new ArrayBuffer(8);
    const arr = new Uint32Array(buf);

    // Case 1: Single BigInt argument
    if (value1 === undefined && typeof value0 === "bigint") {
        arr[0] = Number(value0 & 0xffffffffn); // Lower 32 bits
        arr[1] = Number(value0 >> 32n); // Upper 32 bits
        return new Float64Array(buf)[0];
    }

    // Case 2: Two 32-bit integer arguments
    if (validInteger(value0) && validInteger(value1)) {
        arr[0] = value0;
        arr[1] = value1;
        return new Float64Array(buf)[0];
    }

    return -1; // Invalid input
}
/**
 * Converts a 64-bit float to two 32-bit unsigned integers.
 * @param {number} value - The 64-bit float to convert
 * @returns {[number, number]} Array containing [lower_32_bits, higher_32_bits]
 */
export function float64_to_uint(value) {
    const buf = new ArrayBuffer(8);
    new Float64Array(buf)[0] = value;
    const arr = new Uint32Array(buf);
    return [arr[0], arr[1]];
}

export function float2bin(number) {
    number = parseFloat(number);
    let i,
        result = "";
    const dv = new DataView(new ArrayBuffer(4));

    dv.setFloat32(0, number, false);

    for (i = 0; i < 4; i++) {
        let bits = dv.getUint8(i).toString(2);
        if (bits.length < 8) {
            bits = new Array(8 - bits.length).fill("0").join("") + bits;
        }
        result += bits;
    }
    return result;
}

export function double2bin(number) {
    number = parseFloat(number); // parseFloat works with double precision
    let i,
        result = "";
    const dv = new DataView(new ArrayBuffer(8));

    dv.setFloat64(0, number, false);

    for (i = 0; i < 8; i++) {
        let bits = dv.getUint8(i).toString(2);
        if (bits.length < 8) {
            bits = new Array(8 - bits.length).fill("0").join("") + bits;
        }
        result += bits;
    }
    return result;
}

/**
 *
 * @param {string} s
 * @returns {string | null}
 */
export function bin2hex(s) {
    let i,
        k,
        part,
        accum,
        ret = "";

    for (i = s.length - 1; i >= 3; i -= 4) {
        part = s.slice(i + 1 - 4, i + 1);
        accum = 0;
        for (k = 0; k < 4; k += 1) {
            if (part[k] !== "0" && part[k] !== "1") {
                return null;
            }
            accum = accum * 2 + parseInt(part[k], 10);
        }
        if (accum >= 10) {
            ret = String.fromCharCode(accum - 10 + "A".charCodeAt(0)) + ret;
        } else {
            ret = String(accum) + ret;
        }
    }

    if (i >= 0) {
        accum = 0;
        for (k = 0; k <= i; k += 1) {
            if (s[k] !== "0" && s[k] !== "1") {
                return null;
            }
            accum = accum * 2 + parseInt(s[k], 10);
        }
        ret = String(accum) + ret;
    }

    return ret;
}

export function hex2double(hexvalue) {
    const value = hexvalue.replace("0x", "");
    let value_bit = "";

    for (let i = 0; i < value.length; i++) {
        let aux = value.charAt(i);
        aux = parseInt(aux, 16).toString(2).padStart(4, "0");
        value_bit += aux;
    }

    value_bit = value_bit.padStart(64, "0");

    const buffer = new ArrayBuffer(8);
    new Uint8Array(buffer).set(value_bit.match(/.{8}/g).map(binaryStringToInt));
    return new DataView(buffer).getFloat64(0, false);
}

/**
 * Returns a signed integer. Max size of input is 32b.
 */
export function hex2SignedInt(hexvalue) {
    const size = hexvalue.replace("0x", "").length;
    const mask = 0x8 * 16 ** (size - 1);
    const sub = -0x1 * 16 ** size;

    if ((parseInt(hexvalue, 16) & mask) > 0) {
        // negative
        return sub + parseInt(hexvalue, 16);
    } else {
        // positive
        return parseInt(hexvalue, 16);
    }
}

export function float2int_v2(value) {
    return parseInt(float2bin(value), 2);
}

export function double2int_v2(value) {
    return parseInt(double2bin(value), 2);
}

export function int2float_v2(value) {
    return hex2float("0x" + bin2hex(value.toString(2)));
}

export function full_print(value, bin_value, add_dot_zero) {
    let print_value = value;

    //Add - if the number is -0.0
    if (bin_value !== null && value === 0 && bin_value[0] === 1) {
        print_value = "-" + print_value;
    }

    //Add .0 if the number is 0.0 or similar
    if (add_dot_zero) {
        const aux_value = value.toString();
        if (aux_value.indexOf(".") === -1 && Number.isInteger(aux_value)) {
            print_value += ".0";
        }
    }

    return print_value;
}
/*
 *  Naming
 */
export function clean_string(value, prefix) {
    let value2 = value.replace(/[&/\\#,+()$~%.'":*?<>{}]/g, "_");

    const re = /^[0-9]+$/;
    if (value2.search(re) !== -1 && prefix !== "undefined") {
        value2 = prefix + value2;
    }

    return value2;
}

export function getHexTwosComplement(value, bits, padding = true) {
    value = BigInt(value);
    // For both positive and negative values, apply the appropriate bitmask
    const mask = (1n << BigInt(bits)) - 1n;
    // Use the mask to get only the relevant bits
    const maskedValue = value & mask;
    // Convert to hex and conditionally pad with leading zeros
    const hexValue = maskedValue.toString(16);
    return padding ? hexValue.padStart(bits / 4, "0") : hexValue;
}

/**
 * Converts an Object of Arrays to an Array of Objects
 * @param {Object} object_arrays An object of arrays where each array is of the same length
 * @returns {Array<Object>} An Array of objects where each key in each object corresponds to that element in the original array
 */
export function obj_arraysTOarray_objs(object_arrays) {
    // stolen from
    // https://gist.github.com/thesofakillers/bcf39eaed428304ddc126ca8f12336f7

    const final_array = object_arrays[Object.keys(object_arrays)[0]].map(
        // el is unused, but needs to be defined for map to give access to index i
        (_el, i) => {
            const internal_object = {};
            Object.keys(object_arrays).forEach(
                key => (internal_object[key] = object_arrays[key][i]),
            );
            return internal_object;
        },
    );
    return final_array;
}

/**
 * Splits an array into chunks.
 *
 * Modified from
 * https://www.geeksforgeeks.org/javascript/split-an-array-into-chunks-in-javascript/
 *
 * @example
 * ```js
 * chunks(
 *   [ 10, 20, 30, 40, 50, 60, 70],
 *   2
 * ); // [ [ 10, 20 ], [ 30, 40 ], [ 50, 60 ], [ 70, 80 ] ]
 * ```
 * @template T
 * @param {T[]} arr Array to iterate through
 * @param {number} chunkSize Size of the chunks
 *
 * @returns {T[][]}
 *
 */
export function chunks(arr, chunkSize) {
    return arr.reduce((acc, _, index) => {
        if (index % chunkSize !== 0) {
            // continue
            return acc;
        }
        // Create chunk using array.slice() and push into the accumulator
        acc.push(arr.slice(index, index + chunkSize));

        return acc;
    }, []);
}

/**
 * Returns a range [`start`, `stop`), if `stop` is specified. Otherwise, it
 * returns a range [`0`, `start`).
 *
 * Modified from
 * https://artemee-lemann.medium.com/range-function-in-javascript-b12fbff42d03
 *
 * @param {number?} start Beginning of the range.
 * @param {number} stop End of range.
 * @param {number?} step Interval between numbers. Default is 1.
 *
 * @return {Generator}
 */

export function* range(start, stop = undefined, step = 1) {
    if (stop === undefined) {
        stop = start;
        start = 0;
    }
    while (start < stop) {
        yield start;
        start += step;
    }
}

/**
 * Convert a number to an uppercase hexadecimal string.
 *
 * @param {number|bigint} value The number to convert
 * @param {number} [padding=0] Padding, in bytes
 *
 * @returns {string} Uppercase hexadecimal string
 */
export function toHex(value, padding = 0) {
    return value
        .toString(16)
        .padStart(padding * 2, "0")
        .toUpperCase();
}
