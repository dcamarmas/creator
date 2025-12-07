import { decode_test } from "../../common.mjs";

Deno.test("decode - fcvt.wu.s instruction 1", () =>
    decode_test("11000000000100001000000001010011", "fcvt.wu.s x0, f1, rne"),
);

Deno.test("decode - fcvt.wu.s instruction 2", () =>
    decode_test("11000000000100101001001001010011", "fcvt.wu.s x4, f5, rtz"),
);

Deno.test("decode - fcvt.wu.s instruction 3", () =>
    decode_test("11000000000101001010010001010011", "fcvt.wu.s x8, f9, rdn"),
);

Deno.test("decode - fcvt.wu.s instruction 4", () =>
    decode_test("11000000000101101011011001010011", "fcvt.wu.s x12, f13, rup"),
);

Deno.test("decode - fcvt.wu.s instruction 5", () =>
    decode_test("11000000000110001100100001010011", "fcvt.wu.s x16, f17, rmm"),
);

Deno.test("decode - fcvt.wu.s instruction 6", () =>
    decode_test("11000000000110101111101001010011", "fcvt.wu.s x20, f21"),
);

Deno.test("decode - fcvt.wu.s instruction 7", () =>
    decode_test("11000000000100000111000001010011", "fcvt.wu.s x0, f0"),
);

Deno.test("decode - fcvt.wu.s instruction 8", () =>
    decode_test("11000000000111111111111111010011", "fcvt.wu.s x31, f31"),
);

Deno.test("decode - fcvt.wu.s instruction 9", () =>
    decode_test("11000000000111111111000001010011", "fcvt.wu.s x0, f31"),
);

Deno.test("decode - fcvt.wu.s instruction 10", () =>
    decode_test("11000000000100000111111111010011", "fcvt.wu.s x31, f0"),
);

Deno.test("decode - fcvt.wu.s instruction 11", () =>
    decode_test("11000000000100010111000011010011", "fcvt.wu.s x1, f2"),
);

Deno.test("decode - fcvt.wu.s instruction 12", () =>
    decode_test("11000000000110100111010101010011", "fcvt.wu.s x10, f20"),
);

Deno.test("decode - fcvt.wu.s instruction 13", () =>
    decode_test("11000000000100111111111101010011", "fcvt.wu.s x30, f7"),
);

Deno.test("decode - fcvt.wu.s instruction 14", () =>
    decode_test("11000000000101010001101001010011", "fcvt.wu.s x20, f10, rtz"),
);

Deno.test("decode - fcvt.wu.s instruction 15", () =>
    decode_test("11000000000100101010110011010011", "fcvt.wu.s x25, f5, rdn"),
);

Deno.test("decode - fcvt.wu.s instruction 16", () =>
    decode_test("11000000000111000011100001010011", "fcvt.wu.s x16, f24, rup"),
);

Deno.test("decode - fcvt.wu.s instruction 17", () =>
    decode_test("11000000000101111100111111010011", "fcvt.wu.s x31, f15, rmm"),
);

Deno.test("decode - fcvt.wu.s instruction 18", () =>
    decode_test("11000000000110110111101101010011", "fcvt.wu.s x22, f22"),
);

Deno.test("decode - fcvt.wu.s instruction 19", () =>
    decode_test("11000000000100011111000111010011", "fcvt.wu.s x3, f3"),
);

Deno.test("decode - fcvt.wu.s instruction 20", () =>
    decode_test("11000000000100010111111011010011", "fcvt.wu.s x29, f2"),
);
