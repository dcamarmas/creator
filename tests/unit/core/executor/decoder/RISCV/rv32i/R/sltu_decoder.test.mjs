import { decode_test } from "../../common.mjs";

Deno.test("decode - sltu instruction 1", () =>
    decode_test("00000000000000000011000000110011", "sltu x0, x0, x0"),
);

Deno.test("decode - sltu instruction 2", () =>
    decode_test("00000000001000001011000010110011", "sltu x1, x1, x2"),
);

Deno.test("decode - sltu instruction 3", () =>
    decode_test("00000000001100010011000100110011", "sltu x2, x2, x3"),
);

Deno.test("decode - sltu instruction 4", () =>
    decode_test("00000000010000011011000110110011", "sltu x3, x3, x4"),
);

Deno.test("decode - sltu instruction 5", () =>
    decode_test("00000000010100100011001000110011", "sltu x4, x4, x5"),
);

Deno.test("decode - sltu instruction 6", () =>
    decode_test("00000000011000101011001010110011", "sltu x5, x5, x6"),
);

Deno.test("decode - sltu instruction 7", () =>
    decode_test("00000000011100110011001100110011", "sltu x6, x6, x7"),
);

Deno.test("decode - sltu instruction 8", () =>
    decode_test("00000000100000111011001110110011", "sltu x7, x7, x8"),
);

Deno.test("decode - sltu instruction 9", () =>
    decode_test("00000000100101000011010000110011", "sltu x8, x8, x9"),
);

Deno.test("decode - sltu instruction 10", () =>
    decode_test("00000000101001001011010010110011", "sltu x9, x9, x10"),
);

Deno.test("decode - sltu instruction 11", () =>
    decode_test("00000000101101010011010100110011", "sltu x10, x10, x11"),
);

Deno.test("decode - sltu instruction 12", () =>
    decode_test("00000000110001011011010110110011", "sltu x11, x11, x12"),
);

Deno.test("decode - sltu instruction 13", () =>
    decode_test("00000000110101100011011000110011", "sltu x12, x12, x13"),
);

Deno.test("decode - sltu instruction 14", () =>
    decode_test("00000000111001101011011010110011", "sltu x13, x13, x14"),
);

Deno.test("decode - sltu instruction 15", () =>
    decode_test("00000000111101110011011100110011", "sltu x14, x14, x15"),
);

Deno.test("decode - sltu instruction 16", () =>
    decode_test("00000001000001111011011110110011", "sltu x15, x15, x16"),
);

Deno.test("decode - sltu instruction 17", () =>
    decode_test("00000001000110000011100000110011", "sltu x16, x16, x17"),
);

Deno.test("decode - sltu instruction 18", () =>
    decode_test("00000001001010001011100010110011", "sltu x17, x17, x18"),
);

Deno.test("decode - sltu instruction 19", () =>
    decode_test("00000001001110010011100100110011", "sltu x18, x18, x19"),
);

Deno.test("decode - sltu instruction 20", () =>
    decode_test("00000001010010011011100110110011", "sltu x19, x19, x20"),
);

Deno.test("decode - sltu instruction 21", () =>
    decode_test("00000001010110100011101000110011", "sltu x20, x20, x21"),
);

Deno.test("decode - sltu instruction 22", () =>
    decode_test("00000001011010101011101010110011", "sltu x21, x21, x22"),
);

Deno.test("decode - sltu instruction 23", () =>
    decode_test("00000001011110110011101100110011", "sltu x22, x22, x23"),
);

Deno.test("decode - sltu instruction 24", () =>
    decode_test("00000001100010111011101110110011", "sltu x23, x23, x24"),
);

Deno.test("decode - sltu instruction 25", () =>
    decode_test("00000001100111000011110000110011", "sltu x24, x24, x25"),
);

Deno.test("decode - sltu instruction 26", () =>
    decode_test("00000001101011001011110010110011", "sltu x25, x25, x26"),
);

Deno.test("decode - sltu instruction 27", () =>
    decode_test("00000001101111010011110100110011", "sltu x26, x26, x27"),
);

Deno.test("decode - sltu instruction 28", () =>
    decode_test("00000001110011011011110110110011", "sltu x27, x27, x28"),
);

Deno.test("decode - sltu instruction 29", () =>
    decode_test("00000001110111100011111000110011", "sltu x28, x28, x29"),
);

Deno.test("decode - sltu instruction 30", () =>
    decode_test("00000001111011101011111010110011", "sltu x29, x29, x30"),
);

Deno.test("decode - sltu instruction 31", () =>
    decode_test("00000001111111110011111100110011", "sltu x30, x30, x31"),
);

Deno.test("decode - sltu instruction 32", () =>
    decode_test("00000000000111111011111110110011", "sltu x31, x31, x1"),
);
