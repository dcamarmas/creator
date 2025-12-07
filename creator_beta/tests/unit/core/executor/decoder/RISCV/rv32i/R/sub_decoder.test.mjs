import { decode_test } from "../../common.mjs";

Deno.test("decode - sub instruction 1", () =>
    decode_test("01000000000000000000000000110011", "sub x0, x0, x0"),
);

Deno.test("decode - sub instruction 2", () =>
    decode_test("01000000001000001000000010110011", "sub x1, x1, x2"),
);

Deno.test("decode - sub instruction 3", () =>
    decode_test("01000000001100010000000100110011", "sub x2, x2, x3"),
);

Deno.test("decode - sub instruction 4", () =>
    decode_test("01000000010000011000000110110011", "sub x3, x3, x4"),
);

Deno.test("decode - sub instruction 5", () =>
    decode_test("01000000010100100000001000110011", "sub x4, x4, x5"),
);

Deno.test("decode - sub instruction 6", () =>
    decode_test("01000000011000101000001010110011", "sub x5, x5, x6"),
);

Deno.test("decode - sub instruction 7", () =>
    decode_test("01000000011100110000001100110011", "sub x6, x6, x7"),
);

Deno.test("decode - sub instruction 8", () =>
    decode_test("01000000100000111000001110110011", "sub x7, x7, x8"),
);

Deno.test("decode - sub instruction 9", () =>
    decode_test("01000000100101000000010000110011", "sub x8, x8, x9"),
);

Deno.test("decode - sub instruction 10", () =>
    decode_test("01000000101001001000010010110011", "sub x9, x9, x10"),
);

Deno.test("decode - sub instruction 11", () =>
    decode_test("01000000101101010000010100110011", "sub x10, x10, x11"),
);

Deno.test("decode - sub instruction 12", () =>
    decode_test("01000000110001011000010110110011", "sub x11, x11, x12"),
);

Deno.test("decode - sub instruction 13", () =>
    decode_test("01000000110101100000011000110011", "sub x12, x12, x13"),
);

Deno.test("decode - sub instruction 14", () =>
    decode_test("01000000111001101000011010110011", "sub x13, x13, x14"),
);

Deno.test("decode - sub instruction 15", () =>
    decode_test("01000000111101110000011100110011", "sub x14, x14, x15"),
);

Deno.test("decode - sub instruction 16", () =>
    decode_test("01000001000001111000011110110011", "sub x15, x15, x16"),
);

Deno.test("decode - sub instruction 17", () =>
    decode_test("01000001000110000000100000110011", "sub x16, x16, x17"),
);

Deno.test("decode - sub instruction 18", () =>
    decode_test("01000001001010001000100010110011", "sub x17, x17, x18"),
);

Deno.test("decode - sub instruction 19", () =>
    decode_test("01000001001110010000100100110011", "sub x18, x18, x19"),
);

Deno.test("decode - sub instruction 20", () =>
    decode_test("01000001010010011000100110110011", "sub x19, x19, x20"),
);

Deno.test("decode - sub instruction 21", () =>
    decode_test("01000001010110100000101000110011", "sub x20, x20, x21"),
);

Deno.test("decode - sub instruction 22", () =>
    decode_test("01000001011010101000101010110011", "sub x21, x21, x22"),
);

Deno.test("decode - sub instruction 23", () =>
    decode_test("01000001011110110000101100110011", "sub x22, x22, x23"),
);

Deno.test("decode - sub instruction 24", () =>
    decode_test("01000001100010111000101110110011", "sub x23, x23, x24"),
);

Deno.test("decode - sub instruction 25", () =>
    decode_test("01000001100111000000110000110011", "sub x24, x24, x25"),
);

Deno.test("decode - sub instruction 26", () =>
    decode_test("01000001101011001000110010110011", "sub x25, x25, x26"),
);

Deno.test("decode - sub instruction 27", () =>
    decode_test("01000001101111010000110100110011", "sub x26, x26, x27"),
);

Deno.test("decode - sub instruction 28", () =>
    decode_test("01000001110011011000110110110011", "sub x27, x27, x28"),
);

Deno.test("decode - sub instruction 29", () =>
    decode_test("01000001110111100000111000110011", "sub x28, x28, x29"),
);

Deno.test("decode - sub instruction 30", () =>
    decode_test("01000001111011101000111010110011", "sub x29, x29, x30"),
);

Deno.test("decode - sub instruction 31", () =>
    decode_test("01000001111111110000111100110011", "sub x30, x30, x31"),
);

Deno.test("decode - sub instruction 32", () =>
    decode_test("01000000000111111000111110110011", "sub x31, x31, x1"),
);
