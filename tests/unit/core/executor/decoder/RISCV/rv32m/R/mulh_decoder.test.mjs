import { decode_test } from "../../common.mjs";

Deno.test("decode - mulh instruction 1", () =>
    decode_test("00000010001100010001000010110011", "mulh x1, x2, x3"),
);

Deno.test("decode - mulh instruction 2", () =>
    decode_test("00000010011000101001001000110011", "mulh x4, x5, x6"),
);

Deno.test("decode - mulh instruction 3", () =>
    decode_test("00000010001000001001000000110011", "mulh x0, x1, x2"),
);

Deno.test("decode - mulh instruction 4", () =>
    decode_test("00000010010000000001000110110011", "mulh x3, x0, x4"),
);

Deno.test("decode - mulh instruction 5", () =>
    decode_test("00000010000000110001001010110011", "mulh x5, x6, x0"),
);

Deno.test("decode - mulh instruction 6", () =>
    decode_test("00000010000000000001001110110011", "mulh x7, x0, x0"),
);

Deno.test("decode - mulh instruction 7", () =>
    decode_test("00000011110111110001111110110011", "mulh x31, x30, x29"),
);

Deno.test("decode - mulh instruction 8", () =>
    decode_test("00000011111111111001111110110011", "mulh x31, x31, x31"),
);

Deno.test("decode - mulh instruction 9", () =>
    decode_test("00000011111011111001000010110011", "mulh x1, x31, x30"),
);

Deno.test("decode - mulh instruction 10", () =>
    decode_test("00000011111100011001000100110011", "mulh x2, x3, x31"),
);

Deno.test("decode - mulh instruction 11", () =>
    decode_test("00000010110001011001010100110011", "mulh x10, x11, x12"),
);

Deno.test("decode - mulh instruction 12", () =>
    decode_test("00000011111001010001101000110011", "mulh x20, x10, x30"),
);

Deno.test("decode - mulh instruction 13", () =>
    decode_test("00000011010101110001001110110011", "mulh x7, x14, x21"),
);

Deno.test("decode - mulh instruction 14", () =>
    decode_test("00000010011000101001001010110011", "mulh x5, x5, x6"),
);

Deno.test("decode - mulh instruction 15", () =>
    decode_test("00000010100001001001010000110011", "mulh x8, x9, x8"),
);

Deno.test("decode - mulh instruction 16", () =>
    decode_test("00000010101001010001010100110011", "mulh x10, x10, x10"),
);

Deno.test("decode - mulh instruction 17", () =>
    decode_test("00000010110001100001011000110011", "mulh x12, x12, x12"),
);

Deno.test("decode - mulh instruction 18", () =>
    decode_test("00000010111001101001011010110011", "mulh x13, x13, x14"),
);

Deno.test("decode - mulh instruction 19", () =>
    decode_test("00000011000110000001011110110011", "mulh x15, x16, x17"),
);

Deno.test("decode - mulh instruction 20", () =>
    decode_test("00000011101011001001110000110011", "mulh x24, x25, x26"),
);

Deno.test("decode - mulh instruction 21", () =>
    decode_test("00000010111001101001011010110011", "mulh x13, x13, x14"),
);

Deno.test("decode - mulh instruction 22", () =>
    decode_test("00000011011010111001101100110011", "mulh x22, x23, x22"),
);

Deno.test("decode - mulh instruction 23", () =>
    decode_test("00000011111100001001100100110011", "mulh x18, x1, x31"),
);

Deno.test("decode - mulh instruction 24", () =>
    decode_test("00000010000111111001100110110011", "mulh x19, x31, x1"),
);

Deno.test("decode - mulh instruction 25", () =>
    decode_test("00000010001011101001111010110011", "mulh x29, x29, x2"),
);

Deno.test("decode - mulh instruction 26", () =>
    decode_test("00000010101100010001010110110011", "mulh x11, x2, x11"),
);

Deno.test("decode - mulh instruction 27", () =>
    decode_test("00000010100101001001010010110011", "mulh x9, x9, x9"),
);
