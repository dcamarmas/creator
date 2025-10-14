import { decode_test } from "../../common.mjs";
Deno.test("decode - fcvt.wu.d instruction 1", () =>
    decode_test("11000010000100001000000001010011", "fcvt.wu.d x0, f1, rne"),
);

Deno.test("decode - fcvt.wu.d instruction 2", () =>
    decode_test("11000010000100101001001001010011", "fcvt.wu.d x4, f5, rtz"),
);

Deno.test("decode - fcvt.wu.d instruction 3", () =>
    decode_test("11000010000101001010010001010011", "fcvt.wu.d x8, f9, rdn"),
);

Deno.test("decode - fcvt.wu.d instruction 4", () =>
    decode_test("11000010000101101011011001010011", "fcvt.wu.d x12, f13, rup"),
);

Deno.test("decode - fcvt.wu.d instruction 5", () =>
    decode_test("11000010000110001100100001010011", "fcvt.wu.d x16, f17, rmm"),
);

Deno.test("decode - fcvt.wu.d instruction 6", () =>
    decode_test("11000010000110101111101001010011", "fcvt.wu.d x20, f21"),
);

Deno.test("decode - fcvt.wu.d instruction 7", () =>
    decode_test("11000010000100000111000001010011", "fcvt.wu.d x0, f0"),
);

Deno.test("decode - fcvt.wu.d instruction 8", () =>
    decode_test("11000010000111111111111111010011", "fcvt.wu.d x31, f31"),
);

Deno.test("decode - fcvt.wu.d instruction 9", () =>
    decode_test("11000010000111111111000001010011", "fcvt.wu.d x0, f31"),
);

Deno.test("decode - fcvt.wu.d instruction 10", () =>
    decode_test("11000010000100000111111111010011", "fcvt.wu.d x31, f0"),
);

Deno.test("decode - fcvt.wu.d instruction 11", () =>
    decode_test("11000010000100010111000011010011", "fcvt.wu.d x1, f2"),
);

Deno.test("decode - fcvt.wu.d instruction 12", () =>
    decode_test("11000010000110100111010101010011", "fcvt.wu.d x10, f20"),
);

Deno.test("decode - fcvt.wu.d instruction 13", () =>
    decode_test("11000010000100111111111101010011", "fcvt.wu.d x30, f7"),
);

Deno.test("decode - fcvt.wu.d instruction 14", () =>
    decode_test("11000010000101010001101001010011", "fcvt.wu.d x20, f10, rtz"),
);

Deno.test("decode - fcvt.wu.d instruction 15", () =>
    decode_test("11000010000100101010110011010011", "fcvt.wu.d x25, f5, rdn"),
);

Deno.test("decode - fcvt.wu.d instruction 16", () =>
    decode_test("11000010000111000011100001010011", "fcvt.wu.d x16, f24, rup"),
);

Deno.test("decode - fcvt.wu.d instruction 17", () =>
    decode_test("11000010000101111100111111010011", "fcvt.wu.d x31, f15, rmm"),
);

Deno.test("decode - fcvt.wu.d instruction 18", () =>
    decode_test("11000010000110110111101101010011", "fcvt.wu.d x22, f22"),
);

Deno.test("decode - fcvt.wu.d instruction 19", () =>
    decode_test("11000010000100011111000111010011", "fcvt.wu.d x3, f3"),
);

Deno.test("decode - fcvt.wu.d instruction 20", () =>
    decode_test("11000010000100010111111011010011", "fcvt.wu.d x29, f2"),
);
