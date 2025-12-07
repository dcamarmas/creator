import { decode_test } from "../../common.mjs";

Deno.test("decode - ori instruction 1", () =>
    decode_test("00000000000000000110000000010011", "ori x0, x0, 0"),
);

Deno.test("decode - ori instruction 2", () =>
    decode_test("00000000000100001110000010010011", "ori x1, x1, 1"),
);

Deno.test("decode - ori instruction 3", () =>
    decode_test("11111111111100010110000100010011", "ori x2, x2, -1"),
);

Deno.test("decode - ori instruction 4", () =>
    decode_test("01111111111100011110000110010011", "ori x3, x3, 2047"),
);

Deno.test("decode - ori instruction 5", () =>
    decode_test("10000000000000100110001000010011", "ori x4, x4, -2048"),
);

Deno.test("decode - ori instruction 6", () =>
    decode_test("01000000000000101110001010010011", "ori x5, x5, 1024"),
);

Deno.test("decode - ori instruction 7", () =>
    decode_test("11000000000000110110001100010011", "ori x6, x6, -1024"),
);

Deno.test("decode - ori instruction 8", () =>
    decode_test("00000010101000111110001110010011", "ori x7, x7, 42"),
);

Deno.test("decode - ori instruction 9", () =>
    decode_test("11111101011001000110010000010011", "ori x8, x8, -42"),
);

Deno.test("decode - ori instruction 10", () =>
    decode_test("00000110010001001110010010010011", "ori x9, x9, 100"),
);

Deno.test("decode - ori instruction 11", () =>
    decode_test("11111001110001010110010100010011", "ori x10, x10, -100"),
);

Deno.test("decode - ori instruction 12", () =>
    decode_test("00011111010001011110010110010011", "ori x11, x11, 500"),
);

Deno.test("decode - ori instruction 13", () =>
    decode_test("11100000110001100110011000010011", "ori x12, x12, -500"),
);

Deno.test("decode - ori instruction 14", () =>
    decode_test("01011101110001101110011010010011", "ori x13, x13, 1500"),
);

Deno.test("decode - ori instruction 15", () =>
    decode_test("10100010010001110110011100010011", "ori x14, x14, -1500"),
);

Deno.test("decode - ori instruction 16", () =>
    decode_test("01111101000001111110011110010011", "ori x15, x15, 2000"),
);

Deno.test("decode - ori instruction 17", () =>
    decode_test("10000011000010000110100000010011", "ori x16, x16, -2000"),
);

Deno.test("decode - ori instruction 18", () =>
    decode_test("00000000000110001110100010010011", "ori x17, x17, 1"),
);

Deno.test("decode - ori instruction 19", () =>
    decode_test("01111111111110010110100100010011", "ori x18, x18, 2047"),
);

Deno.test("decode - ori instruction 20", () =>
    decode_test("10000000000010011110100110010011", "ori x19, x19, -2048"),
);

Deno.test("decode - ori instruction 21", () =>
    decode_test("00111111111110100110101000010011", "ori x20, x20, 1023"),
);

Deno.test("decode - ori instruction 22", () =>
    decode_test("11000000000110101110101010010011", "ori x21, x21, -1023"),
);

Deno.test("decode - ori instruction 23", () =>
    decode_test("01000000000010110110101100010011", "ori x22, x22, 1024"),
);

Deno.test("decode - ori instruction 24", () =>
    decode_test("11000000000010111110101110010011", "ori x23, x23, -1024"),
);

Deno.test("decode - ori instruction 25", () =>
    decode_test("00100000000011000110110000010011", "ori x24, x24, 512"),
);

Deno.test("decode - ori instruction 26", () =>
    decode_test("11100000000011001110110010010011", "ori x25, x25, -512"),
);

Deno.test("decode - ori instruction 27", () =>
    decode_test("00010000000011010110110100010011", "ori x26, x26, 256"),
);

Deno.test("decode - ori instruction 28", () =>
    decode_test("11110000000011011110110110010011", "ori x27, x27, -256"),
);

Deno.test("decode - ori instruction 29", () =>
    decode_test("01111111111011100110111000010011", "ori x28, x28, 2046"),
);

Deno.test("decode - ori instruction 30", () =>
    decode_test("10000000000111101110111010010011", "ori x29, x29, -2047"),
);

Deno.test("decode - ori instruction 31", () =>
    decode_test("00000000000111110110111100010011", "ori x30, x30, 1"),
);

Deno.test("decode - ori instruction 32", () =>
    decode_test("11111111111111111110111110010011", "ori x31, x31, -1"),
);
