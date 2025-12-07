import { decode_test } from "../../common.mjs";

Deno.test("decode - mul instruction 1", () =>
    decode_test("00000010001100010000000010110011", "mul x1, x2, x3"),
);

Deno.test("decode - mul instruction 2", () =>
    decode_test("00000010011000101000001000110011", "mul x4, x5, x6"),
);

Deno.test("decode - mul instruction 3", () =>
    decode_test("00000010001000001000000000110011", "mul x0, x1, x2"),
);

Deno.test("decode - mul instruction 4", () =>
    decode_test("00000010010000000000000110110011", "mul x3, x0, x4"),
);

Deno.test("decode - mul instruction 5", () =>
    decode_test("00000010000000110000001010110011", "mul x5, x6, x0"),
);

Deno.test("decode - mul instruction 6", () =>
    decode_test("00000010000000000000001110110011", "mul x7, x0, x0"),
);

Deno.test("decode - mul instruction 7", () =>
    decode_test("00000011110111110000111110110011", "mul x31, x30, x29"),
);

Deno.test("decode - mul instruction 8", () =>
    decode_test("00000011111111111000111110110011", "mul x31, x31, x31"),
);

Deno.test("decode - mul instruction 9", () =>
    decode_test("00000011111011111000000010110011", "mul x1, x31, x30"),
);

Deno.test("decode - mul instruction 10", () =>
    decode_test("00000011111100011000000100110011", "mul x2, x3, x31"),
);

Deno.test("decode - mul instruction 11", () =>
    decode_test("00000010110001011000010100110011", "mul x10, x11, x12"),
);

Deno.test("decode - mul instruction 12", () =>
    decode_test("00000011111001010000101000110011", "mul x20, x10, x30"),
);

Deno.test("decode - mul instruction 13", () =>
    decode_test("00000011010101110000001110110011", "mul x7, x14, x21"),
);

Deno.test("decode - mul instruction 14", () =>
    decode_test("00000010011000101000001010110011", "mul x5, x5, x6"),
);

Deno.test("decode - mul instruction 15", () =>
    decode_test("00000010100001001000010000110011", "mul x8, x9, x8"),
);

Deno.test("decode - mul instruction 16", () =>
    decode_test("00000010101001010000010100110011", "mul x10, x10, x10"),
);

Deno.test("decode - mul instruction 17", () =>
    decode_test("00000010110001100000011000110011", "mul x12, x12, x12"),
);

Deno.test("decode - mul instruction 18", () =>
    decode_test("00000010111001101000011010110011", "mul x13, x13, x14"),
);

Deno.test("decode - mul instruction 19", () =>
    decode_test("00000011000110000000011110110011", "mul x15, x16, x17"),
);

Deno.test("decode - mul instruction 20", () =>
    decode_test("00000011101011001000110000110011", "mul x24, x25, x26"),
);

Deno.test("decode - mul instruction 21", () =>
    decode_test("00000010111001101000011010110011", "mul x13, x13, x14"),
);

Deno.test("decode - mul instruction 22", () =>
    decode_test("00000011011010111000101100110011", "mul x22, x23, x22"),
);

Deno.test("decode - mul instruction 23", () =>
    decode_test("00000011111100001000100100110011", "mul x18, x1, x31"),
);

Deno.test("decode - mul instruction 24", () =>
    decode_test("00000010000111111000100110110011", "mul x19, x31, x1"),
);

Deno.test("decode - mul instruction 25", () =>
    decode_test("00000010001011101000111010110011", "mul x29, x29, x2"),
);

Deno.test("decode - mul instruction 26", () =>
    decode_test("00000010101100010000010110110011", "mul x11, x2, x11"),
);

Deno.test("decode - mul instruction 27", () =>
    decode_test("00000010100101001000010010110011", "mul x9, x9, x9"),
);
