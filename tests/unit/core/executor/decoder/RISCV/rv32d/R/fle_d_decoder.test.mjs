import { decode_test } from "../../common.mjs";
Deno.test("decode - fle.d instruction 1", () =>
    decode_test("10100010001000001000000001010011", "fle.d x0, f1, f2"),
);

Deno.test("decode - fle.d instruction 2", () =>
    decode_test("10100010011000101000001001010011", "fle.d x4, f5, f6"),
);

Deno.test("decode - fle.d instruction 3", () =>
    decode_test("10100010000000000000000001010011", "fle.d x0, f0, f0"),
);

Deno.test("decode - fle.d instruction 4", () =>
    decode_test("10100011111111111000111111010011", "fle.d x31, f31, f31"),
);

Deno.test("decode - fle.d instruction 5", () =>
    decode_test("10100011111100000000011111010011", "fle.d x15, f0, f31"),
);

Deno.test("decode - fle.d instruction 6", () =>
    decode_test("10100010000011111000100001010011", "fle.d x16, f31, f0"),
);

Deno.test("decode - fle.d instruction 7", () =>
    decode_test("10100010001100010000000011010011", "fle.d x1, f2, f3"),
);

Deno.test("decode - fle.d instruction 8", () =>
    decode_test("10100011111010100000010101010011", "fle.d x10, f20, f30"),
);

Deno.test("decode - fle.d instruction 9", () =>
    decode_test("10100010111100111000111101010011", "fle.d x30, f7, f15"),
);

Deno.test("decode - fle.d instruction 10", () =>
    decode_test("10100010001100011000000111010011", "fle.d x3, f3, f3"),
);

Deno.test("decode - fle.d instruction 11", () =>
    decode_test("10100010110001100000011001010011", "fle.d x12, f12, f12"),
);

Deno.test("decode - fle.d instruction 12", () =>
    decode_test("10100010010000100000101101010011", "fle.d x22, f4, f4"),
);

Deno.test("decode - fle.d instruction 13", () =>
    decode_test("10100011000110000000011111010011", "fle.d x15, f16, f17"),
);

Deno.test("decode - fle.d instruction 14", () =>
    decode_test("10100010010111001000110001010011", "fle.d x24, f25, f5"),
);

Deno.test("decode - fle.d instruction 15", () =>
    decode_test("10100011110100010000111011010011", "fle.d x29, f2, f29"),
);

Deno.test("decode - fle.d instruction 16", () =>
    decode_test("10100011101000101000001011010011", "fle.d x5, f5, f26"),
);

Deno.test("decode - fle.d instruction 17", () =>
    decode_test("10100010100001000000100011010011", "fle.d x17, f8, f8"),
);
