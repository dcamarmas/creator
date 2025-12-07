import { decode_test } from "../../common.mjs";

Deno.test("decode - div instruction 1", () =>
    decode_test("00000010001100010100000010110011", "div x1, x2, x3"),
);

Deno.test("decode - div instruction 2", () =>
    decode_test("00000010011000101100001000110011", "div x4, x5, x6"),
);

Deno.test("decode - div instruction 3", () =>
    decode_test("00000010001000001100000000110011", "div x0, x1, x2"),
);

Deno.test("decode - div instruction 4", () =>
    decode_test("00000010010000000100000110110011", "div x3, x0, x4"),
);

Deno.test("decode - div instruction 5", () =>
    decode_test("00000010000000110100001010110011", "div x5, x6, x0"),
);

Deno.test("decode - div instruction 6", () =>
    decode_test("00000010000000000100001110110011", "div x7, x0, x0"),
);

Deno.test("decode - div instruction 7", () =>
    decode_test("00000011110111110100111110110011", "div x31, x30, x29"),
);

Deno.test("decode - div instruction 8", () =>
    decode_test("00000011111111111100111110110011", "div x31, x31, x31"),
);

Deno.test("decode - div instruction 9", () =>
    decode_test("00000011111011111100000010110011", "div x1, x31, x30"),
);

Deno.test("decode - div instruction 10", () =>
    decode_test("00000011111100011100000100110011", "div x2, x3, x31"),
);

Deno.test("decode - div instruction 11", () =>
    decode_test("00000010110001011100010100110011", "div x10, x11, x12"),
);

Deno.test("decode - div instruction 12", () =>
    decode_test("00000011111001010100101000110011", "div x20, x10, x30"),
);

Deno.test("decode - div instruction 13", () =>
    decode_test("00000011010101110100001110110011", "div x7, x14, x21"),
);

Deno.test("decode - div instruction 14", () =>
    decode_test("00000010011000101100001010110011", "div x5, x5, x6"),
);

Deno.test("decode - div instruction 15", () =>
    decode_test("00000010100001001100010000110011", "div x8, x9, x8"),
);

Deno.test("decode - div instruction 16", () =>
    decode_test("00000010101001010100010100110011", "div x10, x10, x10"),
);

Deno.test("decode - div instruction 17", () =>
    decode_test("00000010110001100100011000110011", "div x12, x12, x12"),
);

Deno.test("decode - div instruction 18", () =>
    decode_test("00000010111001101100011010110011", "div x13, x13, x14"),
);

Deno.test("decode - div instruction 19", () =>
    decode_test("00000011000110000100011110110011", "div x15, x16, x17"),
);

Deno.test("decode - div instruction 20", () =>
    decode_test("00000011101011001100110000110011", "div x24, x25, x26"),
);

Deno.test("decode - div instruction 21", () =>
    decode_test("00000010111001101100011010110011", "div x13, x13, x14"),
);

Deno.test("decode - div instruction 22", () =>
    decode_test("00000011011010111100101100110011", "div x22, x23, x22"),
);

Deno.test("decode - div instruction 23", () =>
    decode_test("00000011111100001100100100110011", "div x18, x1, x31"),
);

Deno.test("decode - div instruction 24", () =>
    decode_test("00000010000111111100100110110011", "div x19, x31, x1"),
);

Deno.test("decode - div instruction 25", () =>
    decode_test("00000010001011101100111010110011", "div x29, x29, x2"),
);

Deno.test("decode - div instruction 26", () =>
    decode_test("00000010101100010100010110110011", "div x11, x2, x11"),
);

Deno.test("decode - div instruction 27", () =>
    decode_test("00000010100101001100010010110011", "div x9, x9, x9"),
);
