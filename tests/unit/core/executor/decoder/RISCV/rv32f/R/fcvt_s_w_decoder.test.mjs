import { decode_test } from "../../common.mjs";

Deno.test("decode - fcvt.s.w instruction 1", () =>
    decode_test("11010000000000001000000001010011", "fcvt.s.w f0, x1, rne"),
);

Deno.test("decode - fcvt.s.w instruction 2", () =>
    decode_test("11010000000000101001001001010011", "fcvt.s.w f4, x5, rtz"),
);

Deno.test("decode - fcvt.s.w instruction 3", () =>
    decode_test("11010000000001001010010001010011", "fcvt.s.w f8, x9, rdn"),
);

Deno.test("decode - fcvt.s.w instruction 4", () =>
    decode_test("11010000000001101011011001010011", "fcvt.s.w f12, x13, rup"),
);

Deno.test("decode - fcvt.s.w instruction 5", () =>
    decode_test("11010000000010001100100001010011", "fcvt.s.w f16, x17, rmm"),
);

Deno.test("decode - fcvt.s.w instruction 6", () =>
    decode_test("11010000000010101111101001010011", "fcvt.s.w f20, x21"),
);

Deno.test("decode - fcvt.s.w instruction 7", () =>
    decode_test("11010000000000000111000001010011", "fcvt.s.w f0, x0"),
);

Deno.test("decode - fcvt.s.w instruction 8", () =>
    decode_test("11010000000011111111111111010011", "fcvt.s.w f31, x31"),
);

Deno.test("decode - fcvt.s.w instruction 9", () =>
    decode_test("11010000000011111111000001010011", "fcvt.s.w f0, x31"),
);

Deno.test("decode - fcvt.s.w instruction 10", () =>
    decode_test("11010000000000000111111111010011", "fcvt.s.w f31, x0"),
);

Deno.test("decode - fcvt.s.w instruction 11", () =>
    decode_test("11010000000000010111000011010011", "fcvt.s.w f1, x2"),
);

Deno.test("decode - fcvt.s.w instruction 12", () =>
    decode_test("11010000000010100111010101010011", "fcvt.s.w f10, x20"),
);

Deno.test("decode - fcvt.s.w instruction 13", () =>
    decode_test("11010000000000111111111101010011", "fcvt.s.w f30, x7"),
);

Deno.test("decode - fcvt.s.w instruction 14", () =>
    decode_test("11010000000001010001101001010011", "fcvt.s.w f20, x10, rtz"),
);

Deno.test("decode - fcvt.s.w instruction 15", () =>
    decode_test("11010000000000101010110011010011", "fcvt.s.w f25, x5, rdn"),
);

Deno.test("decode - fcvt.s.w instruction 16", () =>
    decode_test("11010000000011000011100001010011", "fcvt.s.w f16, x24, rup"),
);

Deno.test("decode - fcvt.s.w instruction 17", () =>
    decode_test("11010000000001111100111111010011", "fcvt.s.w f31, x15, rmm"),
);

Deno.test("decode - fcvt.s.w instruction 18", () =>
    decode_test("11010000000010110111101101010011", "fcvt.s.w f22, x22"),
);

Deno.test("decode - fcvt.s.w instruction 19", () =>
    decode_test("11010000000000011111000111010011", "fcvt.s.w f3, x3"),
);

Deno.test("decode - fcvt.s.w instruction 20", () =>
    decode_test("11010000000000010111111011010011", "fcvt.s.w f29, x2"),
);
