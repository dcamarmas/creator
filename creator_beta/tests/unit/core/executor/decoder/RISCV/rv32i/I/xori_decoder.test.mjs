import { decode_test } from "../../common.mjs";

Deno.test("decode - xori instruction 1", () =>
    decode_test("00000000000000000100000000010011", "xori x0, x0, 0"),
);

Deno.test("decode - xori instruction 2", () =>
    decode_test("00000000000100001100000010010011", "xori x1, x1, 1"),
);

Deno.test("decode - xori instruction 3", () =>
    decode_test("11111111111100010100000100010011", "xori x2, x2, -1"),
);

Deno.test("decode - xori instruction 4", () =>
    decode_test("01111111111100011100000110010011", "xori x3, x3, 2047"),
);

Deno.test("decode - xori instruction 5", () =>
    decode_test("10000000000000100100001000010011", "xori x4, x4, -2048"),
);

Deno.test("decode - xori instruction 6", () =>
    decode_test("01000000000000101100001010010011", "xori x5, x5, 1024"),
);

Deno.test("decode - xori instruction 7", () =>
    decode_test("11000000000000110100001100010011", "xori x6, x6, -1024"),
);

Deno.test("decode - xori instruction 8", () =>
    decode_test("00000010101000111100001110010011", "xori x7, x7, 42"),
);

Deno.test("decode - xori instruction 9", () =>
    decode_test("11111101011001000100010000010011", "xori x8, x8, -42"),
);

Deno.test("decode - xori instruction 10", () =>
    decode_test("00000110010001001100010010010011", "xori x9, x9, 100"),
);

Deno.test("decode - xori instruction 11", () =>
    decode_test("11111001110001010100010100010011", "xori x10, x10, -100"),
);

Deno.test("decode - xori instruction 12", () =>
    decode_test("00011111010001011100010110010011", "xori x11, x11, 500"),
);

Deno.test("decode - xori instruction 13", () =>
    decode_test("11100000110001100100011000010011", "xori x12, x12, -500"),
);

Deno.test("decode - xori instruction 14", () =>
    decode_test("01011101110001101100011010010011", "xori x13, x13, 1500"),
);

Deno.test("decode - xori instruction 15", () =>
    decode_test("10100010010001110100011100010011", "xori x14, x14, -1500"),
);

Deno.test("decode - xori instruction 16", () =>
    decode_test("01111101000001111100011110010011", "xori x15, x15, 2000"),
);

Deno.test("decode - xori instruction 17", () =>
    decode_test("10000011000010000100100000010011", "xori x16, x16, -2000"),
);

Deno.test("decode - xori instruction 18", () =>
    decode_test("00000000000110001100100010010011", "xori x17, x17, 1"),
);

Deno.test("decode - xori instruction 19", () =>
    decode_test("01111111111110010100100100010011", "xori x18, x18, 2047"),
);

Deno.test("decode - xori instruction 20", () =>
    decode_test("10000000000010011100100110010011", "xori x19, x19, -2048"),
);

Deno.test("decode - xori instruction 21", () =>
    decode_test("00111111111110100100101000010011", "xori x20, x20, 1023"),
);

Deno.test("decode - xori instruction 22", () =>
    decode_test("11000000000110101100101010010011", "xori x21, x21, -1023"),
);

Deno.test("decode - xori instruction 23", () =>
    decode_test("01000000000010110100101100010011", "xori x22, x22, 1024"),
);

Deno.test("decode - xori instruction 24", () =>
    decode_test("11000000000010111100101110010011", "xori x23, x23, -1024"),
);

Deno.test("decode - xori instruction 25", () =>
    decode_test("00100000000011000100110000010011", "xori x24, x24, 512"),
);

Deno.test("decode - xori instruction 26", () =>
    decode_test("11100000000011001100110010010011", "xori x25, x25, -512"),
);

Deno.test("decode - xori instruction 27", () =>
    decode_test("00010000000011010100110100010011", "xori x26, x26, 256"),
);

Deno.test("decode - xori instruction 28", () =>
    decode_test("11110000000011011100110110010011", "xori x27, x27, -256"),
);

Deno.test("decode - xori instruction 29", () =>
    decode_test("01111111111011100100111000010011", "xori x28, x28, 2046"),
);

Deno.test("decode - xori instruction 30", () =>
    decode_test("10000000000111101100111010010011", "xori x29, x29, -2047"),
);

Deno.test("decode - xori instruction 31", () =>
    decode_test("00000000000111110100111100010011", "xori x30, x30, 1"),
);

Deno.test("decode - xori instruction 32", () =>
    decode_test("11111111111111111100111110010011", "xori x31, x31, -1"),
);
