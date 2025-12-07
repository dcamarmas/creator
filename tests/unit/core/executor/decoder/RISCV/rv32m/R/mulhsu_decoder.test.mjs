import { decode_test } from "../../common.mjs";

Deno.test("decode - mulhsu instruction 1", () =>
    decode_test("00000010001100010010000010110011", "mulhsu x1, x2, x3"),
);

Deno.test("decode - mulhsu instruction 2", () =>
    decode_test("00000010011000101010001000110011", "mulhsu x4, x5, x6"),
);

Deno.test("decode - mulhsu instruction 3", () =>
    decode_test("00000010001000001010000000110011", "mulhsu x0, x1, x2"),
);

Deno.test("decode - mulhsu instruction 4", () =>
    decode_test("00000010010000000010000110110011", "mulhsu x3, x0, x4"),
);

Deno.test("decode - mulhsu instruction 5", () =>
    decode_test("00000010000000110010001010110011", "mulhsu x5, x6, x0"),
);

Deno.test("decode - mulhsu instruction 6", () =>
    decode_test("00000010000000000010001110110011", "mulhsu x7, x0, x0"),
);

Deno.test("decode - mulhsu instruction 7", () =>
    decode_test("00000011110111110010111110110011", "mulhsu x31, x30, x29"),
);

Deno.test("decode - mulhsu instruction 8", () =>
    decode_test("00000011111111111010111110110011", "mulhsu x31, x31, x31"),
);

Deno.test("decode - mulhsu instruction 9", () =>
    decode_test("00000011111011111010000010110011", "mulhsu x1, x31, x30"),
);

Deno.test("decode - mulhsu instruction 10", () =>
    decode_test("00000011111100011010000100110011", "mulhsu x2, x3, x31"),
);

Deno.test("decode - mulhsu instruction 11", () =>
    decode_test("00000010110001011010010100110011", "mulhsu x10, x11, x12"),
);

Deno.test("decode - mulhsu instruction 12", () =>
    decode_test("00000011111001010010101000110011", "mulhsu x20, x10, x30"),
);

Deno.test("decode - mulhsu instruction 13", () =>
    decode_test("00000011010101110010001110110011", "mulhsu x7, x14, x21"),
);

Deno.test("decode - mulhsu instruction 14", () =>
    decode_test("00000010011000101010001010110011", "mulhsu x5, x5, x6"),
);

Deno.test("decode - mulhsu instruction 15", () =>
    decode_test("00000010100001001010010000110011", "mulhsu x8, x9, x8"),
);

Deno.test("decode - mulhsu instruction 16", () =>
    decode_test("00000010101001010010010100110011", "mulhsu x10, x10, x10"),
);

Deno.test("decode - mulhsu instruction 17", () =>
    decode_test("00000010110001100010011000110011", "mulhsu x12, x12, x12"),
);

Deno.test("decode - mulhsu instruction 18", () =>
    decode_test("00000010111001101010011010110011", "mulhsu x13, x13, x14"),
);

Deno.test("decode - mulhsu instruction 19", () =>
    decode_test("00000011000110000010011110110011", "mulhsu x15, x16, x17"),
);

Deno.test("decode - mulhsu instruction 20", () =>
    decode_test("00000011101011001010110000110011", "mulhsu x24, x25, x26"),
);

Deno.test("decode - mulhsu instruction 21", () =>
    decode_test("00000010111001101010011010110011", "mulhsu x13, x13, x14"),
);

Deno.test("decode - mulhsu instruction 22", () =>
    decode_test("00000011011010111010101100110011", "mulhsu x22, x23, x22"),
);

Deno.test("decode - mulhsu instruction 23", () =>
    decode_test("00000011111100001010100100110011", "mulhsu x18, x1, x31"),
);

Deno.test("decode - mulhsu instruction 24", () =>
    decode_test("00000010000111111010100110110011", "mulhsu x19, x31, x1"),
);

Deno.test("decode - mulhsu instruction 25", () =>
    decode_test("00000010001011101010111010110011", "mulhsu x29, x29, x2"),
);

Deno.test("decode - mulhsu instruction 26", () =>
    decode_test("00000010101100010010010110110011", "mulhsu x11, x2, x11"),
);

Deno.test("decode - mulhsu instruction 27", () =>
    decode_test("00000010100101001010010010110011", "mulhsu x9, x9, x9"),
);
