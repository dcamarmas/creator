import { decode_test } from "../../common.mjs";

Deno.test("decode - lh instruction 1", () =>
    decode_test("00000000000000000001000000000011", "lh x0, 0(x0)"),
);

Deno.test("decode - lh instruction 2", () =>
    decode_test("00000000000000001001000010000011", "lh x1, 0(x1)"),
);

Deno.test("decode - lh instruction 3", () =>
    decode_test("00000000000100010001000100000011", "lh x2, 1(x2)"),
);

Deno.test("decode - lh instruction 4", () =>
    decode_test("11111111111100011001000110000011", "lh x3, -1(x3)"),
);

Deno.test("decode - lh instruction 5", () =>
    decode_test("01111111111100100001001000000011", "lh x4, 2047(x4)"),
);

Deno.test("decode - lh instruction 6", () =>
    decode_test("10000000000000101001001010000011", "lh x5, -2048(x5)"),
);

Deno.test("decode - lh instruction 7", () =>
    decode_test("00000000000000111001001100000011", "lh x6, 0(x7)"),
);

Deno.test("decode - lh instruction 8", () =>
    decode_test("00000000000011110001111110000011", "lh x31, 0(x30)"),
);

Deno.test("decode - lh instruction 9", () =>
    decode_test("01000000000010000001011110000011", "lh x15, 1024(x16)"),
);

Deno.test("decode - lh instruction 10", () =>
    decode_test("11000000000010101001101000000011", "lh x20, -1024(x21)"),
);

Deno.test("decode - lh instruction 11", () =>
    decode_test("00000000000000000001010100000011", "lh x10, 0(x0)"),
);

Deno.test("decode - lh instruction 12", () =>
    decode_test("00000010101001001001010000000011", "lh x8, 42(x9)"),
);
