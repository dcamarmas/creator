import { decode_test } from "../../common.mjs";
Deno.test("decode - fld instruction 1", () =>
    decode_test("00000000000000000011000000000111", "fld f0, 0(x0)"),
);

Deno.test("decode - fld instruction 2", () =>
    decode_test("00000000000000001011000010000111", "fld f1, 0(x1)"),
);

Deno.test("decode - fld instruction 3", () =>
    decode_test("01111111111100010011000100000111", "fld f2, 2047(x2)"),
);

Deno.test("decode - fld instruction 4", () =>
    decode_test("10000000000000011011000110000111", "fld f3, -2048(x3)"),
);

Deno.test("decode - fld instruction 5", () =>
    decode_test("00000000010000100011001000000111", "fld f4, 4(x4)"),
);

Deno.test("decode - fld instruction 6", () =>
    decode_test("00000000000100101011001010000111", "fld f5, 1(x5)"),
);

Deno.test("decode - fld instruction 7", () =>
    decode_test("00010010001101010011001100000111", "fld f6, 291(x10)"),
);

Deno.test("decode - fld instruction 8", () =>
    decode_test("11111111111101111011001110000111", "fld f7, -1(x15)"),
);

Deno.test("decode - fld instruction 9", () =>
    decode_test("01010101010110100011010000000111", "fld f8, 1365(x20)"),
);

Deno.test("decode - fld instruction 10", () =>
    decode_test("00000000000111111011111110000111", "fld f31, 1(x31)"),
);
