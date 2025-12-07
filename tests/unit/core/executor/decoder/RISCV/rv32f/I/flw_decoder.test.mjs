import { decode_test } from "../../common.mjs";
Deno.test("decode - FLW instruction 1", () =>
    decode_test("00000000000000000010000000000111", "flw f0, 0(x0)"),
);

Deno.test("decode - FLW instruction 2", () =>
    decode_test("00000000000000001010000010000111", "flw f1, 0(x1)"),
);

Deno.test("decode - FLW instruction 3", () =>
    decode_test("01111111111100010010000100000111", "flw f2, 2047(x2)"),
);

Deno.test("decode - FLW instruction 4", () =>
    decode_test("10000000000000011010000110000111", "flw f3, -2048(x3)"),
);

Deno.test("decode - FLW instruction 5", () =>
    decode_test("00000000010000100010001000000111", "flw f4, 4(x4)"),
);

Deno.test("decode - FLW instruction 6", () =>
    decode_test("00000000000100101010001010000111", "flw f5, 1(x5)"),
);

Deno.test("decode - FLW instruction 7", () =>
    decode_test("00010010001101010010001100000111", "flw f6, 291(x10)"),
);

Deno.test("decode - FLW instruction 8", () =>
    decode_test("11111111111101111010001110000111", "flw f7, -1(x15)"),
);

Deno.test("decode - FLW instruction 9", () =>
    decode_test("01010101010110100010010000000111", "flw f8, 1365(x20)"),
);

Deno.test("decode - FLW instruction 10", () =>
    decode_test("00000000000111111010111110000111", "flw f31, 1(x31)"),
);
