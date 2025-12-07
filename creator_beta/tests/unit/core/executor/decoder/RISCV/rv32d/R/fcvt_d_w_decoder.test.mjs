import { decode_test } from "../../common.mjs";
Deno.test("decode - fcvt.d.w instruction 1", () =>
    decode_test("11010010000000001000000001010011", "fcvt.d.w f0, x1"),
);

Deno.test("decode - fcvt.d.w instruction 2", () =>
    decode_test("11010010000000101000001001010011", "fcvt.d.w f4, x5"),
);

Deno.test("decode - fcvt.d.w instruction 3", () =>
    decode_test("11010010000001001000010001010011", "fcvt.d.w f8, x9"),
);

Deno.test("decode - fcvt.d.w instruction 4", () =>
    decode_test("11010010000001101000011001010011", "fcvt.d.w f12, x13"),
);

Deno.test("decode - fcvt.d.w instruction 5", () =>
    decode_test("11010010000010001000100001010011", "fcvt.d.w f16, x17"),
);

Deno.test("decode - fcvt.d.w instruction 6", () =>
    decode_test("11010010000000000000000001010011", "fcvt.d.w f0, x0"),
);

Deno.test("decode - fcvt.d.w instruction 7", () =>
    decode_test("11010010000011111000111111010011", "fcvt.d.w f31, x31"),
);

Deno.test("decode - fcvt.d.w instruction 8", () =>
    decode_test("11010010000011111000000001010011", "fcvt.d.w f0, x31"),
);

Deno.test("decode - fcvt.d.w instruction 9", () =>
    decode_test("11010010000000000000111111010011", "fcvt.d.w f31, x0"),
);

Deno.test("decode - fcvt.d.w instruction 10", () =>
    decode_test("11010010000000010000000011010011", "fcvt.d.w f1, x2"),
);

Deno.test("decode - fcvt.d.w instruction 11", () =>
    decode_test("11010010000010100000010101010011", "fcvt.d.w f10, x20"),
);

Deno.test("decode - fcvt.d.w instruction 12", () =>
    decode_test("11010010000000111000111101010011", "fcvt.d.w f30, x7"),
);

Deno.test("decode - fcvt.d.w instruction 13", () =>
    decode_test("11010010000001010000101001010011", "fcvt.d.w f20, x10"),
);

Deno.test("decode - fcvt.d.w instruction 14", () =>
    decode_test("11010010000000101000110011010011", "fcvt.d.w f25, x5"),
);

Deno.test("decode - fcvt.d.w instruction 15", () =>
    decode_test("11010010000011000000100001010011", "fcvt.d.w f16, x24"),
);

Deno.test("decode - fcvt.d.w instruction 16", () =>
    decode_test("11010010000001111000111111010011", "fcvt.d.w f31, x15"),
);

Deno.test("decode - fcvt.d.w instruction 17", () =>
    decode_test("11010010000010110000101101010011", "fcvt.d.w f22, x22"),
);

Deno.test("decode - fcvt.d.w instruction 18", () =>
    decode_test("11010010000000011000000111010011", "fcvt.d.w f3, x3"),
);

Deno.test("decode - fcvt.d.w instruction 19", () =>
    decode_test("11010010000000010000111011010011", "fcvt.d.w f29, x2"),
);
