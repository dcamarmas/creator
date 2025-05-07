"use strict";
/*
 *  Copyright 2018-2025 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos
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

/*
 * Representation
 */
/**
 * method in chage of map a float number separated in parts and determinte what it.
 * @param s {Number} the sign of the number
 * @param e {Number} the exponent of the number.
 * @param m {Number} the mantinsa of the number
 * @return {number} 2^n with n as
 *      0 -> -infinite
 *      1 -> -normalized number
 *      2 -> -non-normalized number
 *      3 -> -0
 *      4 -> +0
 *      5 -> +normalized number
 *      6 -> +non-normalized number
 *      7 -> +inf
 *      8 -> -NaN
 *      9 -> +NaN
 */
export function checkTypeIEEE(s, e, m) {
    let rd = 0;

    if (!m && !e) rd = s ? 1 << 3 : 1 << 4;
    else if (!e) rd = s ? 1 << 2 : 1 << 5;
    else if (!(e ^ 255))
        if (m) rd = s ? 1 << 8 : 1 << 9;
        else rd = s ? 1 << 0 : 1 << 7;
    else rd = s ? 1 << 1 : 1 << 6;
    return rd;
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
    const exponent = 0;
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
    const value = hexvalue.split("x");
    if (typeof value[1] !== "undefined" && value[1].length > 8) {
        value[1] = value[1].substring(0, 8);
    }

    let value_bit = "";

    for (let i = 0; i < value[1].length; i++) {
        let aux = value[1].charAt(i);
        aux = parseInt(aux, 16).toString(2).padStart(4, "0");
        value_bit += aux;
    }

    value_bit = value_bit.padStart(32, "0");

    const buffer = new ArrayBuffer(4);
    new Uint8Array(buffer).set(value_bit.match(/.{8}/g).map(binaryStringToInt));
    return new DataView(buffer).getFloat32(0, false);
}
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
export function float32_to_uint(value) {
    const buf = new ArrayBuffer(4);
    new Float32Array(buf)[0] = value;
    return new Uint32Array(buf)[0];
}
export function uint_to_float64(value0, value1) {
    if (validInteger(value0) && validInteger(value1)) {
        const buf = new ArrayBuffer(8);
        const arr = new Uint32Array(buf);
        arr[0] = value0;
        arr[1] = value1;
        return new Float64Array(buf)[0];
    } else {
        return -1;
    }
}
export function float64_to_uint(value) {
    const buf = new ArrayBuffer(8);
    new Float64Array(buf)[0] = value;
    return new Uint32Array(buf);
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

export function bin2hex(s) {
    let i,
        k,
        part,
        accum,
        ret = "";

    for (i = s.length - 1; i >= 3; i -= 4) {
        part = s.substr(i + 1 - 4, 4);
        accum = 0;
        for (k = 0; k < 4; k += 1) {
            if (part[k] !== "0" && part[k] !== "1") {
                return { valid: false };
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
                return { valid: false };
            }
            accum = accum * 2 + parseInt(s[k], 10);
        }
        ret = String(accum) + ret;
    }

    return ret;
}

export function hex2double(hexvalue) {
    const value = hexvalue.split("x");
    let value_bit = "";

    for (let i = 0; i < value[1].length; i++) {
        let aux = value[1].charAt(i);
        aux = parseInt(aux, 16).toString(2).padStart(4, "0");
        value_bit += aux;
    }

    value_bit = value_bit.padStart(64, "0");

    const buffer = new ArrayBuffer(8);
    new Uint8Array(buffer).set(value_bit.match(/.{8}/g).map(binaryStringToInt));
    return new DataView(buffer).getFloat64(0, false);
}
function float2int_v2(value) {
    return parseInt(float2bin(value), 2);
}
function double2int_v2(value) {
    return parseInt(double2bin(value), 2);
}
function int2float_v2(value) {
    return hex2float("0x" + bin2hex(value.toString(2)));
}
export function full_print(value, bin_value, add_dot_zero) {
    let print_value = value;

    //Add - if the number is -0.0
    if (bin_value != null && value === 0 && bin_value[0] === 1) {
        print_value = "-" + print_value;
    }

    //Add .0 if the number is 0.0 or similar
    if (add_dot_zero) {
        const aux_value = value.toString();
        if (aux_value.indexOf(".") == -1 && Number.isInteger(aux_value)) {
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
    if (value2.search(re) != -1 && prefix != "undefined") {
        value2 = prefix + value2;
    }

    return value2;
}

/**
 * Converts a binary string to an array of hex bytes
 * @param {string} binary - Binary string (e.g., "00101010...")
 * @param {boolean} littleEndian - Whether to return bytes in little endian order
 * @returns {string[]} Array of hex bytes (e.g., ["2A", "F0", ...])
 */
export function binary_to_hexbytes(binary, littleEndian = false) {
    const hexBytes = [];
    // Process 8 bits at a time to generate hex bytes
    for (let i = 0; i < binary.length; i += 8) {
        const byte = binary.substr(i, 8);
        const hexByte = parseInt(byte, 2).toString(16).padStart(2, "0");
        hexBytes.push(hexByte);
    }

    // Return in requested endianness
    return littleEndian ? hexBytes.reverse() : hexBytes;
}

export function getHexTwosComplement(value, bits) {
    // For both positive and negative values, apply the appropriate bitmask
    const mask = (1n << BigInt(bits)) - 1n;
    // Use the mask to get only the relevant bits
    const maskedValue = value & mask;
    // Convert to hex and pad with leading zeros
    return maskedValue.toString(16).padStart(bits / 4, '0');
  }