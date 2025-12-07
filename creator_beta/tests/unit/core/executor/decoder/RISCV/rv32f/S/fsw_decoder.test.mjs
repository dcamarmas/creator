import { decode_test } from "../../common.mjs";

Deno.test("decode - fsw instruction 1", () =>
    decode_test("00000000000000000010000000100111", "fsw f0, 0(x0)"),
);

Deno.test("decode - fsw instruction 2", () =>
    decode_test("00000000000100001010000000100111", "fsw f1, 0(x1)"),
);

Deno.test("decode - fsw instruction 3", () =>
    decode_test("01111110001000010010111110100111", "fsw f2, 2047(x2)"),
);

Deno.test("decode - fsw instruction 4", () =>
    decode_test("10000000001100011010000000100111", "fsw f3, -2048(x3)"),
);

Deno.test("decode - fsw instruction 5", () =>
    decode_test("00000000010000100010001000100111", "fsw f4, 4(x4)"),
);

Deno.test("decode - fsw instruction 6", () =>
    decode_test("00000000010100101010000010100111", "fsw f5, 1(x5)"),
);

Deno.test("decode - fsw instruction 7", () =>
    decode_test("00010010011001010010000110100111", "fsw f6, 291(x10)"),
);

Deno.test("decode - fsw instruction 8", () =>
    decode_test("11111110011101111010111110100111", "fsw f7, -1(x15)"),
);

Deno.test("decode - fsw instruction 9", () =>
    decode_test("01010100100010100010101010100111", "fsw f8, 1365(x20)"),
);

Deno.test("decode - fsw instruction 10", () =>
    decode_test("00000001111111111010000010100111", "fsw f31, 1(x31)"),
);
