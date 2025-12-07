import { decode_test } from "../../common.mjs";

Deno.test("decode - andi instruction 1", () =>
    decode_test("00000000000000000111000000010011", "andi x0, x0, 0"),
);

Deno.test("decode - andi instruction 2", () =>
    decode_test("00000000000100001111000010010011", "andi x1, x1, 1"),
);

Deno.test("decode - andi instruction 3", () =>
    decode_test("11111111111100010111000100010011", "andi x2, x2, -1"),
);

Deno.test("decode - andi instruction 4", () =>
    decode_test("01111111111100011111000110010011", "andi x3, x3, 2047"),
);

Deno.test("decode - andi instruction 5", () =>
    decode_test("10000000000000100111001000010011", "andi x4, x4, -2048"),
);

Deno.test("decode - andi instruction 6", () =>
    decode_test("01000000000000101111001010010011", "andi x5, x5, 1024"),
);

Deno.test("decode - andi instruction 7", () =>
    decode_test("11000000000000110111001100010011", "andi x6, x6, -1024"),
);

Deno.test("decode - andi instruction 8", () =>
    decode_test("00000010101000111111001110010011", "andi x7, x7, 42"),
);

Deno.test("decode - andi instruction 9", () =>
    decode_test("11111101011001000111010000010011", "andi x8, x8, -42"),
);

Deno.test("decode - andi instruction 10", () =>
    decode_test("00000110010001001111010010010011", "andi x9, x9, 100"),
);

Deno.test("decode - andi instruction 11", () =>
    decode_test("11111001110001010111010100010011", "andi x10, x10, -100"),
);

Deno.test("decode - andi instruction 12", () =>
    decode_test("00011111010001011111010110010011", "andi x11, x11, 500"),
);

Deno.test("decode - andi instruction 13", () =>
    decode_test("11100000110001100111011000010011", "andi x12, x12, -500"),
);

Deno.test("decode - andi instruction 14", () =>
    decode_test("01011101110001101111011010010011", "andi x13, x13, 1500"),
);

Deno.test("decode - andi instruction 15", () =>
    decode_test("10100010010001110111011100010011", "andi x14, x14, -1500"),
);

Deno.test("decode - andi instruction 16", () =>
    decode_test("01111101000001111111011110010011", "andi x15, x15, 2000"),
);

Deno.test("decode - andi instruction 17", () =>
    decode_test("10000011000010000111100000010011", "andi x16, x16, -2000"),
);

Deno.test("decode - andi instruction 18", () =>
    decode_test("00000000000110001111100010010011", "andi x17, x17, 1"),
);

Deno.test("decode - andi instruction 19", () =>
    decode_test("01111111111110010111100100010011", "andi x18, x18, 2047"),
);

Deno.test("decode - andi instruction 20", () =>
    decode_test("10000000000010011111100110010011", "andi x19, x19, -2048"),
);

Deno.test("decode - andi instruction 21", () =>
    decode_test("00111111111110100111101000010011", "andi x20, x20, 1023"),
);

Deno.test("decode - andi instruction 22", () =>
    decode_test("11000000000110101111101010010011", "andi x21, x21, -1023"),
);

Deno.test("decode - andi instruction 23", () =>
    decode_test("01000000000010110111101100010011", "andi x22, x22, 1024"),
);

Deno.test("decode - andi instruction 24", () =>
    decode_test("11000000000010111111101110010011", "andi x23, x23, -1024"),
);

Deno.test("decode - andi instruction 25", () =>
    decode_test("00100000000011000111110000010011", "andi x24, x24, 512"),
);

Deno.test("decode - andi instruction 26", () =>
    decode_test("11100000000011001111110010010011", "andi x25, x25, -512"),
);

Deno.test("decode - andi instruction 27", () =>
    decode_test("00010000000011010111110100010011", "andi x26, x26, 256"),
);

Deno.test("decode - andi instruction 28", () =>
    decode_test("11110000000011011111110110010011", "andi x27, x27, -256"),
);

Deno.test("decode - andi instruction 29", () =>
    decode_test("01111111111011100111111000010011", "andi x28, x28, 2046"),
);

Deno.test("decode - andi instruction 30", () =>
    decode_test("10000000000111101111111010010011", "andi x29, x29, -2047"),
);

Deno.test("decode - andi instruction 31", () =>
    decode_test("00000000000111110111111100010011", "andi x30, x30, 1"),
);

Deno.test("decode - andi instruction 32", () =>
    decode_test("11111111111111111111111110010011", "andi x31, x31, -1"),
);
