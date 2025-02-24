import {
    assertEquals,
    assertNotEquals,
} from "https://deno.land/std/assert/mod.ts";
import { architecture } from "../../../../src/core/core.mjs"; // Unused but needed to fix circular dependency
import { CAPI_FP, capi_uint2int } from "../../../../src/core/capi/capi_fp.mjs";

Deno.test("split_double - splits 64-bit double into two 32-bit parts", () => {
    const testValue = 3.14159;
    const hex1 = CAPI_FP.split_double(testValue, 0);
    const hex2 = CAPI_FP.split_double(testValue, 1);

    assertEquals(typeof hex1, "string");
    assertEquals(typeof hex2, "string");
    assertEquals(hex1.length, 8);
    assertEquals(hex2.length, 8);
});

Deno.test("uint2float32 and float322uint conversion", () => {
    const originalValue = 12345;
    const floatValue = CAPI_FP.uint2float32(originalValue);
    const backToUint = CAPI_FP.float322uint(floatValue);

    assertEquals(typeof floatValue, "number");
    assertEquals(typeof backToUint, "bigint");
    assertEquals(backToUint, BigInt(originalValue));
});

Deno.test("int2uint and uint2int conversion", () => {
    const testValue = -42n;
    const uintValue = CAPI_FP.int2uint(testValue);
    const intValue = CAPI_FP.uint2int(uintValue);

    assertEquals(typeof uintValue, "bigint");
    assertEquals(typeof intValue, "bigint");
    assertEquals(intValue, testValue);
});

Deno.test("uint2float64 and float642uint conversion", () => {
    const value1 = 0x40091eb8n;
    const value2 = 0x51eb851fn;
    const doubleValue = CAPI_FP.uint2float64(value1, value2);
    const uintResult = CAPI_FP.float642uint(doubleValue);

    assertEquals(typeof doubleValue, "number");
    assertEquals(typeof uintResult, "bigint");
});

Deno.test("check_ieee validation", () => {
    // Test for normal number
    assertEquals(
        CAPI_FP.check_ieee("0", "01111111", "00000000000000000000000"),
        "1",
    );

    // Test for zero
    assertEquals(
        CAPI_FP.check_ieee("0", "00000000", "00000000000000000000000"),
        "0",
    );

    // Test for infinity
    assertEquals(
        CAPI_FP.check_ieee("0", "11111111", "00000000000000000000000"),
        "2",
    );
});

Deno.test("float2bin conversion", () => {
    const testValue = 1.5;
    const binResult = CAPI_FP.float2bin(testValue);

    assertEquals(typeof binResult, "string");
    assertEquals(binResult.length, 32);
    assertEquals(binResult.match(/[01]+/g)[0], binResult); // Should only contain 0s and 1s
});

Deno.test("capi_uint2int standalone function", () => {
    const testValue = 0xffffffffn;
    const result = capi_uint2int(testValue);

    assertEquals(typeof result, "bigint");
    assertNotEquals(result, testValue); // Should be converted to signed
});
