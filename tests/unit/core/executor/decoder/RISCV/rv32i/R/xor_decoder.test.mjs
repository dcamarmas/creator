import { decode_test } from "../../common.mjs";

Deno.test("decode - xor instruction 1", () =>
    decode_test("00000000000000000100000000110011", "xor x0, x0, x0"),
);

Deno.test("decode - xor instruction 2", () =>
    decode_test("00000000001000001100000010110011", "xor x1, x1, x2"),
);

Deno.test("decode - xor instruction 3", () =>
    decode_test("00000000001100010100000100110011", "xor x2, x2, x3"),
);

Deno.test("decode - xor instruction 4", () =>
    decode_test("00000000010000011100000110110011", "xor x3, x3, x4"),
);

Deno.test("decode - xor instruction 5", () =>
    decode_test("00000000010100100100001000110011", "xor x4, x4, x5"),
);

Deno.test("decode - xor instruction 6", () =>
    decode_test("00000000011000101100001010110011", "xor x5, x5, x6"),
);

Deno.test("decode - xor instruction 7", () =>
    decode_test("00000000011100110100001100110011", "xor x6, x6, x7"),
);

Deno.test("decode - xor instruction 8", () =>
    decode_test("00000000100000111100001110110011", "xor x7, x7, x8"),
);

Deno.test("decode - xor instruction 9", () =>
    decode_test("00000000100101000100010000110011", "xor x8, x8, x9"),
);

Deno.test("decode - xor instruction 10", () =>
    decode_test("00000000101001001100010010110011", "xor x9, x9, x10"),
);

Deno.test("decode - xor instruction 11", () =>
    decode_test("00000000101101010100010100110011", "xor x10, x10, x11"),
);

Deno.test("decode - xor instruction 12", () =>
    decode_test("00000000110001011100010110110011", "xor x11, x11, x12"),
);

Deno.test("decode - xor instruction 13", () =>
    decode_test("00000000110101100100011000110011", "xor x12, x12, x13"),
);

Deno.test("decode - xor instruction 14", () =>
    decode_test("00000000111001101100011010110011", "xor x13, x13, x14"),
);

Deno.test("decode - xor instruction 15", () =>
    decode_test("00000000111101110100011100110011", "xor x14, x14, x15"),
);

Deno.test("decode - xor instruction 16", () =>
    decode_test("00000001000001111100011110110011", "xor x15, x15, x16"),
);

Deno.test("decode - xor instruction 17", () =>
    decode_test("00000001000110000100100000110011", "xor x16, x16, x17"),
);

Deno.test("decode - xor instruction 18", () =>
    decode_test("00000001001010001100100010110011", "xor x17, x17, x18"),
);

Deno.test("decode - xor instruction 19", () =>
    decode_test("00000001001110010100100100110011", "xor x18, x18, x19"),
);

Deno.test("decode - xor instruction 20", () =>
    decode_test("00000001010010011100100110110011", "xor x19, x19, x20"),
);

Deno.test("decode - xor instruction 21", () =>
    decode_test("00000001010110100100101000110011", "xor x20, x20, x21"),
);

Deno.test("decode - xor instruction 22", () =>
    decode_test("00000001011010101100101010110011", "xor x21, x21, x22"),
);

Deno.test("decode - xor instruction 23", () =>
    decode_test("00000001011110110100101100110011", "xor x22, x22, x23"),
);

Deno.test("decode - xor instruction 24", () =>
    decode_test("00000001100010111100101110110011", "xor x23, x23, x24"),
);

Deno.test("decode - xor instruction 25", () =>
    decode_test("00000001100111000100110000110011", "xor x24, x24, x25"),
);

Deno.test("decode - xor instruction 26", () =>
    decode_test("00000001101011001100110010110011", "xor x25, x25, x26"),
);

Deno.test("decode - xor instruction 27", () =>
    decode_test("00000001101111010100110100110011", "xor x26, x26, x27"),
);

Deno.test("decode - xor instruction 28", () =>
    decode_test("00000001110011011100110110110011", "xor x27, x27, x28"),
);

Deno.test("decode - xor instruction 29", () =>
    decode_test("00000001110111100100111000110011", "xor x28, x28, x29"),
);

Deno.test("decode - xor instruction 30", () =>
    decode_test("00000001111011101100111010110011", "xor x29, x29, x30"),
);

Deno.test("decode - xor instruction 31", () =>
    decode_test("00000001111111110100111100110011", "xor x30, x30, x31"),
);

Deno.test("decode - xor instruction 32", () =>
    decode_test("00000000000111111100111110110011", "xor x31, x31, x1"),
);
