import { decode_test } from "../../common.mjs";

Deno.test("decode - sltiu instruction 1", () =>
    decode_test("00000000000000000011000000010011", "sltiu x0, x0, 0"),
);

Deno.test("decode - sltiu instruction 2", () =>
    decode_test("11111111111100010011000100010011", "sltiu x2, x2, -1"),
);

Deno.test("decode - sltiu instruction 3", () =>
    decode_test("01111111111100011011000110010011", "sltiu x3, x3, 2047"),
);

Deno.test("decode - sltiu instruction 4", () =>
    decode_test("10000000000000100011001000010011", "sltiu x4, x4, -2048"),
);

Deno.test("decode - sltiu instruction 5", () =>
    decode_test("01000000000000101011001010010011", "sltiu x5, x5, 1024"),
);

Deno.test("decode - sltiu instruction 6", () =>
    decode_test("11000000000000110011001100010011", "sltiu x6, x6, -1024"),
);

Deno.test("decode - sltiu instruction 7", () =>
    decode_test("00000010101000111011001110010011", "sltiu x7, x7, 42"),
);

Deno.test("decode - sltiu instruction 8", () =>
    decode_test("11111101011001000011010000010011", "sltiu x8, x8, -42"),
);

Deno.test("decode - sltiu instruction 9", () =>
    decode_test("00000110010001001011010010010011", "sltiu x9, x9, 100"),
);

Deno.test("decode - sltiu instruction 10", () =>
    decode_test("11111001110001010011010100010011", "sltiu x10, x10, -100"),
);

Deno.test("decode - sltiu instruction 11", () =>
    decode_test("00011111010001011011010110010011", "sltiu x11, x11, 500"),
);

Deno.test("decode - sltiu instruction 12", () =>
    decode_test("11100000110001100011011000010011", "sltiu x12, x12, -500"),
);

Deno.test("decode - sltiu instruction 13", () =>
    decode_test("01011101110001101011011010010011", "sltiu x13, x13, 1500"),
);

Deno.test("decode - sltiu instruction 14", () =>
    decode_test("10100010010001110011011100010011", "sltiu x14, x14, -1500"),
);

Deno.test("decode - sltiu instruction 15", () =>
    decode_test("01111101000001111011011110010011", "sltiu x15, x15, 2000"),
);

Deno.test("decode - sltiu instruction 16", () =>
    decode_test("10000011000010000011100000010011", "sltiu x16, x16, -2000"),
);

Deno.test("decode - sltiu instruction 17", () =>
    decode_test("01111111111110010011100100010011", "sltiu x18, x18, 2047"),
);

Deno.test("decode - sltiu instruction 18", () =>
    decode_test("10000000000010011011100110010011", "sltiu x19, x19, -2048"),
);

Deno.test("decode - sltiu instruction 19", () =>
    decode_test("00111111111110100011101000010011", "sltiu x20, x20, 1023"),
);

Deno.test("decode - sltiu instruction 20", () =>
    decode_test("11000000000110101011101010010011", "sltiu x21, x21, -1023"),
);

Deno.test("decode - sltiu instruction 21", () =>
    decode_test("01000000000010110011101100010011", "sltiu x22, x22, 1024"),
);

Deno.test("decode - sltiu instruction 22", () =>
    decode_test("11000000000010111011101110010011", "sltiu x23, x23, -1024"),
);

Deno.test("decode - sltiu instruction 23", () =>
    decode_test("00100000000011000011110000010011", "sltiu x24, x24, 512"),
);

Deno.test("decode - sltiu instruction 24", () =>
    decode_test("11100000000011001011110010010011", "sltiu x25, x25, -512"),
);

Deno.test("decode - sltiu instruction 25", () =>
    decode_test("00010000000011010011110100010011", "sltiu x26, x26, 256"),
);

Deno.test("decode - sltiu instruction 26", () =>
    decode_test("11110000000011011011110110010011", "sltiu x27, x27, -256"),
);

Deno.test("decode - sltiu instruction 27", () =>
    decode_test("01111111111011100011111000010011", "sltiu x28, x28, 2046"),
);

Deno.test("decode - sltiu instruction 28", () =>
    decode_test("10000000000111101011111010010011", "sltiu x29, x29, -2047"),
);

Deno.test("decode - sltiu instruction 29", () =>
    decode_test("11111111111111111011111110010011", "sltiu x31, x31, -1"),
);
