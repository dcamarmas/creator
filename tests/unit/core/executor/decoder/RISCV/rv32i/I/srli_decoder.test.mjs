import { decode_test } from "../../common.mjs";

Deno.test("decode - srli instruction 1", () =>
    decode_test("00000000000000000101000000010011", "srli x0, x0, 0"),
);

Deno.test("decode - srli instruction 2", () =>
    decode_test("00000000000100001101000010010011", "srli x1, x1, 1"),
);

Deno.test("decode - srli instruction 3", () =>
    decode_test("00000000001000010101000100010011", "srli x2, x2, 2"),
);

Deno.test("decode - srli instruction 4", () =>
    decode_test("00000001111100011101000110010011", "srli x3, x3, 31"),
);

Deno.test("decode - srli instruction 5", () =>
    decode_test("00000001111000100101001000010011", "srli x4, x4, 30"),
);

Deno.test("decode - srli instruction 6", () =>
    decode_test("00000000101000101101001010010011", "srli x5, x5, 10"),
);

Deno.test("decode - srli instruction 7", () =>
    decode_test("00000000111100110101001100010011", "srli x6, x6, 15"),
);

Deno.test("decode - srli instruction 8", () =>
    decode_test("00000000010100111101001110010011", "srli x7, x7, 5"),
);

Deno.test("decode - srli instruction 9", () =>
    decode_test("00000000011101000101010000010011", "srli x8, x8, 7"),
);

Deno.test("decode - srli instruction 10", () =>
    decode_test("00000000100001001101010010010011", "srli x9, x9, 8"),
);

Deno.test("decode - srli instruction 11", () =>
    decode_test("00000001000001010101010100010011", "srli x10, x10, 16"),
);

Deno.test("decode - srli instruction 12", () =>
    decode_test("00000001100001011101010110010011", "srli x11, x11, 24"),
);

Deno.test("decode - srli instruction 13", () =>
    decode_test("00000000110001100101011000010011", "srli x12, x12, 12"),
);

Deno.test("decode - srli instruction 14", () =>
    decode_test("00000001010001101101011010010011", "srli x13, x13, 20"),
);

Deno.test("decode - srli instruction 15", () =>
    decode_test("00000001110001110101011100010011", "srli x14, x14, 28"),
);

Deno.test("decode - srli instruction 16", () =>
    decode_test("00000000010001111101011110010011", "srli x15, x15, 4"),
);

Deno.test("decode - srli instruction 17", () =>
    decode_test("00000000011010000101100000010011", "srli x16, x16, 6"),
);

Deno.test("decode - srli instruction 18", () =>
    decode_test("00000000000110001101100010010011", "srli x17, x17, 1"),
);

Deno.test("decode - srli instruction 19", () =>
    decode_test("00000001111110010101100100010011", "srli x18, x18, 31"),
);

Deno.test("decode - srli instruction 20", () =>
    decode_test("00000001110110011101100110010011", "srli x19, x19, 29"),
);

Deno.test("decode - srli instruction 21", () =>
    decode_test("00000000001110100101101000010011", "srli x20, x20, 3"),
);

Deno.test("decode - srli instruction 22", () =>
    decode_test("00000000100110101101101010010011", "srli x21, x21, 9"),
);

Deno.test("decode - srli instruction 23", () =>
    decode_test("00000000111010110101101100010011", "srli x22, x22, 14"),
);

Deno.test("decode - srli instruction 24", () =>
    decode_test("00000001001110111101101110010011", "srli x23, x23, 19"),
);

Deno.test("decode - srli instruction 25", () =>
    decode_test("00000001011111000101110000010011", "srli x24, x24, 23"),
);

Deno.test("decode - srli instruction 26", () =>
    decode_test("00000001100111001101110010010011", "srli x25, x25, 25"),
);

Deno.test("decode - srli instruction 27", () =>
    decode_test("00000000001011010101110100010011", "srli x26, x26, 2"),
);

Deno.test("decode - srli instruction 28", () =>
    decode_test("00000001101111011101110110010011", "srli x27, x27, 27"),
);

Deno.test("decode - srli instruction 29", () =>
    decode_test("00000001000111100101111000010011", "srli x28, x28, 17"),
);

Deno.test("decode - srli instruction 30", () =>
    decode_test("00000000101111101101111010010011", "srli x29, x29, 11"),
);

Deno.test("decode - srli instruction 31", () =>
    decode_test("00000000000011110101111100010011", "srli x30, x30, 0"),
);

Deno.test("decode - srli instruction 32", () =>
    decode_test("00000001111111111101111110010011", "srli x31, x31, 31"),
);
