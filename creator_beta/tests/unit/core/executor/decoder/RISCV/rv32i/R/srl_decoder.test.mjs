import { decode_test } from "../../common.mjs";

Deno.test("decode - srl instruction 1", () =>
    decode_test("00000000000000000101000000110011", "srl x0, x0, x0"),
);

Deno.test("decode - srl instruction 2", () =>
    decode_test("00000000001000001101000010110011", "srl x1, x1, x2"),
);

Deno.test("decode - srl instruction 3", () =>
    decode_test("00000000001100010101000100110011", "srl x2, x2, x3"),
);

Deno.test("decode - srl instruction 4", () =>
    decode_test("00000000010000011101000110110011", "srl x3, x3, x4"),
);

Deno.test("decode - srl instruction 5", () =>
    decode_test("00000000010100100101001000110011", "srl x4, x4, x5"),
);

Deno.test("decode - srl instruction 6", () =>
    decode_test("00000000011000101101001010110011", "srl x5, x5, x6"),
);

Deno.test("decode - srl instruction 7", () =>
    decode_test("00000000011100110101001100110011", "srl x6, x6, x7"),
);

Deno.test("decode - srl instruction 8", () =>
    decode_test("00000000100000111101001110110011", "srl x7, x7, x8"),
);

Deno.test("decode - srl instruction 9", () =>
    decode_test("00000000100101000101010000110011", "srl x8, x8, x9"),
);

Deno.test("decode - srl instruction 10", () =>
    decode_test("00000000101001001101010010110011", "srl x9, x9, x10"),
);

Deno.test("decode - srl instruction 11", () =>
    decode_test("00000000101101010101010100110011", "srl x10, x10, x11"),
);

Deno.test("decode - srl instruction 12", () =>
    decode_test("00000000110001011101010110110011", "srl x11, x11, x12"),
);

Deno.test("decode - srl instruction 13", () =>
    decode_test("00000000110101100101011000110011", "srl x12, x12, x13"),
);

Deno.test("decode - srl instruction 14", () =>
    decode_test("00000000111001101101011010110011", "srl x13, x13, x14"),
);

Deno.test("decode - srl instruction 15", () =>
    decode_test("00000000111101110101011100110011", "srl x14, x14, x15"),
);

Deno.test("decode - srl instruction 16", () =>
    decode_test("00000001000001111101011110110011", "srl x15, x15, x16"),
);

Deno.test("decode - srl instruction 17", () =>
    decode_test("00000001000110000101100000110011", "srl x16, x16, x17"),
);

Deno.test("decode - srl instruction 18", () =>
    decode_test("00000001001010001101100010110011", "srl x17, x17, x18"),
);

Deno.test("decode - srl instruction 19", () =>
    decode_test("00000001001110010101100100110011", "srl x18, x18, x19"),
);

Deno.test("decode - srl instruction 20", () =>
    decode_test("00000001010010011101100110110011", "srl x19, x19, x20"),
);

Deno.test("decode - srl instruction 21", () =>
    decode_test("00000001010110100101101000110011", "srl x20, x20, x21"),
);

Deno.test("decode - srl instruction 22", () =>
    decode_test("00000001011010101101101010110011", "srl x21, x21, x22"),
);

Deno.test("decode - srl instruction 23", () =>
    decode_test("00000001011110110101101100110011", "srl x22, x22, x23"),
);

Deno.test("decode - srl instruction 24", () =>
    decode_test("00000001100010111101101110110011", "srl x23, x23, x24"),
);

Deno.test("decode - srl instruction 25", () =>
    decode_test("00000001100111000101110000110011", "srl x24, x24, x25"),
);

Deno.test("decode - srl instruction 26", () =>
    decode_test("00000001101011001101110010110011", "srl x25, x25, x26"),
);

Deno.test("decode - srl instruction 27", () =>
    decode_test("00000001101111010101110100110011", "srl x26, x26, x27"),
);

Deno.test("decode - srl instruction 28", () =>
    decode_test("00000001110011011101110110110011", "srl x27, x27, x28"),
);

Deno.test("decode - srl instruction 29", () =>
    decode_test("00000001110111100101111000110011", "srl x28, x28, x29"),
);

Deno.test("decode - srl instruction 30", () =>
    decode_test("00000001111011101101111010110011", "srl x29, x29, x30"),
);

Deno.test("decode - srl instruction 31", () =>
    decode_test("00000001111111110101111100110011", "srl x30, x30, x31"),
);

Deno.test("decode - srl instruction 32", () =>
    decode_test("00000000000111111101111110110011", "srl x31, x31, x1"),
);
