import { decode_test } from "../../common.mjs";

Deno.test("decode - fcvt.w.s instruction 1", () =>
    decode_test("11000000000000001000000001010011", "fcvt.w.s x0, f1, rne"),
);

Deno.test("decode - fcvt.w.s instruction 2", () =>
    decode_test("11000000000000101001001001010011", "fcvt.w.s x4, f5, rtz"),
);

Deno.test("decode - fcvt.w.s instruction 3", () =>
    decode_test("11000000000001001010010001010011", "fcvt.w.s x8, f9, rdn"),
);

Deno.test("decode - fcvt.w.s instruction 4", () =>
    decode_test("11000000000001101011011001010011", "fcvt.w.s x12, f13, rup"),
);

Deno.test("decode - fcvt.w.s instruction 5", () =>
    decode_test("11000000000010001100100001010011", "fcvt.w.s x16, f17, rmm"),
);

Deno.test("decode - fcvt.w.s instruction 6", () =>
    decode_test("11000000000010101111101001010011", "fcvt.w.s x20, f21"),
);

Deno.test("decode - fcvt.w.s instruction 7", () =>
    decode_test("11000000000000000111000001010011", "fcvt.w.s x0, f0"),
);

Deno.test("decode - fcvt.w.s instruction 8", () =>
    decode_test("11000000000011111111111111010011", "fcvt.w.s x31, f31"),
);

Deno.test("decode - fcvt.w.s instruction 9", () =>
    decode_test("11000000000011111111000001010011", "fcvt.w.s x0, f31"),
);

Deno.test("decode - fcvt.w.s instruction 10", () =>
    decode_test("11000000000000000111111111010011", "fcvt.w.s x31, f0"),
);

Deno.test("decode - fcvt.w.s instruction 11", () =>
    decode_test("11000000000000010111000011010011", "fcvt.w.s x1, f2"),
);

Deno.test("decode - fcvt.w.s instruction 12", () =>
    decode_test("11000000000010100111010101010011", "fcvt.w.s x10, f20"),
);

Deno.test("decode - fcvt.w.s instruction 13", () =>
    decode_test("11000000000000111111111101010011", "fcvt.w.s x30, f7"),
);

Deno.test("decode - fcvt.w.s instruction 14", () =>
    decode_test("11000000000001010001101001010011", "fcvt.w.s x20, f10, rtz"),
);

Deno.test("decode - fcvt.w.s instruction 15", () =>
    decode_test("11000000000000101010110011010011", "fcvt.w.s x25, f5, rdn"),
);

Deno.test("decode - fcvt.w.s instruction 16", () =>
    decode_test("11000000000011000011100001010011", "fcvt.w.s x16, f24, rup"),
);

Deno.test("decode - fcvt.w.s instruction 17", () =>
    decode_test("11000000000001111100111111010011", "fcvt.w.s x31, f15, rmm"),
);

Deno.test("decode - fcvt.w.s instruction 18", () =>
    decode_test("11000000000010110111101101010011", "fcvt.w.s x22, f22"),
);

Deno.test("decode - fcvt.w.s instruction 19", () =>
    decode_test("11000000000000011111000111010011", "fcvt.w.s x3, f3"),
);

Deno.test("decode - fcvt.w.s instruction 20", () =>
    decode_test("11000000000000010111111011010011", "fcvt.w.s x29, f2"),
);
