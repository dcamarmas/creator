import { decode_test } from "../../common.mjs";

Deno.test("decode - jal instruction 1", () =>
    decode_test("00000000000000000000000001101111", "jal x0, 0"),
);

Deno.test("decode - jal instruction 2", () =>
    decode_test("00000000000000000000000011101111", "jal x1, 0"),
);

Deno.test("decode - jal instruction 3", () =>
    decode_test("00000000000000000000000101101111", "jal x2, 0"),
);

Deno.test("decode - jal instruction 4", () =>
    decode_test("00000000000000000000000111101111", "jal x3, 0"),
);

Deno.test("decode - jal instruction 5", () =>
    decode_test("00000000000000000000001001101111", "jal x4, 0"),
);

Deno.test("decode - jal instruction 6", () =>
    decode_test("00000000000000000000001011101111", "jal x5, 0"),
);

Deno.test("decode - jal instruction 7", () =>
    decode_test("00000000000000000000001101101111", "jal x6, 0"),
);

Deno.test("decode - jal instruction 8", () =>
    decode_test("00000000000000000000001111101111", "jal x7, 0"),
);

Deno.test("decode - jal instruction 9", () =>
    decode_test("00000000000000000000010001101111", "jal x8, 0"),
);

Deno.test("decode - jal instruction 10", () =>
    decode_test("00000000000000000000010011101111", "jal x9, 0"),
);

Deno.test("decode - jal instruction 11", () =>
    decode_test("00000000000000000000010101101111", "jal x10, 0"),
);

Deno.test("decode - jal instruction 12", () =>
    decode_test("00000000000000000000010111101111", "jal x11, 0"),
);

Deno.test("decode - jal instruction 13", () =>
    decode_test("00000000000000000000011001101111", "jal x12, 0"),
);

Deno.test("decode - jal instruction 14", () =>
    decode_test("00000000000000000000011011101111", "jal x13, 0"),
);

Deno.test("decode - jal instruction 15", () =>
    decode_test("00000000000000000000011101101111", "jal x14, 0"),
);

Deno.test("decode - jal instruction 16", () =>
    decode_test("00000000000000000000011111101111", "jal x15, 0"),
);

Deno.test("decode - jal instruction 17", () =>
    decode_test("00000000000000000000100001101111", "jal x16, 0"),
);

Deno.test("decode - jal instruction 18", () =>
    decode_test("00000000000000000000100011101111", "jal x17, 0"),
);

Deno.test("decode - jal instruction 19", () =>
    decode_test("00000000000000000000100101101111", "jal x18, 0"),
);

Deno.test("decode - jal instruction 20", () =>
    decode_test("00000000000000000000100111101111", "jal x19, 0"),
);

Deno.test("decode - jal instruction 21", () =>
    decode_test("00000000000000000000101001101111", "jal x20, 0"),
);

Deno.test("decode - jal instruction 22", () =>
    decode_test("00000000000000000000101011101111", "jal x21, 0"),
);

Deno.test("decode - jal instruction 23", () =>
    decode_test("00000000000000000000101101101111", "jal x22, 0"),
);

Deno.test("decode - jal instruction 24", () =>
    decode_test("00000000000000000000101111101111", "jal x23, 0"),
);

Deno.test("decode - jal instruction 25", () =>
    decode_test("00000000000000000000110001101111", "jal x24, 0"),
);

Deno.test("decode - jal instruction 26", () =>
    decode_test("00000000000000000000110011101111", "jal x25, 0"),
);

Deno.test("decode - jal instruction 27", () =>
    decode_test("00000000000000000000110101101111", "jal x26, 0"),
);

Deno.test("decode - jal instruction 28", () =>
    decode_test("00000000000000000000110111101111", "jal x27, 0"),
);

Deno.test("decode - jal instruction 29", () =>
    decode_test("00000000000000000000111001101111", "jal x28, 0"),
);

Deno.test("decode - jal instruction 30", () =>
    decode_test("00000000000000000000111011101111", "jal x29, 0"),
);

Deno.test("decode - jal instruction 31", () =>
    decode_test("00000000000000000000111101101111", "jal x30, 0"),
);

Deno.test("decode - jal instruction 32", () =>
    decode_test("00000000000000000000111111101111", "jal x31, 0"),
);

Deno.test("decode - jal instruction 33", () =>
    decode_test("00000000001000000000000001101111", "jal x0, 2"),
);

Deno.test("decode - jal instruction 34", () =>
    decode_test("11111111111111111111000001101111", "jal x0, -2"),
);

Deno.test("decode - jal instruction 35", () =>
    decode_test("01111111111111111111000001101111", "jal x0, 1048574"),
);

Deno.test("decode - jal instruction 36", () =>
    decode_test("10000000000000000000000001101111", "jal x0, -1048576"),
);

Deno.test("decode - jal instruction 37", () =>
    decode_test("01101010000000011000000001101111", "jal x0, 100000"),
);

Deno.test("decode - jal instruction 38", () =>
    decode_test("10010110000111100111000001101111", "jal x0, -100000"),
);
