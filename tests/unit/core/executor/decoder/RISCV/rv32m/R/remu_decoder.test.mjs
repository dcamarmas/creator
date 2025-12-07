import { decode_test } from "../../common.mjs";

Deno.test("decode - remu instruction 1", () =>
    decode_test("00000010001100010111000010110011", "remu x1, x2, x3"),
);

Deno.test("decode - remu instruction 2", () =>
    decode_test("00000010011000101111001000110011", "remu x4, x5, x6"),
);

Deno.test("decode - remu instruction 3", () =>
    decode_test("00000010001000001111000000110011", "remu x0, x1, x2"),
);

Deno.test("decode - remu instruction 4", () =>
    decode_test("00000010010000000111000110110011", "remu x3, x0, x4"),
);

Deno.test("decode - remu instruction 5", () =>
    decode_test("00000010000000110111001010110011", "remu x5, x6, x0"),
);

Deno.test("decode - remu instruction 6", () =>
    decode_test("00000010000000000111001110110011", "remu x7, x0, x0"),
);

Deno.test("decode - remu instruction 7", () =>
    decode_test("00000011110111110111111110110011", "remu x31, x30, x29"),
);

Deno.test("decode - remu instruction 8", () =>
    decode_test("00000011111111111111111110110011", "remu x31, x31, x31"),
);

Deno.test("decode - remu instruction 9", () =>
    decode_test("00000011111011111111000010110011", "remu x1, x31, x30"),
);

Deno.test("decode - remu instruction 10", () =>
    decode_test("00000011111100011111000100110011", "remu x2, x3, x31"),
);

Deno.test("decode - remu instruction 11", () =>
    decode_test("00000010110001011111010100110011", "remu x10, x11, x12"),
);

Deno.test("decode - remu instruction 12", () =>
    decode_test("00000011111001010111101000110011", "remu x20, x10, x30"),
);

Deno.test("decode - remu instruction 13", () =>
    decode_test("00000011010101110111001110110011", "remu x7, x14, x21"),
);

Deno.test("decode - remu instruction 14", () =>
    decode_test("00000010011000101111001010110011", "remu x5, x5, x6"),
);

Deno.test("decode - remu instruction 15", () =>
    decode_test("00000010100001001111010000110011", "remu x8, x9, x8"),
);

Deno.test("decode - remu instruction 16", () =>
    decode_test("00000010101001010111010100110011", "remu x10, x10, x10"),
);

Deno.test("decode - remu instruction 17", () =>
    decode_test("00000010110001100111011000110011", "remu x12, x12, x12"),
);

Deno.test("decode - remu instruction 18", () =>
    decode_test("00000010111001101111011010110011", "remu x13, x13, x14"),
);

Deno.test("decode - remu instruction 19", () =>
    decode_test("00000011000110000111011110110011", "remu x15, x16, x17"),
);

Deno.test("decode - remu instruction 20", () =>
    decode_test("00000011101011001111110000110011", "remu x24, x25, x26"),
);

Deno.test("decode - remu instruction 21", () =>
    decode_test("00000010111001101111011010110011", "remu x13, x13, x14"),
);

Deno.test("decode - remu instruction 22", () =>
    decode_test("00000011011010111111101100110011", "remu x22, x23, x22"),
);

Deno.test("decode - remu instruction 23", () =>
    decode_test("00000011111100001111100100110011", "remu x18, x1, x31"),
);

Deno.test("decode - remu instruction 24", () =>
    decode_test("00000010000111111111100110110011", "remu x19, x31, x1"),
);

Deno.test("decode - remu instruction 25", () =>
    decode_test("00000010001011101111111010110011", "remu x29, x29, x2"),
);

Deno.test("decode - remu instruction 26", () =>
    decode_test("00000010101100010111010110110011", "remu x11, x2, x11"),
);

Deno.test("decode - remu instruction 27", () =>
    decode_test("00000010100101001111010010110011", "remu x9, x9, x9"),
);
