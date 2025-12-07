import { decode_test } from "../../common.mjs";

Deno.test("decode - JALR instruction 1", () =>
    decode_test("00000000000000000000000011100111", "jalr x1, 0(x0)"),
);

Deno.test("decode - JALR instruction 2", () =>
    decode_test("00000000000000000000000101100111", "jalr x2, 0(x0)"),
);

Deno.test("decode - JALR instruction 3", () =>
    decode_test("00000000000000000000000111100111", "jalr x3, 0(x0)"),
);

Deno.test("decode - JALR instruction 4", () =>
    decode_test("00000000000000000000001001100111", "jalr x4, 0(x0)"),
);

Deno.test("decode - JALR instruction 5", () =>
    decode_test("00000000000000000000001011100111", "jalr x5, 0(x0)"),
);

Deno.test("decode - JALR instruction 6", () =>
    decode_test("00000000000000000000001101100111", "jalr x6, 0(x0)"),
);

Deno.test("decode - JALR instruction 7", () =>
    decode_test("00000000000000000000001111100111", "jalr x7, 0(x0)"),
);

Deno.test("decode - JALR instruction 8", () =>
    decode_test("00000000000000000000010001100111", "jalr x8, 0(x0)"),
);

Deno.test("decode - JALR instruction 9", () =>
    decode_test("00000000000000000000010011100111", "jalr x9, 0(x0)"),
);

Deno.test("decode - JALR instruction 10", () =>
    decode_test("00000000000000000000010101100111", "jalr x10, 0(x0)"),
);

Deno.test("decode - JALR instruction 11", () =>
    decode_test("00000000000000000000010111100111", "jalr x11, 0(x0)"),
);

Deno.test("decode - JALR instruction 12", () =>
    decode_test("00000000000000000000011001100111", "jalr x12, 0(x0)"),
);

Deno.test("decode - JALR instruction 13", () =>
    decode_test("00000000000000000000011011100111", "jalr x13, 0(x0)"),
);

Deno.test("decode - JALR instruction 14", () =>
    decode_test("00000000000000000000011101100111", "jalr x14, 0(x0)"),
);

Deno.test("decode - JALR instruction 15", () =>
    decode_test("00000000000000000000011111100111", "jalr x15, 0(x0)"),
);

Deno.test("decode - JALR instruction 16", () =>
    decode_test("00000000000000000000100001100111", "jalr x16, 0(x0)"),
);

Deno.test("decode - JALR instruction 17", () =>
    decode_test("00000000000000000000100011100111", "jalr x17, 0(x0)"),
);

Deno.test("decode - JALR instruction 18", () =>
    decode_test("00000000000000000000100101100111", "jalr x18, 0(x0)"),
);

Deno.test("decode - JALR instruction 19", () =>
    decode_test("00000000000000000000100111100111", "jalr x19, 0(x0)"),
);

Deno.test("decode - JALR instruction 20", () =>
    decode_test("00000000000000000000101001100111", "jalr x20, 0(x0)"),
);

Deno.test("decode - JALR instruction 21", () =>
    decode_test("00000000000000000000101011100111", "jalr x21, 0(x0)"),
);

Deno.test("decode - JALR instruction 22", () =>
    decode_test("00000000000000000000101101100111", "jalr x22, 0(x0)"),
);

Deno.test("decode - JALR instruction 23", () =>
    decode_test("00000000000000000000101111100111", "jalr x23, 0(x0)"),
);

Deno.test("decode - JALR instruction 24", () =>
    decode_test("00000000000000000000110001100111", "jalr x24, 0(x0)"),
);

Deno.test("decode - JALR instruction 25", () =>
    decode_test("00000000000000000000110011100111", "jalr x25, 0(x0)"),
);

Deno.test("decode - JALR instruction 26", () =>
    decode_test("00000000000000000000110101100111", "jalr x26, 0(x0)"),
);

Deno.test("decode - JALR instruction 27", () =>
    decode_test("00000000000000000000110111100111", "jalr x27, 0(x0)"),
);

Deno.test("decode - JALR instruction 28", () =>
    decode_test("00000000000000000000111001100111", "jalr x28, 0(x0)"),
);

Deno.test("decode - JALR instruction 29", () =>
    decode_test("00000000000000000000111011100111", "jalr x29, 0(x0)"),
);

Deno.test("decode - JALR instruction 30", () =>
    decode_test("00000000000000000000111101100111", "jalr x30, 0(x0)"),
);

Deno.test("decode - JALR instruction 31", () =>
    decode_test("00000000000000000000111111100111", "jalr x31, 0(x0)"),
);

Deno.test("decode - JALR instruction 32", () =>
    decode_test("00000000000000001000000001100111", "jalr x0, 0(x1)"),
);

Deno.test("decode - JALR instruction 33", () =>
    decode_test("00000000000000010000000001100111", "jalr x0, 0(x2)"),
);

Deno.test("decode - JALR instruction 34", () =>
    decode_test("00000000000000011000000001100111", "jalr x0, 0(x3)"),
);

Deno.test("decode - JALR instruction 35", () =>
    decode_test("00000000000000100000000001100111", "jalr x0, 0(x4)"),
);

Deno.test("decode - JALR instruction 36", () =>
    decode_test("00000000000000101000000001100111", "jalr x0, 0(x5)"),
);

Deno.test("decode - JALR instruction 37", () =>
    decode_test("00000000000000110000000001100111", "jalr x0, 0(x6)"),
);

Deno.test("decode - JALR instruction 38", () =>
    decode_test("00000000000000111000000001100111", "jalr x0, 0(x7)"),
);

