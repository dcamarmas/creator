import { decode_test } from "../../common.mjs";

Deno.test("decode - feq.s instruction 1", () =>
    decode_test("10100000001000001010000001010011", "feq.s x0, f1, f2"),
);

Deno.test("decode - feq.s instruction 2", () =>
    decode_test("10100000011000101010001001010011", "feq.s x4, f5, f6"),
);

Deno.test("decode - feq.s instruction 3", () =>
    decode_test("10100000000000000010000001010011", "feq.s x0, f0, f0"),
);

Deno.test("decode - feq.s instruction 4", () =>
    decode_test("10100001111111111010111111010011", "feq.s x31, f31, f31"),
);

Deno.test("decode - feq.s instruction 5", () =>
    decode_test("10100001111100000010011111010011", "feq.s x15, f0, f31"),
);

Deno.test("decode - feq.s instruction 6", () =>
    decode_test("10100000000011111010100001010011", "feq.s x16, f31, f0"),
);

Deno.test("decode - feq.s instruction 7", () =>
    decode_test("10100000001100010010000011010011", "feq.s x1, f2, f3"),
);

Deno.test("decode - feq.s instruction 8", () =>
    decode_test("10100001111010100010010101010011", "feq.s x10, f20, f30"),
);

Deno.test("decode - feq.s instruction 9", () =>
    decode_test("10100000111100111010111101010011", "feq.s x30, f7, f15"),
);

Deno.test("decode - feq.s instruction 10", () =>
    decode_test("10100000001100011010000111010011", "feq.s x3, f3, f3"),
);

Deno.test("decode - feq.s instruction 11", () =>
    decode_test("10100000110001100010011001010011", "feq.s x12, f12, f12"),
);

Deno.test("decode - feq.s instruction 12", () =>
    decode_test("10100000010000100010101101010011", "feq.s x22, f4, f4"),
);

Deno.test("decode - feq.s instruction 13", () =>
    decode_test("10100001000110000010011111010011", "feq.s x15, f16, f17"),
);

Deno.test("decode - feq.s instruction 14", () =>
    decode_test("10100000010111001010110001010011", "feq.s x24, f25, f5"),
);

Deno.test("decode - feq.s instruction 15", () =>
    decode_test("10100001110100010010111011010011", "feq.s x29, f2, f29"),
);

Deno.test("decode - feq.s instruction 16", () =>
    decode_test("10100001101000101010001011010011", "feq.s x5, f5, f26"),
);

Deno.test("decode - feq.s instruction 17", () =>
    decode_test("10100000100001000010100011010011", "feq.s x17, f8, f8"),
);
