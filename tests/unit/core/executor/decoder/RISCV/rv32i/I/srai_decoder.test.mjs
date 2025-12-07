import { decode_test } from "../../common.mjs";

Deno.test("decode - srai instruction 1", () =>
    decode_test("01000000000000000101000000010011", "srai x0, x0, 0"),
);

Deno.test("decode - srai instruction 2", () =>
    decode_test("01000000000100001101000010010011", "srai x1, x1, 1"),
);

Deno.test("decode - srai instruction 3", () =>
    decode_test("01000000001000010101000100010011", "srai x2, x2, 2"),
);

Deno.test("decode - srai instruction 4", () =>
    decode_test("01000001111100011101000110010011", "srai x3, x3, 31"),
);

Deno.test("decode - srai instruction 5", () =>
    decode_test("01000001111000100101001000010011", "srai x4, x4, 30"),
);

Deno.test("decode - srai instruction 6", () =>
    decode_test("01000000101000101101001010010011", "srai x5, x5, 10"),
);

Deno.test("decode - srai instruction 7", () =>
    decode_test("01000000111100110101001100010011", "srai x6, x6, 15"),
);

Deno.test("decode - srai instruction 8", () =>
    decode_test("01000000010100111101001110010011", "srai x7, x7, 5"),
);

Deno.test("decode - srai instruction 9", () =>
    decode_test("01000000011101000101010000010011", "srai x8, x8, 7"),
);

Deno.test("decode - srai instruction 10", () =>
    decode_test("01000000100001001101010010010011", "srai x9, x9, 8"),
);

Deno.test("decode - srai instruction 11", () =>
    decode_test("01000001000001010101010100010011", "srai x10, x10, 16"),
);

Deno.test("decode - srai instruction 12", () =>
    decode_test("01000001100001011101010110010011", "srai x11, x11, 24"),
);

Deno.test("decode - srai instruction 13", () =>
    decode_test("01000000110001100101011000010011", "srai x12, x12, 12"),
);

Deno.test("decode - srai instruction 14", () =>
    decode_test("01000001010001101101011010010011", "srai x13, x13, 20"),
);

Deno.test("decode - srai instruction 15", () =>
    decode_test("01000001110001110101011100010011", "srai x14, x14, 28"),
);

Deno.test("decode - srai instruction 16", () =>
    decode_test("01000000010001111101011110010011", "srai x15, x15, 4"),
);

Deno.test("decode - srai instruction 17", () =>
    decode_test("01000000011010000101100000010011", "srai x16, x16, 6"),
);

Deno.test("decode - srai instruction 18", () =>
    decode_test("01000000000110001101100010010011", "srai x17, x17, 1"),
);

Deno.test("decode - srai instruction 19", () =>
    decode_test("01000001111110010101100100010011", "srai x18, x18, 31"),
);

Deno.test("decode - srai instruction 20", () =>
    decode_test("01000001110110011101100110010011", "srai x19, x19, 29"),
);

Deno.test("decode - srai instruction 21", () =>
    decode_test("01000000001110100101101000010011", "srai x20, x20, 3"),
);

Deno.test("decode - srai instruction 22", () =>
    decode_test("01000000100110101101101010010011", "srai x21, x21, 9"),
);

Deno.test("decode - srai instruction 23", () =>
    decode_test("01000000111010110101101100010011", "srai x22, x22, 14"),
);

Deno.test("decode - srai instruction 24", () =>
    decode_test("01000001001110111101101110010011", "srai x23, x23, 19"),
);

Deno.test("decode - srai instruction 25", () =>
    decode_test("01000001011111000101110000010011", "srai x24, x24, 23"),
);

Deno.test("decode - srai instruction 26", () =>
    decode_test("01000001100111001101110010010011", "srai x25, x25, 25"),
);

Deno.test("decode - srai instruction 27", () =>
    decode_test("01000000001011010101110100010011", "srai x26, x26, 2"),
);

Deno.test("decode - srai instruction 28", () =>
    decode_test("01000001101111011101110110010011", "srai x27, x27, 27"),
);

Deno.test("decode - srai instruction 29", () =>
    decode_test("01000001000111100101111000010011", "srai x28, x28, 17"),
);

Deno.test("decode - srai instruction 30", () =>
    decode_test("01000000101111101101111010010011", "srai x29, x29, 11"),
);

Deno.test("decode - srai instruction 31", () =>
    decode_test("01000000000011110101111100010011", "srai x30, x30, 0"),
);

Deno.test("decode - srai instruction 32", () =>
    decode_test("01000001111111111101111110010011", "srai x31, x31, 31"),
);
