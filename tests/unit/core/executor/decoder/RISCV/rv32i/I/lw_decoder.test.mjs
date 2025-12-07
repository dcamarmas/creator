import { decode_test } from "../../common.mjs";

Deno.test("decode - lw instruction 1", () =>
    decode_test("00000000000000000010000000000011", "lw x0, 0(x0)"),
);

Deno.test("decode - lw instruction 2", () =>
    decode_test("00000000000000001010000010000011", "lw x1, 0(x1)"),
);

Deno.test("decode - lw instruction 3", () =>
    decode_test("00000000000100010010000100000011", "lw x2, 1(x2)"),
);

Deno.test("decode - lw instruction 4", () =>
    decode_test("11111111111100011010000110000011", "lw x3, -1(x3)"),
);

Deno.test("decode - lw instruction 5", () =>
    decode_test("01111111111100100010001000000011", "lw x4, 2047(x4)"),
);

Deno.test("decode - lw instruction 6", () =>
    decode_test("10000000000000101010001010000011", "lw x5, -2048(x5)"),
);

Deno.test("decode - lw instruction 7", () =>
    decode_test("00000000000000111010001100000011", "lw x6, 0(x7)"),
);

Deno.test("decode - lw instruction 8", () =>
    decode_test("00000000000011110010111110000011", "lw x31, 0(x30)"),
);

Deno.test("decode - lw instruction 9", () =>
    decode_test("01000000000010000010011110000011", "lw x15, 1024(x16)"),
);

Deno.test("decode - lw instruction 10", () =>
    decode_test("11000000000010101010101000000011", "lw x20, -1024(x21)"),
);

Deno.test("decode - lw instruction 11", () =>
    decode_test("00000000000000000010010100000011", "lw x10, 0(x0)"),
);

Deno.test("decode - lw instruction 12", () =>
    decode_test("00000010101001001010010000000011", "lw x8, 42(x9)"),
);
