import { decode_test } from "../../common.mjs";

Deno.test("decode - fle.s instruction 1", () =>
    decode_test("10100000001000001000000001010011", "fle.s x0, f1, f2"),
);

Deno.test("decode - fle.s instruction 2", () =>
    decode_test("10100000011000101000001001010011", "fle.s x4, f5, f6"),
);

Deno.test("decode - fle.s instruction 3", () =>
    decode_test("10100000000000000000000001010011", "fle.s x0, f0, f0"),
);

Deno.test("decode - fle.s instruction 4", () =>
    decode_test("10100001111111111000111111010011", "fle.s x31, f31, f31"),
);

Deno.test("decode - fle.s instruction 5", () =>
    decode_test("10100001111100000000011111010011", "fle.s x15, f0, f31"),
);

Deno.test("decode - fle.s instruction 6", () =>
    decode_test("10100000000011111000100001010011", "fle.s x16, f31, f0"),
);

Deno.test("decode - fle.s instruction 7", () =>
    decode_test("10100000001100010000000011010011", "fle.s x1, f2, f3"),
);

Deno.test("decode - fle.s instruction 8", () =>
    decode_test("10100001111010100000010101010011", "fle.s x10, f20, f30"),
);

Deno.test("decode - fle.s instruction 9", () =>
    decode_test("10100000111100111000111101010011", "fle.s x30, f7, f15"),
);

Deno.test("decode - fle.s instruction 10", () =>
    decode_test("10100000001100011000000111010011", "fle.s x3, f3, f3"),
);

Deno.test("decode - fle.s instruction 11", () =>
    decode_test("10100000110001100000011001010011", "fle.s x12, f12, f12"),
);

Deno.test("decode - fle.s instruction 12", () =>
    decode_test("10100000010000100000101101010011", "fle.s x22, f4, f4"),
);

Deno.test("decode - fle.s instruction 13", () =>
    decode_test("10100001000110000000011111010011", "fle.s x15, f16, f17"),
);

Deno.test("decode - fle.s instruction 14", () =>
    decode_test("10100000010111001000110001010011", "fle.s x24, f25, f5"),
);

Deno.test("decode - fle.s instruction 15", () =>
    decode_test("10100001110100010000111011010011", "fle.s x29, f2, f29"),
);

Deno.test("decode - fle.s instruction 16", () =>
    decode_test("10100001101000101000001011010011", "fle.s x5, f5, f26"),
);

Deno.test("decode - fle.s instruction 17", () =>
    decode_test("10100000100001000000100011010011", "fle.s x17, f8, f8"),
);
