import { decode_test } from "../../common.mjs";

Deno.test("decode - and instruction 1", () =>
    decode_test("00000000000000000111000000110011", "and x0, x0, x0"),
);

Deno.test("decode - and instruction 2", () =>
    decode_test("00000000001000001111000010110011", "and x1, x1, x2"),
);

Deno.test("decode - and instruction 3", () =>
    decode_test("00000000001100010111000100110011", "and x2, x2, x3"),
);

Deno.test("decode - and instruction 4", () =>
    decode_test("00000000010000011111000110110011", "and x3, x3, x4"),
);

Deno.test("decode - and instruction 5", () =>
    decode_test("00000000010100100111001000110011", "and x4, x4, x5"),
);

Deno.test("decode - and instruction 6", () =>
    decode_test("00000000011000101111001010110011", "and x5, x5, x6"),
);

Deno.test("decode - and instruction 7", () =>
    decode_test("00000000011100110111001100110011", "and x6, x6, x7"),
);

Deno.test("decode - and instruction 8", () =>
    decode_test("00000000100000111111001110110011", "and x7, x7, x8"),
);

Deno.test("decode - and instruction 9", () =>
    decode_test("00000000100101000111010000110011", "and x8, x8, x9"),
);

Deno.test("decode - and instruction 10", () =>
    decode_test("00000000101001001111010010110011", "and x9, x9, x10"),
);

Deno.test("decode - and instruction 11", () =>
    decode_test("00000000101101010111010100110011", "and x10, x10, x11"),
);

Deno.test("decode - and instruction 12", () =>
    decode_test("00000000110001011111010110110011", "and x11, x11, x12"),
);

Deno.test("decode - and instruction 13", () =>
    decode_test("00000000110101100111011000110011", "and x12, x12, x13"),
);

Deno.test("decode - and instruction 14", () =>
    decode_test("00000000111001101111011010110011", "and x13, x13, x14"),
);

Deno.test("decode - and instruction 15", () =>
    decode_test("00000000111101110111011100110011", "and x14, x14, x15"),
);

Deno.test("decode - and instruction 16", () =>
    decode_test("00000001000001111111011110110011", "and x15, x15, x16"),
);

Deno.test("decode - and instruction 17", () =>
    decode_test("00000001000110000111100000110011", "and x16, x16, x17"),
);

Deno.test("decode - and instruction 18", () =>
    decode_test("00000001001010001111100010110011", "and x17, x17, x18"),
);

Deno.test("decode - and instruction 19", () =>
    decode_test("00000001001110010111100100110011", "and x18, x18, x19"),
);

Deno.test("decode - and instruction 20", () =>
    decode_test("00000001010010011111100110110011", "and x19, x19, x20"),
);

Deno.test("decode - and instruction 21", () =>
    decode_test("00000001010110100111101000110011", "and x20, x20, x21"),
);

Deno.test("decode - and instruction 22", () =>
    decode_test("00000001011010101111101010110011", "and x21, x21, x22"),
);

Deno.test("decode - and instruction 23", () =>
    decode_test("00000001011110110111101100110011", "and x22, x22, x23"),
);

Deno.test("decode - and instruction 24", () =>
    decode_test("00000001100010111111101110110011", "and x23, x23, x24"),
);

Deno.test("decode - and instruction 25", () =>
    decode_test("00000001100111000111110000110011", "and x24, x24, x25"),
);

Deno.test("decode - and instruction 26", () =>
    decode_test("00000001101011001111110010110011", "and x25, x25, x26"),
);

Deno.test("decode - and instruction 27", () =>
    decode_test("00000001101111010111110100110011", "and x26, x26, x27"),
);

Deno.test("decode - and instruction 28", () =>
    decode_test("00000001110011011111110110110011", "and x27, x27, x28"),
);

Deno.test("decode - and instruction 29", () =>
    decode_test("00000001110111100111111000110011", "and x28, x28, x29"),
);

Deno.test("decode - and instruction 30", () =>
    decode_test("00000001111011101111111010110011", "and x29, x29, x30"),
);

Deno.test("decode - and instruction 31", () =>
    decode_test("00000001111111110111111100110011", "and x30, x30, x31"),
);

Deno.test("decode - and instruction 32", () =>
    decode_test("00000000000111111111111110110011", "and x31, x31, x1"),
);
