import { decode_test } from "../../common.mjs";
Deno.test("decode - fcvt.d.s instruction 1", () =>
    decode_test("01000010000000001000000001010011", "fcvt.d.s f0, f1"),
);

Deno.test("decode - fcvt.d.s instruction 2", () =>
    decode_test("01000010000000101000001001010011", "fcvt.d.s f4, f5"),
);

Deno.test("decode - fcvt.d.s instruction 3", () =>
    decode_test("01000010000001001000010001010011", "fcvt.d.s f8, f9"),
);

Deno.test("decode - fcvt.d.s instruction 4", () =>
    decode_test("01000010000001101000011001010011", "fcvt.d.s f12, f13"),
);

Deno.test("decode - fcvt.d.s instruction 5", () =>
    decode_test("01000010000010001000100001010011", "fcvt.d.s f16, f17"),
);

Deno.test("decode - fcvt.d.s instruction 6", () =>
    decode_test("01000010000000000000000001010011", "fcvt.d.s f0, f0"),
);

Deno.test("decode - fcvt.d.s instruction 7", () =>
    decode_test("01000010000011111000111111010011", "fcvt.d.s f31, f31"),
);

Deno.test("decode - fcvt.d.s instruction 8", () =>
    decode_test("01000010000011111000000001010011", "fcvt.d.s f0, f31"),
);

Deno.test("decode - fcvt.d.s instruction 9", () =>
    decode_test("01000010000000000000111111010011", "fcvt.d.s f31, f0"),
);

Deno.test("decode - fcvt.d.s instruction 10", () =>
    decode_test("01000010000000010000000011010011", "fcvt.d.s f1, f2"),
);

Deno.test("decode - fcvt.d.s instruction 11", () =>
    decode_test("01000010000010100000010101010011", "fcvt.d.s f10, f20"),
);

Deno.test("decode - fcvt.d.s instruction 12", () =>
    decode_test("01000010000000111000111101010011", "fcvt.d.s f30, f7"),
);

Deno.test("decode - fcvt.d.s instruction 13", () =>
    decode_test("01000010000001010000101001010011", "fcvt.d.s f20, f10"),
);

Deno.test("decode - fcvt.d.s instruction 14", () =>
    decode_test("01000010000000101000110011010011", "fcvt.d.s f25, f5"),
);

Deno.test("decode - fcvt.d.s instruction 15", () =>
    decode_test("01000010000011000000100001010011", "fcvt.d.s f16, f24"),
);

Deno.test("decode - fcvt.d.s instruction 16", () =>
    decode_test("01000010000001111000111111010011", "fcvt.d.s f31, f15"),
);

Deno.test("decode - fcvt.d.s instruction 17", () =>
    decode_test("01000010000010110000101101010011", "fcvt.d.s f22, f22"),
);

Deno.test("decode - fcvt.d.s instruction 18", () =>
    decode_test("01000010000000011000000111010011", "fcvt.d.s f3, f3"),
);

Deno.test("decode - fcvt.d.s instruction 19", () =>
    decode_test("01000010000000010000111011010011", "fcvt.d.s f29, f2"),
);
