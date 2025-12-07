import { decode_test } from "../../common.mjs";

Deno.test("decode - lb instruction 1", () =>
    decode_test("00000000000000000000000000000011", "lb x0, 0(x0)"),
);

Deno.test("decode - lb instruction 2", () =>
    decode_test("00000000000000001000000010000011", "lb x1, 0(x1)"),
);

Deno.test("decode - lb instruction 3", () =>
    decode_test("00000000000100010000000100000011", "lb x2, 1(x2)"),
);

Deno.test("decode - lb instruction 4", () =>
    decode_test("11111111111100011000000110000011", "lb x3, -1(x3)"),
);

Deno.test("decode - lb instruction 5", () =>
    decode_test("01111111111100100000001000000011", "lb x4, 2047(x4)"),
);

Deno.test("decode - lb instruction 6", () =>
    decode_test("10000000000000101000001010000011", "lb x5, -2048(x5)"),
);

Deno.test("decode - lb instruction 7", () =>
    decode_test("00000000000000111000001100000011", "lb x6, 0(x7)"),
);

Deno.test("decode - lb instruction 8", () =>
    decode_test("00000000000011110000111110000011", "lb x31, 0(x30)"),
);

Deno.test("decode - lb instruction 9", () =>
    decode_test("01000000000010000000011110000011", "lb x15, 1024(x16)"),
);

Deno.test("decode - lb instruction 10", () =>
    decode_test("11000000000010101000101000000011", "lb x20, -1024(x21)"),
);

Deno.test("decode - lb instruction 11", () =>
    decode_test("00000000000000000000010100000011", "lb x10, 0(x0)"),
);

Deno.test("decode - lb instruction 12", () =>
    decode_test("00000010101001001000010000000011", "lb x8, 42(x9)"),
);
