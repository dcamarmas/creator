import { decode_test } from "../../common.mjs";

Deno.test("decode - rem instruction 1", () =>
    decode_test("00000010001100010110000010110011", "rem x1, x2, x3"),
);

Deno.test("decode - rem instruction 2", () =>
    decode_test("00000010011000101110001000110011", "rem x4, x5, x6"),
);

Deno.test("decode - rem instruction 3", () =>
    decode_test("00000010001000001110000000110011", "rem x0, x1, x2"),
);

Deno.test("decode - rem instruction 4", () =>
    decode_test("00000010010000000110000110110011", "rem x3, x0, x4"),
);

Deno.test("decode - rem instruction 5", () =>
    decode_test("00000010000000110110001010110011", "rem x5, x6, x0"),
);

Deno.test("decode - rem instruction 6", () =>
    decode_test("00000010000000000110001110110011", "rem x7, x0, x0"),
);

Deno.test("decode - rem instruction 7", () =>
    decode_test("00000011110111110110111110110011", "rem x31, x30, x29"),
);

Deno.test("decode - rem instruction 8", () =>
    decode_test("00000011111111111110111110110011", "rem x31, x31, x31"),
);

Deno.test("decode - rem instruction 9", () =>
    decode_test("00000011111011111110000010110011", "rem x1, x31, x30"),
);

Deno.test("decode - rem instruction 10", () =>
    decode_test("00000011111100011110000100110011", "rem x2, x3, x31"),
);

Deno.test("decode - rem instruction 11", () =>
    decode_test("00000010110001011110010100110011", "rem x10, x11, x12"),
);

Deno.test("decode - rem instruction 12", () =>
    decode_test("00000011111001010110101000110011", "rem x20, x10, x30"),
);

Deno.test("decode - rem instruction 13", () =>
    decode_test("00000011010101110110001110110011", "rem x7, x14, x21"),
);

Deno.test("decode - rem instruction 14", () =>
    decode_test("00000010011000101110001010110011", "rem x5, x5, x6"),
);

Deno.test("decode - rem instruction 15", () =>
    decode_test("00000010100001001110010000110011", "rem x8, x9, x8"),
);

Deno.test("decode - rem instruction 16", () =>
    decode_test("00000010101001010110010100110011", "rem x10, x10, x10"),
);

Deno.test("decode - rem instruction 17", () =>
    decode_test("00000010110001100110011000110011", "rem x12, x12, x12"),
);

Deno.test("decode - rem instruction 18", () =>
    decode_test("00000010111001101110011010110011", "rem x13, x13, x14"),
);

Deno.test("decode - rem instruction 19", () =>
    decode_test("00000011000110000110011110110011", "rem x15, x16, x17"),
);

Deno.test("decode - rem instruction 20", () =>
    decode_test("00000011101011001110110000110011", "rem x24, x25, x26"),
);

Deno.test("decode - rem instruction 21", () =>
    decode_test("00000010111001101110011010110011", "rem x13, x13, x14"),
);

Deno.test("decode - rem instruction 22", () =>
    decode_test("00000011011010111110101100110011", "rem x22, x23, x22"),
);

Deno.test("decode - rem instruction 23", () =>
    decode_test("00000011111100001110100100110011", "rem x18, x1, x31"),
);

Deno.test("decode - rem instruction 24", () =>
    decode_test("00000010000111111110100110110011", "rem x19, x31, x1"),
);

Deno.test("decode - rem instruction 25", () =>
    decode_test("00000010001011101110111010110011", "rem x29, x29, x2"),
);

Deno.test("decode - rem instruction 26", () =>
    decode_test("00000010101100010110010110110011", "rem x11, x2, x11"),
);

Deno.test("decode - rem instruction 27", () =>
    decode_test("00000010100101001110010010110011", "rem x9, x9, x9"),
);
