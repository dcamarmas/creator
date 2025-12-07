import { decode_test } from "../../common.mjs";

Deno.test("decode - addi instruction 1", () =>
    decode_test("00000000000000000000000000010011", "addi x0, x0, 0"),
);

Deno.test("decode - addi instruction 2", () =>
    decode_test("00000000000100001000000010010011", "addi x1, x1, 1"),
);

Deno.test("decode - addi instruction 3", () =>
    decode_test("11111111111100010000000100010011", "addi x2, x2, -1"),
);

Deno.test("decode - addi instruction 4", () =>
    decode_test("01111111111100011000000110010011", "addi x3, x3, 2047"),
);

Deno.test("decode - addi instruction 5", () =>
    decode_test("10000000000000100000001000010011", "addi x4, x4, -2048"),
);

Deno.test("decode - addi instruction 6", () =>
    decode_test("01000000000000101000001010010011", "addi x5, x5, 1024"),
);

Deno.test("decode - addi instruction 7", () =>
    decode_test("11000000000000110000001100010011", "addi x6, x6, -1024"),
);

Deno.test("decode - addi instruction 8", () =>
    decode_test("00000010101000111000001110010011", "addi x7, x7, 42"),
);

Deno.test("decode - addi instruction 9", () =>
    decode_test("11111101011001000000010000010011", "addi x8, x8, -42"),
);

Deno.test("decode - addi instruction 10", () =>
    decode_test("00000110010001001000010010010011", "addi x9, x9, 100"),
);

Deno.test("decode - addi instruction 11", () =>
    decode_test("11111001110001010000010100010011", "addi x10, x10, -100"),
);

Deno.test("decode - addi instruction 12", () =>
    decode_test("00011111010001011000010110010011", "addi x11, x11, 500"),
);

Deno.test("decode - addi instruction 13", () =>
    decode_test("11100000110001100000011000010011", "addi x12, x12, -500"),
);

Deno.test("decode - addi instruction 14", () =>
    decode_test("01011101110001101000011010010011", "addi x13, x13, 1500"),
);

Deno.test("decode - addi instruction 15", () =>
    decode_test("10100010010001110000011100010011", "addi x14, x14, -1500"),
);

Deno.test("decode - addi instruction 16", () =>
    decode_test("01111101000001111000011110010011", "addi x15, x15, 2000"),
);

Deno.test("decode - addi instruction 17", () =>
    decode_test("10000011000010000000100000010011", "addi x16, x16, -2000"),
);

Deno.test("decode - addi instruction 18", () =>
    decode_test("00000000000110001000100010010011", "addi x17, x17, 1"),
);

Deno.test("decode - addi instruction 19", () =>
    decode_test("01111111111110010000100100010011", "addi x18, x18, 2047"),
);

Deno.test("decode - addi instruction 20", () =>
    decode_test("10000000000010011000100110010011", "addi x19, x19, -2048"),
);

Deno.test("decode - addi instruction 21", () =>
    decode_test("00111111111110100000101000010011", "addi x20, x20, 1023"),
);

Deno.test("decode - addi instruction 22", () =>
    decode_test("11000000000110101000101010010011", "addi x21, x21, -1023"),
);

Deno.test("decode - addi instruction 23", () =>
    decode_test("01000000000010110000101100010011", "addi x22, x22, 1024"),
);

Deno.test("decode - addi instruction 24", () =>
    decode_test("11000000000010111000101110010011", "addi x23, x23, -1024"),
);

Deno.test("decode - addi instruction 25", () =>
    decode_test("00100000000011000000110000010011", "addi x24, x24, 512"),
);

Deno.test("decode - addi instruction 26", () =>
    decode_test("11100000000011001000110010010011", "addi x25, x25, -512"),
);

Deno.test("decode - addi instruction 27", () =>
    decode_test("00010000000011010000110100010011", "addi x26, x26, 256"),
);

Deno.test("decode - addi instruction 28", () =>
    decode_test("11110000000011011000110110010011", "addi x27, x27, -256"),
);

Deno.test("decode - addi instruction 29", () =>
    decode_test("01111111111011100000111000010011", "addi x28, x28, 2046"),
);

Deno.test("decode - addi instruction 30", () =>
    decode_test("10000000000111101000111010010011", "addi x29, x29, -2047"),
);

Deno.test("decode - addi instruction 31", () =>
    decode_test("00000000000111110000111100010011", "addi x30, x30, 1"),
);

Deno.test("decode - addi instruction 32", () =>
    decode_test("11111111111111111000111110010011", "addi x31, x31, -1"),
);
