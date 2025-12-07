import { decode_test } from "../../common.mjs";
Deno.test("decode - feq.d instruction 1", () =>
    decode_test("10100010001000001010000001010011", "feq.d x0, f1, f2"),
);

Deno.test("decode - feq.d instruction 2", () =>
    decode_test("10100010011000101010001001010011", "feq.d x4, f5, f6"),
);

Deno.test("decode - feq.d instruction 3", () =>
    decode_test("10100010000000000010000001010011", "feq.d x0, f0, f0"),
);

Deno.test("decode - feq.d instruction 4", () =>
    decode_test("10100011111111111010111111010011", "feq.d x31, f31, f31"),
);

Deno.test("decode - feq.d instruction 5", () =>
    decode_test("10100011111100000010011111010011", "feq.d x15, f0, f31"),
);

Deno.test("decode - feq.d instruction 6", () =>
    decode_test("10100010000011111010100001010011", "feq.d x16, f31, f0"),
);

Deno.test("decode - feq.d instruction 7", () =>
    decode_test("10100010001100010010000011010011", "feq.d x1, f2, f3"),
);

Deno.test("decode - feq.d instruction 8", () =>
    decode_test("10100011111010100010010101010011", "feq.d x10, f20, f30"),
);

Deno.test("decode - feq.d instruction 9", () =>
    decode_test("10100010111100111010111101010011", "feq.d x30, f7, f15"),
);

Deno.test("decode - feq.d instruction 10", () =>
    decode_test("10100010001100011010000111010011", "feq.d x3, f3, f3"),
);

Deno.test("decode - feq.d instruction 11", () =>
    decode_test("10100010110001100010011001010011", "feq.d x12, f12, f12"),
);

Deno.test("decode - feq.d instruction 12", () =>
    decode_test("10100010010000100010101101010011", "feq.d x22, f4, f4"),
);

Deno.test("decode - feq.d instruction 13", () =>
    decode_test("10100011000110000010011111010011", "feq.d x15, f16, f17"),
);

Deno.test("decode - feq.d instruction 14", () =>
    decode_test("10100010010111001010110001010011", "feq.d x24, f25, f5"),
);

Deno.test("decode - feq.d instruction 15", () =>
    decode_test("10100011110100010010111011010011", "feq.d x29, f2, f29"),
);

Deno.test("decode - feq.d instruction 16", () =>
    decode_test("10100011101000101010001011010011", "feq.d x5, f5, f26"),
);

Deno.test("decode - feq.d instruction 17", () =>
    decode_test("10100010100001000010100011010011", "feq.d x17, f8, f8"),
);
