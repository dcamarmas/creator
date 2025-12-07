import { decode_test } from "../../common.mjs";

Deno.test("decode - lbu instruction 1", () =>
    decode_test("00000000000000000100000000000011", "lbu x0, 0(x0)"),
);

Deno.test("decode - lbu instruction 2", () =>
    decode_test("00000000000000001100000010000011", "lbu x1, 0(x1)"),
);

Deno.test("decode - lbu instruction 3", () =>
    decode_test("00000000000100010100000100000011", "lbu x2, 1(x2)"),
);

Deno.test("decode - lbu instruction 4", () =>
    decode_test("11111111111100011100000110000011", "lbu x3, -1(x3)"),
);

Deno.test("decode - lbu instruction 5", () =>
    decode_test("01111111111100100100001000000011", "lbu x4, 2047(x4)"),
);

Deno.test("decode - lbu instruction 6", () =>
    decode_test("10000000000000101100001010000011", "lbu x5, -2048(x5)"),
);

Deno.test("decode - lbu instruction 7", () =>
    decode_test("00000000000000111100001100000011", "lbu x6, 0(x7)"),
);

Deno.test("decode - lbu instruction 8", () =>
    decode_test("00000000000011110100111110000011", "lbu x31, 0(x30)"),
);

Deno.test("decode - lbu instruction 9", () =>
    decode_test("01000000000010000100011110000011", "lbu x15, 1024(x16)"),
);

Deno.test("decode - lbu instruction 10", () =>
    decode_test("11000000000010101100101000000011", "lbu x20, -1024(x21)"),
);

Deno.test("decode - lbu instruction 11", () =>
    decode_test("00000000000000000100010100000011", "lbu x10, 0(x0)"),
);

Deno.test("decode - lbu instruction 12", () =>
    decode_test("00000010101001001100010000000011", "lbu x8, 42(x9)"),
);
