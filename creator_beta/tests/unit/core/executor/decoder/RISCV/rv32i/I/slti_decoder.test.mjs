import { decode_test } from "../../common.mjs";

Deno.test("decode - slti instruction 1", () =>
    decode_test("00000000000000000010000000010011", "slti x0, x0, 0"),
);

Deno.test("decode - slti instruction 2", () =>
    decode_test("00000000000100001010000010010011", "slti x1, x1, 1"),
);

Deno.test("decode - slti instruction 3", () =>
    decode_test("11111111111100010010000100010011", "slti x2, x2, -1"),
);

Deno.test("decode - slti instruction 4", () =>
    decode_test("01111111111100011010000110010011", "slti x3, x3, 2047"),
);

Deno.test("decode - slti instruction 5", () =>
    decode_test("10000000000000100010001000010011", "slti x4, x4, -2048"),
);

Deno.test("decode - slti instruction 6", () =>
    decode_test("01000000000000101010001010010011", "slti x5, x5, 1024"),
);

Deno.test("decode - slti instruction 7", () =>
    decode_test("11000000000000110010001100010011", "slti x6, x6, -1024"),
);

Deno.test("decode - slti instruction 8", () =>
    decode_test("00000010101000111010001110010011", "slti x7, x7, 42"),
);

Deno.test("decode - slti instruction 9", () =>
    decode_test("11111101011001000010010000010011", "slti x8, x8, -42"),
);

Deno.test("decode - slti instruction 10", () =>
    decode_test("00000110010001001010010010010011", "slti x9, x9, 100"),
);

Deno.test("decode - slti instruction 11", () =>
    decode_test("11111001110001010010010100010011", "slti x10, x10, -100"),
);

Deno.test("decode - slti instruction 12", () =>
    decode_test("00011111010001011010010110010011", "slti x11, x11, 500"),
);

Deno.test("decode - slti instruction 13", () =>
    decode_test("11100000110001100010011000010011", "slti x12, x12, -500"),
);

Deno.test("decode - slti instruction 14", () =>
    decode_test("01011101110001101010011010010011", "slti x13, x13, 1500"),
);

Deno.test("decode - slti instruction 15", () =>
    decode_test("10100010010001110010011100010011", "slti x14, x14, -1500"),
);

Deno.test("decode - slti instruction 16", () =>
    decode_test("01111101000001111010011110010011", "slti x15, x15, 2000"),
);

Deno.test("decode - slti instruction 17", () =>
    decode_test("10000011000010000010100000010011", "slti x16, x16, -2000"),
);

Deno.test("decode - slti instruction 18", () =>
    decode_test("00000000000110001010100010010011", "slti x17, x17, 1"),
);

Deno.test("decode - slti instruction 19", () =>
    decode_test("01111111111110010010100100010011", "slti x18, x18, 2047"),
);

Deno.test("decode - slti instruction 20", () =>
    decode_test("10000000000010011010100110010011", "slti x19, x19, -2048"),
);

Deno.test("decode - slti instruction 21", () =>
    decode_test("00111111111110100010101000010011", "slti x20, x20, 1023"),
);

Deno.test("decode - slti instruction 22", () =>
    decode_test("11000000000110101010101010010011", "slti x21, x21, -1023"),
);

Deno.test("decode - slti instruction 23", () =>
    decode_test("01000000000010110010101100010011", "slti x22, x22, 1024"),
);

Deno.test("decode - slti instruction 24", () =>
    decode_test("11000000000010111010101110010011", "slti x23, x23, -1024"),
);

Deno.test("decode - slti instruction 25", () =>
    decode_test("00100000000011000010110000010011", "slti x24, x24, 512"),
);

Deno.test("decode - slti instruction 26", () =>
    decode_test("11100000000011001010110010010011", "slti x25, x25, -512"),
);

Deno.test("decode - slti instruction 27", () =>
    decode_test("00010000000011010010110100010011", "slti x26, x26, 256"),
);

Deno.test("decode - slti instruction 28", () =>
    decode_test("11110000000011011010110110010011", "slti x27, x27, -256"),
);

Deno.test("decode - slti instruction 29", () =>
    decode_test("01111111111011100010111000010011", "slti x28, x28, 2046"),
);

Deno.test("decode - slti instruction 30", () =>
    decode_test("10000000000111101010111010010011", "slti x29, x29, -2047"),
);

Deno.test("decode - slti instruction 31", () =>
    decode_test("00000000000111110010111100010011", "slti x30, x30, 1"),
);

Deno.test("decode - slti instruction 32", () =>
    decode_test("11111111111111111010111110010011", "slti x31, x31, -1"),
);
