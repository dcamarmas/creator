import { assert, assertEquals } from "https://deno.land/std/assert/mod.ts";
import {
    bi_intToBigInt,
    bi_floatToBigInt,
    bi_BigIntTofloat,
    bi_doubleToBigInt,
    bi_BigIntTodouble,
} from "../../../../src/core/utils/bigint.mjs";

const REGISTER_SIZE = 32n;
const UINT32_MAX = 2n ** 32n;

Deno.test("bi_intToBigInt - converts positive integer correctly", () => {
    const input = 123;
    const result = bi_intToBigInt(input, 10);
    assertEquals(result, BigInt(input));
});

Deno.test("bi_intToBigInt - normalizes negative integer correctly", () => {
    const input = -1;
    const result = bi_intToBigInt(input, 10, 32);
    assertEquals(result, UINT32_MAX - 1n);
});

Deno.test(
    "bi_floatToBigInt and bi_BigIntTofloat - round trip float value",
    () => {
        const floatVal = 3.14;
        const bigIntVal = bi_floatToBigInt(floatVal);
        const floatRoundTrip = bi_BigIntTofloat(bigIntVal);
        assert(Math.abs(floatVal - floatRoundTrip) < 1e-6);
    },
);

Deno.test(
    "bi_doubleToBigInt and bi_BigIntTodouble - round trip double value",
    () => {
        const doubleVal = 3.141592653589793;
        const bigIntVal = bi_doubleToBigInt(doubleVal);
        const doubleRoundTrip = bi_BigIntTodouble(bigIntVal);
        assert(Math.abs(doubleVal - doubleRoundTrip) < 1e-12);
    },
);