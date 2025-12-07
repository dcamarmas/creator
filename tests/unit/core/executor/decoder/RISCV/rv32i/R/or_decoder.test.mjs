import { decode_test } from "../../common.mjs";

Deno.test("decode - or instruction 1", () =>
    decode_test("00000000000000000110000000110011", "or x0, x0, x0"),
);

Deno.test("decode - or instruction 2", () =>
    decode_test("00000000001000001110000010110011", "or x1, x1, x2"),
);

Deno.test("decode - or instruction 3", () =>
    decode_test("00000000001100010110000100110011", "or x2, x2, x3"),
);

Deno.test("decode - or instruction 4", () =>
    decode_test("00000000010000011110000110110011", "or x3, x3, x4"),
);

Deno.test("decode - or instruction 5", () =>
    decode_test("00000000010100100110001000110011", "or x4, x4, x5"),
);

Deno.test("decode - or instruction 6", () =>
    decode_test("00000000011000101110001010110011", "or x5, x5, x6"),
);

Deno.test("decode - or instruction 7", () =>
    decode_test("00000000011100110110001100110011", "or x6, x6, x7"),
);

Deno.test("decode - or instruction 8", () =>
    decode_test("00000000100000111110001110110011", "or x7, x7, x8"),
);

Deno.test("decode - or instruction 9", () =>
    decode_test("00000000100101000110010000110011", "or x8, x8, x9"),
);

Deno.test("decode - or instruction 10", () =>
    decode_test("00000000101001001110010010110011", "or x9, x9, x10"),
);

Deno.test("decode - or instruction 11", () =>
    decode_test("00000000101101010110010100110011", "or x10, x10, x11"),
);

Deno.test("decode - or instruction 12", () =>
    decode_test("00000000110001011110010110110011", "or x11, x11, x12"),
);

Deno.test("decode - or instruction 13", () =>
    decode_test("00000000110101100110011000110011", "or x12, x12, x13"),
);

Deno.test("decode - or instruction 14", () =>
    decode_test("00000000111001101110011010110011", "or x13, x13, x14"),
);

Deno.test("decode - or instruction 15", () =>
    decode_test("00000000111101110110011100110011", "or x14, x14, x15"),
);

Deno.test("decode - or instruction 16", () =>
    decode_test("00000001000001111110011110110011", "or x15, x15, x16"),
);

Deno.test("decode - or instruction 17", () =>
    decode_test("00000001000110000110100000110011", "or x16, x16, x17"),
);

Deno.test("decode - or instruction 18", () =>
    decode_test("00000001001010001110100010110011", "or x17, x17, x18"),
);

Deno.test("decode - or instruction 19", () =>
    decode_test("00000001001110010110100100110011", "or x18, x18, x19"),
);

Deno.test("decode - or instruction 20", () =>
    decode_test("00000001010010011110100110110011", "or x19, x19, x20"),
);

Deno.test("decode - or instruction 21", () =>
    decode_test("00000001010110100110101000110011", "or x20, x20, x21"),
);

Deno.test("decode - or instruction 22", () =>
    decode_test("00000001011010101110101010110011", "or x21, x21, x22"),
);

Deno.test("decode - or instruction 23", () =>
    decode_test("00000001011110110110101100110011", "or x22, x22, x23"),
);

Deno.test("decode - or instruction 24", () =>
    decode_test("00000001100010111110101110110011", "or x23, x23, x24"),
);

Deno.test("decode - or instruction 25", () =>
    decode_test("00000001100111000110110000110011", "or x24, x24, x25"),
);

Deno.test("decode - or instruction 26", () =>
    decode_test("00000001101011001110110010110011", "or x25, x25, x26"),
);

Deno.test("decode - or instruction 27", () =>
    decode_test("00000001101111010110110100110011", "or x26, x26, x27"),
);

Deno.test("decode - or instruction 28", () =>
    decode_test("00000001110011011110110110110011", "or x27, x27, x28"),
);

Deno.test("decode - or instruction 29", () =>
    decode_test("00000001110111100110111000110011", "or x28, x28, x29"),
);

Deno.test("decode - or instruction 30", () =>
    decode_test("00000001111011101110111010110011", "or x29, x29, x30"),
);

Deno.test("decode - or instruction 31", () =>
    decode_test("00000001111111110110111100110011", "or x30, x30, x31"),
);

Deno.test("decode - or instruction 32", () =>
    decode_test("00000000000111111110111110110011", "or x31, x31, x1"),
);
