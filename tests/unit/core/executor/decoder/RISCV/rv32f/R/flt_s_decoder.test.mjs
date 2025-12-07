import { decode_test } from "../../common.mjs";

Deno.test("decode - flt.s instruction 1", () =>
    decode_test("10100000001000001001000001010011", "flt.s x0, f1, f2"),
);

Deno.test("decode - flt.s instruction 2", () =>
    decode_test("10100000011000101001001001010011", "flt.s x4, f5, f6"),
);

Deno.test("decode - flt.s instruction 3", () =>
    decode_test("10100000000000000001000001010011", "flt.s x0, f0, f0"),
);

Deno.test("decode - flt.s instruction 4", () =>
    decode_test("10100001111111111001111111010011", "flt.s x31, f31, f31"),
);

Deno.test("decode - flt.s instruction 5", () =>
    decode_test("10100001111100000001011111010011", "flt.s x15, f0, f31"),
);

Deno.test("decode - flt.s instruction 6", () =>
    decode_test("10100000000011111001100001010011", "flt.s x16, f31, f0"),
);

Deno.test("decode - flt.s instruction 7", () =>
    decode_test("10100000001100010001000011010011", "flt.s x1, f2, f3"),
);

Deno.test("decode - flt.s instruction 8", () =>
    decode_test("10100001111010100001010101010011", "flt.s x10, f20, f30"),
);

Deno.test("decode - flt.s instruction 9", () =>
    decode_test("10100000111100111001111101010011", "flt.s x30, f7, f15"),
);

Deno.test("decode - flt.s instruction 10", () =>
    decode_test("10100000001100011001000111010011", "flt.s x3, f3, f3"),
);

Deno.test("decode - flt.s instruction 11", () =>
    decode_test("10100000110001100001011001010011", "flt.s x12, f12, f12"),
);

Deno.test("decode - flt.s instruction 12", () =>
    decode_test("10100000010000100001101101010011", "flt.s x22, f4, f4"),
);

Deno.test("decode - flt.s instruction 13", () =>
    decode_test("10100001000110000001011111010011", "flt.s x15, f16, f17"),
);

Deno.test("decode - flt.s instruction 14", () =>
    decode_test("10100000010111001001110001010011", "flt.s x24, f25, f5"),
);

Deno.test("decode - flt.s instruction 15", () =>
    decode_test("10100001110100010001111011010011", "flt.s x29, f2, f29"),
);

Deno.test("decode - flt.s instruction 16", () =>
    decode_test("10100001101000101001001011010011", "flt.s x5, f5, f26"),
);

Deno.test("decode - flt.s instruction 17", () =>
    decode_test("10100000100001000001100011010011", "flt.s x17, f8, f8"),
);
