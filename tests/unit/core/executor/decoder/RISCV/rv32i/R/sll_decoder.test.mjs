import { decode_test } from "../../common.mjs";

Deno.test("decode - sll instruction 1", () =>
    decode_test("00000000000000000001000000110011", "sll x0, x0, x0"),
);

Deno.test("decode - sll instruction 2", () =>
    decode_test("00000000001000001001000010110011", "sll x1, x1, x2"),
);

Deno.test("decode - sll instruction 3", () =>
    decode_test("00000000001100010001000100110011", "sll x2, x2, x3"),
);

Deno.test("decode - sll instruction 4", () =>
    decode_test("00000000010000011001000110110011", "sll x3, x3, x4"),
);

Deno.test("decode - sll instruction 5", () =>
    decode_test("00000000010100100001001000110011", "sll x4, x4, x5"),
);

Deno.test("decode - sll instruction 6", () =>
    decode_test("00000000011000101001001010110011", "sll x5, x5, x6"),
);

Deno.test("decode - sll instruction 7", () =>
    decode_test("00000000011100110001001100110011", "sll x6, x6, x7"),
);

Deno.test("decode - sll instruction 8", () =>
    decode_test("00000000100000111001001110110011", "sll x7, x7, x8"),
);

Deno.test("decode - sll instruction 9", () =>
    decode_test("00000000100101000001010000110011", "sll x8, x8, x9"),
);

Deno.test("decode - sll instruction 10", () =>
    decode_test("00000000101001001001010010110011", "sll x9, x9, x10"),
);

Deno.test("decode - sll instruction 11", () =>
    decode_test("00000000101101010001010100110011", "sll x10, x10, x11"),
);

Deno.test("decode - sll instruction 12", () =>
    decode_test("00000000110001011001010110110011", "sll x11, x11, x12"),
);

Deno.test("decode - sll instruction 13", () =>
    decode_test("00000000110101100001011000110011", "sll x12, x12, x13"),
);

Deno.test("decode - sll instruction 14", () =>
    decode_test("00000000111001101001011010110011", "sll x13, x13, x14"),
);

Deno.test("decode - sll instruction 15", () =>
    decode_test("00000000111101110001011100110011", "sll x14, x14, x15"),
);

Deno.test("decode - sll instruction 16", () =>
    decode_test("00000001000001111001011110110011", "sll x15, x15, x16"),
);

Deno.test("decode - sll instruction 17", () =>
    decode_test("00000001000110000001100000110011", "sll x16, x16, x17"),
);

Deno.test("decode - sll instruction 18", () =>
    decode_test("00000001001010001001100010110011", "sll x17, x17, x18"),
);

Deno.test("decode - sll instruction 19", () =>
    decode_test("00000001001110010001100100110011", "sll x18, x18, x19"),
);

Deno.test("decode - sll instruction 20", () =>
    decode_test("00000001010010011001100110110011", "sll x19, x19, x20"),
);

Deno.test("decode - sll instruction 21", () =>
    decode_test("00000001010110100001101000110011", "sll x20, x20, x21"),
);

Deno.test("decode - sll instruction 22", () =>
    decode_test("00000001011010101001101010110011", "sll x21, x21, x22"),
);

Deno.test("decode - sll instruction 23", () =>
    decode_test("00000001011110110001101100110011", "sll x22, x22, x23"),
);

Deno.test("decode - sll instruction 24", () =>
    decode_test("00000001100010111001101110110011", "sll x23, x23, x24"),
);

Deno.test("decode - sll instruction 25", () =>
    decode_test("00000001100111000001110000110011", "sll x24, x24, x25"),
);

Deno.test("decode - sll instruction 26", () =>
    decode_test("00000001101011001001110010110011", "sll x25, x25, x26"),
);

Deno.test("decode - sll instruction 27", () =>
    decode_test("00000001101111010001110100110011", "sll x26, x26, x27"),
);

Deno.test("decode - sll instruction 28", () =>
    decode_test("00000001110011011001110110110011", "sll x27, x27, x28"),
);

Deno.test("decode - sll instruction 29", () =>
    decode_test("00000001110111100001111000110011", "sll x28, x28, x29"),
);

Deno.test("decode - sll instruction 30", () =>
    decode_test("00000001111011101001111010110011", "sll x29, x29, x30"),
);

Deno.test("decode - sll instruction 31", () =>
    decode_test("00000001111111110001111100110011", "sll x30, x30, x31"),
);

Deno.test("decode - sll instruction 32", () =>
    decode_test("00000000000111111001111110110011", "sll x31, x31, x1"),
);
