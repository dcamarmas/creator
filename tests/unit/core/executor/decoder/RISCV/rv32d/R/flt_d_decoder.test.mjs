import { decode_test } from "../../common.mjs";
Deno.test("decode - flt.d instruction 1", () =>
    decode_test("10100010001000001001000001010011", "flt.d x0, f1, f2"),
);

Deno.test("decode - flt.d instruction 2", () =>
    decode_test("10100010011000101001001001010011", "flt.d x4, f5, f6"),
);

Deno.test("decode - flt.d instruction 3", () =>
    decode_test("10100010000000000001000001010011", "flt.d x0, f0, f0"),
);

Deno.test("decode - flt.d instruction 4", () =>
    decode_test("10100011111111111001111111010011", "flt.d x31, f31, f31"),
);

Deno.test("decode - flt.d instruction 5", () =>
    decode_test("10100011111100000001011111010011", "flt.d x15, f0, f31"),
);

Deno.test("decode - flt.d instruction 6", () =>
    decode_test("10100010000011111001100001010011", "flt.d x16, f31, f0"),
);

Deno.test("decode - flt.d instruction 7", () =>
    decode_test("10100010001100010001000011010011", "flt.d x1, f2, f3"),
);

Deno.test("decode - flt.d instruction 8", () =>
    decode_test("10100011111010100001010101010011", "flt.d x10, f20, f30"),
);

Deno.test("decode - flt.d instruction 9", () =>
    decode_test("10100010111100111001111101010011", "flt.d x30, f7, f15"),
);

Deno.test("decode - flt.d instruction 10", () =>
    decode_test("10100010001100011001000111010011", "flt.d x3, f3, f3"),
);

Deno.test("decode - flt.d instruction 11", () =>
    decode_test("10100010110001100001011001010011", "flt.d x12, f12, f12"),
);

Deno.test("decode - flt.d instruction 12", () =>
    decode_test("10100010010000100001101101010011", "flt.d x22, f4, f4"),
);

Deno.test("decode - flt.d instruction 13", () =>
    decode_test("10100011000110000001011111010011", "flt.d x15, f16, f17"),
);

Deno.test("decode - flt.d instruction 14", () =>
    decode_test("10100010010111001001110001010011", "flt.d x24, f25, f5"),
);

Deno.test("decode - flt.d instruction 15", () =>
    decode_test("10100011110100010001111011010011", "flt.d x29, f2, f29"),
);

Deno.test("decode - flt.d instruction 16", () =>
    decode_test("10100011101000101001001011010011", "flt.d x5, f5, f26"),
);

Deno.test("decode - flt.d instruction 17", () =>
    decode_test("10100010100001000001100011010011", "flt.d x17, f8, f8"),
);
