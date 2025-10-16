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

// Comprehensive tests for checkTypeIEEE function
// Testing all IEEE 754 floating-point classifications

Deno.test("checkTypeIEEE - positive zero (+0): s=0, e=0, m=0", () => {
    assertEquals(checkTypeIEEE(0, 0, 0), 16); // 1 << 4
});

Deno.test("checkTypeIEEE - negative zero (-0): s=1, e=0, m=0", () => {
    assertEquals(checkTypeIEEE(1, 0, 0), 8); // 1 << 3
});

Deno.test("checkTypeIEEE - positive normalized number: s=0, e=127, m=1", () => {
    assertEquals(checkTypeIEEE(0, 127, 1), 64); // 1 << 6
});

Deno.test("checkTypeIEEE - negative normalized number: s=1, e=127, m=1", () => {
    assertEquals(checkTypeIEEE(1, 127, 1), 2); // 1 << 1
});

Deno.test(
    "checkTypeIEEE - positive subnormal (denormalized): s=0, e=0, m=1",
    () => {
        assertEquals(checkTypeIEEE(0, 0, 1), 32); // 1 << 5
    },
);

Deno.test(
    "checkTypeIEEE - negative subnormal (denormalized): s=1, e=0, m=1",
    () => {
        assertEquals(checkTypeIEEE(1, 0, 1), 4); // 1 << 2
    },
);

Deno.test("checkTypeIEEE - positive infinity: s=0, e=255, m=0", () => {
    assertEquals(checkTypeIEEE(0, 255, 0), 128); // 1 << 7
});

Deno.test("checkTypeIEEE - negative infinity: s=1, e=255, m=0", () => {
    assertEquals(checkTypeIEEE(1, 255, 0), 1); // 1 << 0
});

Deno.test("checkTypeIEEE - positive NaN: s=0, e=255, m=1", () => {
    assertEquals(checkTypeIEEE(0, 255, 1), 512); // 1 << 9
});

Deno.test("checkTypeIEEE - negative NaN: s=1, e=255, m=1", () => {
    assertEquals(checkTypeIEEE(1, 255, 1), 256); // 1 << 8
});

// Edge cases with different mantissa values
Deno.test(
    "checkTypeIEEE - positive subnormal with large mantissa: s=0, e=0, m=8388607",
    () => {
        assertEquals(checkTypeIEEE(0, 0, 8388607), 32); // 1 << 5 (still subnormal)
    },
);

Deno.test(
    "checkTypeIEEE - negative subnormal with large mantissa: s=1, e=0, m=8388607",
    () => {
        assertEquals(checkTypeIEEE(1, 0, 8388607), 4); // 1 << 2 (still subnormal)
    },
);

Deno.test(
    "checkTypeIEEE - positive NaN with large mantissa: s=0, e=255, m=8388607",
    () => {
        assertEquals(checkTypeIEEE(0, 255, 8388607), 512); // 1 << 9 (still NaN)
    },
);

Deno.test(
    "checkTypeIEEE - negative NaN with large mantissa: s=1, e=255, m=8388607",
    () => {
        assertEquals(checkTypeIEEE(1, 255, 8388607), 256); // 1 << 8 (still NaN)
    },
);

// Test with minimum and maximum normal exponents
Deno.test(
    "checkTypeIEEE - positive normalized with min exponent: s=0, e=1, m=0",
    () => {
        assertEquals(checkTypeIEEE(0, 1, 0), 64); // 1 << 6
    },
);

Deno.test(
    "checkTypeIEEE - negative normalized with min exponent: s=1, e=1, m=0",
    () => {
        assertEquals(checkTypeIEEE(1, 1, 0), 2); // 1 << 1
    },
);

Deno.test(
    "checkTypeIEEE - positive normalized with max exponent: s=0, e=254, m=8388607",
    () => {
        assertEquals(checkTypeIEEE(0, 254, 8388607), 64); // 1 << 6
    },
);

Deno.test(
    "checkTypeIEEE - negative normalized with max exponent: s=1, e=254, m=8388607",
    () => {
        assertEquals(checkTypeIEEE(1, 254, 8388607), 2); // 1 << 1
    },
);

// Test boundary conditions
Deno.test(
    "checkTypeIEEE - positive normalized with zero mantissa: s=0, e=100, m=0",
    () => {
        assertEquals(checkTypeIEEE(0, 100, 0), 64); // 1 << 6
    },
);

Deno.test(
    "checkTypeIEEE - negative normalized with zero mantissa: s=1, e=100, m=0",
    () => {
        assertEquals(checkTypeIEEE(1, 100, 0), 2); // 1 << 1
    },
);

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
    assertEquals(result, null);
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
