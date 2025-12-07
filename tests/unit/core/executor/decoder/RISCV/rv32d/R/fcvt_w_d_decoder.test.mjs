import { decode_test } from "../../common.mjs";
Deno.test("decode - fcvt.w.d instruction 1", () =>
    decode_test("11000010000000001000000001010011", "fcvt.w.d x0, f1, rne"),
);

Deno.test("decode - fcvt.w.d instruction 2", () =>
    decode_test("11000010000000101001001001010011", "fcvt.w.d x4, f5, rtz"),
);

Deno.test("decode - fcvt.w.d instruction 3", () =>
    decode_test("11000010000001001010010001010011", "fcvt.w.d x8, f9, rdn"),
);

Deno.test("decode - fcvt.w.d instruction 4", () =>
    decode_test("11000010000001101011011001010011", "fcvt.w.d x12, f13, rup"),
);

Deno.test("decode - fcvt.w.d instruction 5", () =>
    decode_test("11000010000010001100100001010011", "fcvt.w.d x16, f17, rmm"),
);

Deno.test("decode - fcvt.w.d instruction 6", () =>
    decode_test("11000010000010101111101001010011", "fcvt.w.d x20, f21"),
);

Deno.test("decode - fcvt.w.d instruction 7", () =>
    decode_test("11000010000000000111000001010011", "fcvt.w.d x0, f0"),
);

Deno.test("decode - fcvt.w.d instruction 8", () =>
    decode_test("11000010000011111111111111010011", "fcvt.w.d x31, f31"),
);

Deno.test("decode - fcvt.w.d instruction 9", () =>
    decode_test("11000010000011111111000001010011", "fcvt.w.d x0, f31"),
);

Deno.test("decode - fcvt.w.d instruction 10", () =>
    decode_test("11000010000000000111111111010011", "fcvt.w.d x31, f0"),
);

Deno.test("decode - fcvt.w.d instruction 11", () =>
    decode_test("11000010000000010111000011010011", "fcvt.w.d x1, f2"),
);

Deno.test("decode - fcvt.w.d instruction 12", () =>
    decode_test("11000010000010100111010101010011", "fcvt.w.d x10, f20"),
);

Deno.test("decode - fcvt.w.d instruction 13", () =>
    decode_test("11000010000000111111111101010011", "fcvt.w.d x30, f7"),
);

Deno.test("decode - fcvt.w.d instruction 14", () =>
    decode_test("11000010000001010001101001010011", "fcvt.w.d x20, f10, rtz"),
);

Deno.test("decode - fcvt.w.d instruction 15", () =>
    decode_test("11000010000000101010110011010011", "fcvt.w.d x25, f5, rdn"),
);

Deno.test("decode - fcvt.w.d instruction 16", () =>
    decode_test("11000010000011000011100001010011", "fcvt.w.d x16, f24, rup"),
);

Deno.test("decode - fcvt.w.d instruction 17", () =>
    decode_test("11000010000001111100111111010011", "fcvt.w.d x31, f15, rmm"),
);

Deno.test("decode - fcvt.w.d instruction 18", () =>
    decode_test("11000010000010110111101101010011", "fcvt.w.d x22, f22"),
);

Deno.test("decode - fcvt.w.d instruction 19", () =>
    decode_test("11000010000000011111000111010011", "fcvt.w.d x3, f3"),
);

Deno.test("decode - fcvt.w.d instruction 20", () =>
    decode_test("11000010000000010111111011010011", "fcvt.w.d x29, f2"),
);
