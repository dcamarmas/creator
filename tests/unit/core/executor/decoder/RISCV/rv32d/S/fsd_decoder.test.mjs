import { decode_test } from "../../common.mjs";
Deno.test("decode - fsd instruction 1", () =>
    decode_test("00000000000000000011000000100111", "fsd f0, 0(x0)"),
);

Deno.test("decode - fsd instruction 2", () =>
    decode_test("00000000000100001011000000100111", "fsd f1, 0(x1)"),
);

Deno.test("decode - fsd instruction 3", () =>
    decode_test("00000001111111111011000000100111", "fsd f31, 0(x31)"),
);

Deno.test("decode - fsd instruction 4", () =>
    decode_test("01111110001000010011111110100111", "fsd f2, 2047(x2)"),
);

Deno.test("decode - fsd instruction 5", () =>
    decode_test("10000000001100011011000000100111", "fsd f3, -2048(x3)"),
);

Deno.test("decode - fsd instruction 6", () =>
    decode_test("00000000010000100011010000100111", "fsd f4, 8(x4)"),
);

Deno.test("decode - fsd instruction 7", () =>
    decode_test("00000000010100101011001000100111", "fsd f5, 4(x5)"),
);

Deno.test("decode - fsd instruction 8", () =>
    decode_test("00000000011000110011000100100111", "fsd f6, 2(x6)"),
);

Deno.test("decode - fsd instruction 9", () =>
    decode_test("00000000011100111011000010100111", "fsd f7, 1(x7)"),
);

Deno.test("decode - fsd instruction 10", () =>
    decode_test("00000000100010000011100000100111", "fsd f8, 16(x16)"),
);

Deno.test("decode - fsd instruction 11", () =>
    decode_test("00010010111110100011000110100111", "fsd f15, 291(x20)"),
);

Deno.test("decode - fsd instruction 12", () =>
    decode_test("11111101000011000011000000100111", "fsd f16, -64(x24)"),
);

Deno.test("decode - fsd instruction 13", () =>
    decode_test("01010101100001000011101010100111", "fsd f24, 1365(x8)"),
);

Deno.test("decode - fsd instruction 14", () =>
    decode_test("01111110000000000011111110100111", "fsd f0, 2047(x0)"),
);

Deno.test("decode - fsd instruction 15", () =>
    decode_test("10000001111100000011000000100111", "fsd f31, -2048(x0)"),
);

Deno.test("decode - fsd instruction 16", () =>
    decode_test("00000000000011111011000000100111", "fsd f0, 0(x31)"),
);

Deno.test("decode - fsd instruction 17", () =>
    decode_test("00000000000100001011000010100111", "fsd f1, 1(x1)"),
);

Deno.test("decode - fsd instruction 18", () =>
    decode_test("00000000001000010011000100100111", "fsd f2, 2(x2)"),
);

Deno.test("decode - fsd instruction 19", () =>
    decode_test("00000000010000100011001000100111", "fsd f4, 4(x4)"),
);

Deno.test("decode - fsd instruction 20", () =>
    decode_test("00000000100001000011010000100111", "fsd f8, 8(x8)"),
);

Deno.test("decode - fsd instruction 21", () =>
    decode_test("00000001000010000011100000100111", "fsd f16, 16(x16)"),
);

Deno.test("decode - fsd instruction 22", () =>
    decode_test("00000000101001011011000000100111", "fsd f10, 0(x11)"),
);

Deno.test("decode - fsd instruction 23", () =>
    decode_test("00000000101101100011001000100111", "fsd f11, 4(x12)"),
);

Deno.test("decode - fsd instruction 24", () =>
    decode_test("00000000110001101011010000100111", "fsd f12, 8(x13)"),
);

Deno.test("decode - fsd instruction 25", () =>
    decode_test("00000000110101110011011000100111", "fsd f13, 12(x14)"),
);

Deno.test("decode - fsd instruction 26", () =>
    decode_test("00010011010001010011000110100111", "fsd f20, 291(x10)"),
);

Deno.test("decode - fsd instruction 27", () =>
    decode_test("00111111010101011011111110100111", "fsd f21, 1023(x11)"),
);

Deno.test("decode - fsd instruction 28", () =>
    decode_test("11100001011001100011000000100111", "fsd f22, -512(x12)"),
);

Deno.test("decode - fsd instruction 29", () =>
    decode_test("11111111011101101011111110100111", "fsd f23, -1(x13)"),
);

Deno.test("decode - fsd instruction 30", () =>
    decode_test("00101011100101111011010100100111", "fsd f25, 682(x15)"),
);

Deno.test("decode - fsd instruction 31", () =>
    decode_test("00010101101010000011101010100111", "fsd f26, 341(x16)"),
);
