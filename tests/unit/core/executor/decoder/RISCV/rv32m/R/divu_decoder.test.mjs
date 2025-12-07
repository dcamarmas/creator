import { decode_test } from "../../common.mjs";

Deno.test("decode - divu instruction 1", () =>
    decode_test("00000010001100010101000010110011", "divu x1, x2, x3"),
);

Deno.test("decode - divu instruction 2", () =>
    decode_test("00000010011000101101001000110011", "divu x4, x5, x6"),
);

Deno.test("decode - divu instruction 3", () =>
    decode_test("00000010001000001101000000110011", "divu x0, x1, x2"),
);

Deno.test("decode - divu instruction 4", () =>
    decode_test("00000010010000000101000110110011", "divu x3, x0, x4"),
);

Deno.test("decode - divu instruction 5", () =>
    decode_test("00000010000000110101001010110011", "divu x5, x6, x0"),
);

Deno.test("decode - divu instruction 6", () =>
    decode_test("00000010000000000101001110110011", "divu x7, x0, x0"),
);

Deno.test("decode - divu instruction 7", () =>
    decode_test("00000011110111110101111110110011", "divu x31, x30, x29"),
);

Deno.test("decode - divu instruction 8", () =>
    decode_test("00000011111111111101111110110011", "divu x31, x31, x31"),
);

Deno.test("decode - divu instruction 9", () =>
    decode_test("00000011111011111101000010110011", "divu x1, x31, x30"),
);

Deno.test("decode - divu instruction 10", () =>
    decode_test("00000011111100011101000100110011", "divu x2, x3, x31"),
);

Deno.test("decode - divu instruction 11", () =>
    decode_test("00000010110001011101010100110011", "divu x10, x11, x12"),
);

Deno.test("decode - divu instruction 12", () =>
    decode_test("00000011111001010101101000110011", "divu x20, x10, x30"),
);

Deno.test("decode - divu instruction 13", () =>
    decode_test("00000011010101110101001110110011", "divu x7, x14, x21"),
);

Deno.test("decode - divu instruction 14", () =>
    decode_test("00000010011000101101001010110011", "divu x5, x5, x6"),
);

Deno.test("decode - divu instruction 15", () =>
    decode_test("00000010100001001101010000110011", "divu x8, x9, x8"),
);

Deno.test("decode - divu instruction 16", () =>
    decode_test("00000010101001010101010100110011", "divu x10, x10, x10"),
);

Deno.test("decode - divu instruction 17", () =>
    decode_test("00000010110001100101011000110011", "divu x12, x12, x12"),
);

Deno.test("decode - divu instruction 18", () =>
    decode_test("00000010111001101101011010110011", "divu x13, x13, x14"),
);

Deno.test("decode - divu instruction 19", () =>
    decode_test("00000011000110000101011110110011", "divu x15, x16, x17"),
);

Deno.test("decode - divu instruction 20", () =>
    decode_test("00000011101011001101110000110011", "divu x24, x25, x26"),
);

Deno.test("decode - divu instruction 21", () =>
    decode_test("00000010111001101101011010110011", "divu x13, x13, x14"),
);

Deno.test("decode - divu instruction 22", () =>
    decode_test("00000011011010111101101100110011", "divu x22, x23, x22"),
);

Deno.test("decode - divu instruction 23", () =>
    decode_test("00000011111100001101100100110011", "divu x18, x1, x31"),
);

Deno.test("decode - divu instruction 24", () =>
    decode_test("00000010000111111101100110110011", "divu x19, x31, x1"),
);

Deno.test("decode - divu instruction 25", () =>
    decode_test("00000010001011101101111010110011", "divu x29, x29, x2"),
);

Deno.test("decode - divu instruction 26", () =>
    decode_test("00000010101100010101010110110011", "divu x11, x2, x11"),
);

Deno.test("decode - divu instruction 27", () =>
    decode_test("00000010100101001101010010110011", "divu x9, x9, x9"),
);
