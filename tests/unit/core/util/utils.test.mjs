import { assert, assertEquals } from "https://deno.land/std/assert/mod.ts";
import {
    checkTypeIEEE,
    hex2char8,
    hex2float,
    uint_to_float32,
    float32_to_uint,
    uint_to_float64,
    float64_to_uint,
    float2bin,
    double2bin,
    bin2hex,
    hex2double,
    full_print,
    clean_string,
} from "../../../../src/core/utils/utils.mjs";

Deno.test("checkTypeIEEE - returns 16 for positive zero (s=0,e=0,m=0)", () => {
    assertEquals(checkTypeIEEE(0, 0, 0), 16);
});

Deno.test("checkTypeIEEE - returns 8 for negative zero (s=1,e=0,m=0)", () => {
    assertEquals(checkTypeIEEE(1, 0, 0), 8);
});

Deno.test("checkTypeIEEE - normalized positive number", () => {
    assertEquals(checkTypeIEEE(0, 100, 1), 64);
});

Deno.test("checkTypeIEEE - normalized negative number", () => {
    assertEquals(checkTypeIEEE(1, 100, 1), 2);
});

Deno.test("hex2char8 - converts hex string to spaced characters", () => {
    const hexStr = "48656c6c6f";
    const expected = "H e l l o ";
    assertEquals(hex2char8(hexStr), expected);
});

Deno.test("hex2float - converts hex to float (pi approximation)", () => {
    const hexVal = "0x40490FDB";
    const result = hex2float(hexVal);
    assert(Math.abs(result - 3.1415927) < 1e-6);
});

Deno.test("uint_to_float32 and float32_to_uint - round trip conversion", () => {
    const number = 1.5;
    const uintVal = float32_to_uint(number);
    const floatVal = uint_to_float32(uintVal);
    assert(Math.abs(floatVal - number) < 1e-6);
});

Deno.test("uint_to_float64 and float64_to_uint - round trip conversion", () => {
    const number = 2.718281828459045;
    const uintArr = float64_to_uint(number);
    const floatVal = uint_to_float64(uintArr[0], uintArr[1]);
    assert(Math.abs(floatVal - number) < 1e-12);
});

Deno.test("float2bin - returns 32-bit binary string", () => {
    const number = 1.0;
    const binStr = float2bin(number);
    assertEquals(binStr.length, 32);
});

Deno.test("double2bin - returns 64-bit binary string", () => {
    const number = 1.0;
    const binStr = double2bin(number);
    assertEquals(binStr.length, 64);
});

Deno.test("bin2hex - converts binary string to hexadecimal", () => {
    const binStr = "1111";
    const hex = bin2hex(binStr);
    assertEquals(hex, "F");
});

Deno.test("bin2hex - returns invalid for incorrect binary input", () => {
    const invalidStr = "1020";
    const result = bin2hex(invalidStr);
    assertEquals(result.valid, false);
});

Deno.test("hex2double - converts hex to double (pi approximation)", () => {
    const hexVal = "0x400921FB54442D18";
    const result = hex2double(hexVal);
    assert(Math.abs(result - 3.141592653589793) < 1e-12);
});

Deno.test("clean_string - prepends prefix to numeric only strings", () => {
    const input = "12345";
    const expected = "pre12345";
    assertEquals(clean_string(input, "pre"), expected);
});

Deno.test(
    "clean_string - does not change strings with non-numeric characters",
    () => {
        const input = "abc123";
        assertEquals(clean_string(input, "pre"), "abc123");
    },
);
