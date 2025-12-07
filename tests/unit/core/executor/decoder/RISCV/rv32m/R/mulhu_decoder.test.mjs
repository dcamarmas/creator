import { decode_test } from "../../common.mjs";

Deno.test("decode - mulhu instruction 1", () =>
    decode_test("00000010001100010011000010110011", "mulhu x1, x2, x3"),
);

Deno.test("decode - mulhu instruction 2", () =>
    decode_test("00000010011000101011001000110011", "mulhu x4, x5, x6"),
);

Deno.test("decode - mulhu instruction 3", () =>
    decode_test("00000010001000001011000000110011", "mulhu x0, x1, x2"),
);

Deno.test("decode - mulhu instruction 4", () =>
    decode_test("00000010010000000011000110110011", "mulhu x3, x0, x4"),
);

Deno.test("decode - mulhu instruction 5", () =>
    decode_test("00000010000000110011001010110011", "mulhu x5, x6, x0"),
);

Deno.test("decode - mulhu instruction 6", () =>
    decode_test("00000010000000000011001110110011", "mulhu x7, x0, x0"),
);

Deno.test("decode - mulhu instruction 7", () =>
    decode_test("00000011110111110011111110110011", "mulhu x31, x30, x29"),
);

Deno.test("decode - mulhu instruction 8", () =>
    decode_test("00000011111111111011111110110011", "mulhu x31, x31, x31"),
);

Deno.test("decode - mulhu instruction 9", () =>
    decode_test("00000011111011111011000010110011", "mulhu x1, x31, x30"),
);

Deno.test("decode - mulhu instruction 10", () =>
    decode_test("00000011111100011011000100110011", "mulhu x2, x3, x31"),
);

Deno.test("decode - mulhu instruction 11", () =>
    decode_test("00000010110001011011010100110011", "mulhu x10, x11, x12"),
);

Deno.test("decode - mulhu instruction 12", () =>
    decode_test("00000011111001010011101000110011", "mulhu x20, x10, x30"),
);

Deno.test("decode - mulhu instruction 13", () =>
    decode_test("00000011010101110011001110110011", "mulhu x7, x14, x21"),
);

Deno.test("decode - mulhu instruction 14", () =>
    decode_test("00000010011000101011001010110011", "mulhu x5, x5, x6"),
);

Deno.test("decode - mulhu instruction 15", () =>
    decode_test("00000010100001001011010000110011", "mulhu x8, x9, x8"),
);

Deno.test("decode - mulhu instruction 16", () =>
    decode_test("00000010101001010011010100110011", "mulhu x10, x10, x10"),
);

Deno.test("decode - mulhu instruction 17", () =>
    decode_test("00000010110001100011011000110011", "mulhu x12, x12, x12"),
);

Deno.test("decode - mulhu instruction 18", () =>
    decode_test("00000010111001101011011010110011", "mulhu x13, x13, x14"),
);

Deno.test("decode - mulhu instruction 19", () =>
    decode_test("00000011000110000011011110110011", "mulhu x15, x16, x17"),
);

Deno.test("decode - mulhu instruction 20", () =>
    decode_test("00000011101011001011110000110011", "mulhu x24, x25, x26"),
);

Deno.test("decode - mulhu instruction 21", () =>
    decode_test("00000010111001101011011010110011", "mulhu x13, x13, x14"),
);

Deno.test("decode - mulhu instruction 22", () =>
    decode_test("00000011011010111011101100110011", "mulhu x22, x23, x22"),
);

Deno.test("decode - mulhu instruction 23", () =>
    decode_test("00000011111100001011100100110011", "mulhu x18, x1, x31"),
);

Deno.test("decode - mulhu instruction 24", () =>
    decode_test("00000010000111111011100110110011", "mulhu x19, x31, x1"),
);

Deno.test("decode - mulhu instruction 25", () =>
    decode_test("00000010001011101011111010110011", "mulhu x29, x29, x2"),
);

Deno.test("decode - mulhu instruction 26", () =>
    decode_test("00000010101100010011010110110011", "mulhu x11, x2, x11"),
);

Deno.test("decode - mulhu instruction 27", () =>
    decode_test("00000010100101001011010010110011", "mulhu x9, x9, x9"),
);
