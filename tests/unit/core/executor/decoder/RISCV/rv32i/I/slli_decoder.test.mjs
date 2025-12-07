import { decode_test } from "../../common.mjs";

Deno.test("decode - slli instruction 1", () =>
    decode_test("00000000000000000001000000010011", "slli x0, x0, 0"),
);

Deno.test("decode - slli instruction 2", () =>
    decode_test("00000000000100001001000010010011", "slli x1, x1, 1"),
);

Deno.test("decode - slli instruction 3", () =>
    decode_test("00000000001000010001000100010011", "slli x2, x2, 2"),
);

Deno.test("decode - slli instruction 4", () =>
    decode_test("00000001111100011001000110010011", "slli x3, x3, 31"),
);

Deno.test("decode - slli instruction 5", () =>
    decode_test("00000001111000100001001000010011", "slli x4, x4, 30"),
);

Deno.test("decode - slli instruction 6", () =>
    decode_test("00000000101000101001001010010011", "slli x5, x5, 10"),
);

Deno.test("decode - slli instruction 7", () =>
    decode_test("00000000111100110001001100010011", "slli x6, x6, 15"),
);

Deno.test("decode - slli instruction 8", () =>
    decode_test("00000000010100111001001110010011", "slli x7, x7, 5"),
);

Deno.test("decode - slli instruction 9", () =>
    decode_test("00000000011101000001010000010011", "slli x8, x8, 7"),
);

Deno.test("decode - slli instruction 10", () =>
    decode_test("00000000100001001001010010010011", "slli x9, x9, 8"),
);

Deno.test("decode - slli instruction 11", () =>
    decode_test("00000001000001010001010100010011", "slli x10, x10, 16"),
);

Deno.test("decode - slli instruction 12", () =>
    decode_test("00000001100001011001010110010011", "slli x11, x11, 24"),
);

Deno.test("decode - slli instruction 13", () =>
    decode_test("00000000110001100001011000010011", "slli x12, x12, 12"),
);

Deno.test("decode - slli instruction 14", () =>
    decode_test("00000001010001101001011010010011", "slli x13, x13, 20"),
);

Deno.test("decode - slli instruction 15", () =>
    decode_test("00000001110001110001011100010011", "slli x14, x14, 28"),
);

Deno.test("decode - slli instruction 16", () =>
    decode_test("00000000010001111001011110010011", "slli x15, x15, 4"),
);

Deno.test("decode - slli instruction 17", () =>
    decode_test("00000000011010000001100000010011", "slli x16, x16, 6"),
);

Deno.test("decode - slli instruction 18", () =>
    decode_test("00000000000110001001100010010011", "slli x17, x17, 1"),
);

Deno.test("decode - slli instruction 19", () =>
    decode_test("00000001111110010001100100010011", "slli x18, x18, 31"),
);

Deno.test("decode - slli instruction 20", () =>
    decode_test("00000001110110011001100110010011", "slli x19, x19, 29"),
);

Deno.test("decode - slli instruction 21", () =>
    decode_test("00000000001110100001101000010011", "slli x20, x20, 3"),
);

Deno.test("decode - slli instruction 22", () =>
    decode_test("00000000100110101001101010010011", "slli x21, x21, 9"),
);

Deno.test("decode - slli instruction 23", () =>
    decode_test("00000000111010110001101100010011", "slli x22, x22, 14"),
);

Deno.test("decode - slli instruction 24", () =>
    decode_test("00000001001110111001101110010011", "slli x23, x23, 19"),
);

Deno.test("decode - slli instruction 25", () =>
    decode_test("00000001011111000001110000010011", "slli x24, x24, 23"),
);

Deno.test("decode - slli instruction 26", () =>
    decode_test("00000001100111001001110010010011", "slli x25, x25, 25"),
);

Deno.test("decode - slli instruction 27", () =>
    decode_test("00000000001011010001110100010011", "slli x26, x26, 2"),
);

Deno.test("decode - slli instruction 28", () =>
    decode_test("00000001101111011001110110010011", "slli x27, x27, 27"),
);

Deno.test("decode - slli instruction 29", () =>
    decode_test("00000001000111100001111000010011", "slli x28, x28, 17"),
);

Deno.test("decode - slli instruction 30", () =>
    decode_test("00000000101111101001111010010011", "slli x29, x29, 11"),
);

Deno.test("decode - slli instruction 31", () =>
    decode_test("00000000000011110001111100010011", "slli x30, x30, 0"),
);

Deno.test("decode - slli instruction 32", () =>
    decode_test("00000001111111111001111110010011", "slli x31, x31, 31"),
);
