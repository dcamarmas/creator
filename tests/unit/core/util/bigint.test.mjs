import { assert, assertEquals } from "https://deno.land/std/assert/mod.ts";
import {
    bi_intToBigInt,
    bi_floatToBigInt,
    bi_BigIntTofloat,
    bi_doubleToBigInt,
    bi_BigIntTodouble,
    register_value_deserialize,
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

Deno.test(
    "register_value_deserialize - deserializes non-floating point register values",
    () => {
        const architecture = {
            components: [
                {
                    type: "gp_registers",
                    double_precision: false,
                    elements: [
                        {
                            value: "123",
                            default_value: "456",
                        },
                    ],
                },
            ],
        };

        const deserializedArch = register_value_deserialize(architecture);
        assertEquals(
            typeof deserializedArch.components[0].elements[0].value,
            "bigint",
        );
        assertEquals(
            deserializedArch.components[0].elements[0].value,
            BigInt(123),
        );
        assertEquals(
            typeof deserializedArch.components[0].elements[0].default_value,
            "bigint",
        );
        assertEquals(
            deserializedArch.components[0].elements[0].default_value,
            BigInt(456),
        );
    },
);

Deno.test(
    "register_value_deserialize - deserializes floating point register values",
    () => {
        const architecture = {
            components: [
                {
                    type: "fp_registers",
                    double_precision: false,
                    elements: [
                        {
                            value: 3.14,
                            default_value: 2.718,
                        },
                    ],
                },
            ],
        };

        const deserializedArch = register_value_deserialize(architecture);
        const floatVal = bi_BigIntTofloat(
            deserializedArch.components[0].elements[0].value,
        );
        const floatDefault = bi_BigIntTofloat(
            deserializedArch.components[0].elements[0].default_value,
        );
        assert(Math.abs(floatVal - 3.14) < 1e-6);
        assert(Math.abs(floatDefault - 2.718) < 1e-6);
    },
);
