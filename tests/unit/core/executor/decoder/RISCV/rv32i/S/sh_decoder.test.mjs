import { decode_test } from "../../common.mjs";

Deno.test("decode - sh instruction 1", () =>
    decode_test("00000000000000000001000000100011", "sh x0, 0(x0)"),
);

Deno.test("decode - sh instruction 2", () =>
    decode_test("00000000000100001001000000100011", "sh x1, 0(x1)"),
);

Deno.test("decode - sh instruction 3", () =>
    decode_test("00000000001000010001000010100011", "sh x2, 1(x2)"),
);

Deno.test("decode - sh instruction 4", () =>
    decode_test("11111110001100011001111110100011", "sh x3, -1(x3)"),
);

Deno.test("decode - sh instruction 5", () =>
    decode_test("01111110010000100001111110100011", "sh x4, 2047(x4)"),
);

Deno.test("decode - sh instruction 6", () =>
    decode_test("10000000010100101001000000100011", "sh x5, -2048(x5)"),
);

Deno.test("decode - sh instruction 7", () =>
    decode_test("00000000011000111001000000100011", "sh x6, 0(x7)"),
);

Deno.test("decode - sh instruction 8", () =>
    decode_test("00000001111111110001000000100011", "sh x31, 0(x30)"),
);

Deno.test("decode - sh instruction 9", () =>
    decode_test("01000000111110000001000000100011", "sh x15, 1024(x16)"),
);

Deno.test("decode - sh instruction 10", () =>
    decode_test("11000001010010101001000000100011", "sh x20, -1024(x21)"),
);

Deno.test("decode - sh instruction 11", () =>
    decode_test("00000000101000000001000000100011", "sh x10, 0(x0)"),
);

Deno.test("decode - sh instruction 12", () =>
    decode_test("00000010100001001001010100100011", "sh x8, 42(x9)"),
);