Deno.test("decode - JALR instruction 39", () =>
    decode_test("00000000000001000000000001100111", "jalr x0, 0(x8)"),
);

Deno.test("decode - JALR instruction 40", () =>
    decode_test("00000000000001001000000001100111", "jalr x0, 0(x9)"),
);

Deno.test("decode - JALR instruction 41", () =>
    decode_test("00000000000001010000000001100111", "jalr x0, 0(x10)"),
);

Deno.test("decode - JALR instruction 42", () =>
    decode_test("00000000000001011000000001100111", "jalr x0, 0(x11)"),
);

Deno.test("decode - JALR instruction 43", () =>
    decode_test("00000000000001100000000001100111", "jalr x0, 0(x12)"),
);

Deno.test("decode - JALR instruction 44", () =>
    decode_test("00000000000001101000000001100111", "jalr x0, 0(x13)"),
);

Deno.test("decode - JALR instruction 45", () =>
    decode_test("00000000000001110000000001100111", "jalr x0, 0(x14)"),
);

Deno.test("decode - JALR instruction 46", () =>
    decode_test("00000000000001111000000001100111", "jalr x0, 0(x15)"),
);

Deno.test("decode - JALR instruction 47", () =>
    decode_test("00000000000010000000000001100111", "jalr x0, 0(x16)"),
);

Deno.test("decode - JALR instruction 48", () =>
    decode_test("00000000000010001000000001100111", "jalr x0, 0(x17)"),
);

Deno.test("decode - JALR instruction 49", () =>
    decode_test("00000000000010010000000001100111", "jalr x0, 0(x18)"),
);

Deno.test("decode - JALR instruction 50", () =>
    decode_test("00000000000010011000000001100111", "jalr x0, 0(x19)"),
);

Deno.test("decode - JALR instruction 51", () =>
    decode_test("00000000000010100000000001100111", "jalr x0, 0(x20)"),
);

Deno.test("decode - JALR instruction 52", () =>
    decode_test("00000000000010101000000001100111", "jalr x0, 0(x21)"),
);

Deno.test("decode - JALR instruction 53", () =>
    decode_test("00000000000010110000000001100111", "jalr x0, 0(x22)"),
);

Deno.test("decode - JALR instruction 54", () =>
    decode_test("00000000000010111000000001100111", "jalr x0, 0(x23)"),
);

Deno.test("decode - JALR instruction 55", () =>
    decode_test("00000000000011000000000001100111", "jalr x0, 0(x24)"),
);

Deno.test("decode - JALR instruction 56", () =>
    decode_test("00000000000011001000000001100111", "jalr x0, 0(x25)"),
);

Deno.test("decode - JALR instruction 57", () =>
    decode_test("00000000000011010000000001100111", "jalr x0, 0(x26)"),
);

Deno.test("decode - JALR instruction 58", () =>
    decode_test("00000000000011011000000001100111", "jalr x0, 0(x27)"),
);

Deno.test("decode - JALR instruction 59", () =>
    decode_test("00000000000011100000000001100111", "jalr x0, 0(x28)"),
);

Deno.test("decode - JALR instruction 60", () =>
    decode_test("00000000000011101000000001100111", "jalr x0, 0(x29)"),
);

Deno.test("decode - JALR instruction 61", () =>
    decode_test("00000000000011110000000001100111", "jalr x0, 0(x30)"),
);

Deno.test("decode - JALR instruction 62", () =>
    decode_test("00000000000011111000000001100111", "jalr x0, 0(x31)"),
);

Deno.test("decode - JALR instruction 63", () =>
    decode_test("00000000000000000000000001100111", "jalr x0, 0(x0)"),
);

Deno.test("decode - JALR instruction 64", () =>
    decode_test("00000000000000001000000011100111", "jalr x1, 0(x1)"),
);

Deno.test("decode - JALR instruction 65", () =>
    decode_test("00000000010000010000000101100111", "jalr x2, 4(x2)"),
);

Deno.test("decode - JALR instruction 66", () =>
    decode_test("11111111110000011000000111100111", "jalr x3, -4(x3)"),
);

Deno.test("decode - JALR instruction 67", () =>
    decode_test("01111111111100100000001001100111", "jalr x4, 2047(x4)"),
);

Deno.test("decode - JALR instruction 68", () =>
    decode_test("10000000000000101000001011100111", "jalr x5, -2048(x5)"),
);

Deno.test("decode - JALR instruction 69", () =>
    decode_test("00000000000000111000001101100111", "jalr x6, 0(x7)"),
);

Deno.test("decode - JALR instruction 70", () =>
    decode_test("00000000000011110000111111100111", "jalr x31, 0(x30)"),
);

Deno.test("decode - JALR instruction 71", () =>
    decode_test("01000000000010000000011111100111", "jalr x15, 1024(x16)"),
);

Deno.test("decode - JALR instruction 72", () =>
    decode_test("11000000000010101000101001100111", "jalr x20, -1024(x21)"),
);

Deno.test("decode - JALR instruction 73", () =>
    decode_test("00000000000000000000000011100111", "jalr x1, 0(x0)"),
);

Deno.test("decode - JALR instruction 74", () =>
    decode_test("00000010101001001000010101100111", "jalr x10, 42(x9)"),
);

Deno.test("decode - JALR instruction 75", () =>
    decode_test("00000000000000001000000001100111", "jalr x0, 0(x1)"),
);

Deno.test("decode - JALR instruction 76", () =>
    decode_test("00000000000000101000000011100111", "jalr x1, 0(x5)"),
);
