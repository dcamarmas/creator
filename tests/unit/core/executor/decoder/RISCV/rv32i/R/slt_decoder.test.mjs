import { decode_test } from "../../common.mjs";

Deno.test("decode - slt instruction 1", () =>
    decode_test("00000000000000000010000000110011", "slt x0, x0, x0"),
);

Deno.test("decode - slt instruction 2", () =>
    decode_test("00000000001000001010000010110011", "slt x1, x1, x2"),
);

Deno.test("decode - slt instruction 3", () =>
    decode_test("00000000001100010010000100110011", "slt x2, x2, x3"),
);

Deno.test("decode - slt instruction 4", () =>
    decode_test("00000000010000011010000110110011", "slt x3, x3, x4"),
);

Deno.test("decode - slt instruction 5", () =>
    decode_test("00000000010100100010001000110011", "slt x4, x4, x5"),
);

Deno.test("decode - slt instruction 6", () =>
    decode_test("00000000011000101010001010110011", "slt x5, x5, x6"),
);

Deno.test("decode - slt instruction 7", () =>
    decode_test("00000000011100110010001100110011", "slt x6, x6, x7"),
);

Deno.test("decode - slt instruction 8", () =>
    decode_test("00000000100000111010001110110011", "slt x7, x7, x8"),
);

Deno.test("decode - slt instruction 9", () =>
    decode_test("00000000100101000010010000110011", "slt x8, x8, x9"),
);

Deno.test("decode - slt instruction 10", () =>
    decode_test("00000000101001001010010010110011", "slt x9, x9, x10"),
);

Deno.test("decode - slt instruction 11", () =>
    decode_test("00000000101101010010010100110011", "slt x10, x10, x11"),
);

Deno.test("decode - slt instruction 12", () =>
    decode_test("00000000110001011010010110110011", "slt x11, x11, x12"),
);

Deno.test("decode - slt instruction 13", () =>
    decode_test("00000000110101100010011000110011", "slt x12, x12, x13"),
);

Deno.test("decode - slt instruction 14", () =>
    decode_test("00000000111001101010011010110011", "slt x13, x13, x14"),
);

Deno.test("decode - slt instruction 15", () =>
    decode_test("00000000111101110010011100110011", "slt x14, x14, x15"),
);

Deno.test("decode - slt instruction 16", () =>
    decode_test("00000001000001111010011110110011", "slt x15, x15, x16"),
);

Deno.test("decode - slt instruction 17", () =>
    decode_test("00000001000110000010100000110011", "slt x16, x16, x17"),
);

Deno.test("decode - slt instruction 18", () =>
    decode_test("00000001001010001010100010110011", "slt x17, x17, x18"),
);

Deno.test("decode - slt instruction 19", () =>
    decode_test("00000001001110010010100100110011", "slt x18, x18, x19"),
);

Deno.test("decode - slt instruction 20", () =>
    decode_test("00000001010010011010100110110011", "slt x19, x19, x20"),
);

Deno.test("decode - slt instruction 21", () =>
    decode_test("00000001010110100010101000110011", "slt x20, x20, x21"),
);

Deno.test("decode - slt instruction 22", () =>
    decode_test("00000001011010101010101010110011", "slt x21, x21, x22"),
);

Deno.test("decode - slt instruction 23", () =>
    decode_test("00000001011110110010101100110011", "slt x22, x22, x23"),
);

Deno.test("decode - slt instruction 24", () =>
    decode_test("00000001100010111010101110110011", "slt x23, x23, x24"),
);

Deno.test("decode - slt instruction 25", () =>
    decode_test("00000001100111000010110000110011", "slt x24, x24, x25"),
);

Deno.test("decode - slt instruction 26", () =>
    decode_test("00000001101011001010110010110011", "slt x25, x25, x26"),
);

Deno.test("decode - slt instruction 27", () =>
    decode_test("00000001101111010010110100110011", "slt x26, x26, x27"),
);

Deno.test("decode - slt instruction 28", () =>
    decode_test("00000001110011011010110110110011", "slt x27, x27, x28"),
);

Deno.test("decode - slt instruction 29", () =>
    decode_test("00000001110111100010111000110011", "slt x28, x28, x29"),
);

Deno.test("decode - slt instruction 30", () =>
    decode_test("00000001111011101010111010110011", "slt x29, x29, x30"),
);

Deno.test("decode - slt instruction 31", () =>
    decode_test("00000001111111110010111100110011", "slt x30, x30, x31"),
);

Deno.test("decode - slt instruction 32", () =>
    decode_test("00000000000111111010111110110011", "slt x31, x31, x1"),
);
