import { decode_test } from "../../common.mjs";

Deno.test("decode - fclass.s instruction 1", () =>
    decode_test("11100000000000001001000001010011", "fclass.s x0, f1"),
);

Deno.test("decode - fclass.s instruction 2", () =>
    decode_test("11100000000000101001000001010011", "fclass.s x0, f5"),
);

Deno.test("decode - fclass.s instruction 3", () =>
    decode_test("11100000000000000001000001010011", "fclass.s x0, f0"),
);

Deno.test("decode - fclass.s instruction 4", () =>
    decode_test("11100000000011111001111111010011", "fclass.s x31, f31"),
);

Deno.test("decode - fclass.s instruction 5", () =>
    decode_test("11100000000000000001011111010011", "fclass.s x15, f0"),
);

Deno.test("decode - fclass.s instruction 6", () =>
    decode_test("11100000000011111001100001010011", "fclass.s x16, f31"),
);

Deno.test("decode - fclass.s instruction 7", () =>
    decode_test("11100000000000010001000011010011", "fclass.s x1, f2"),
);

Deno.test("decode - fclass.s instruction 8", () =>
    decode_test("11100000000010100001010101010011", "fclass.s x10, f20"),
);

Deno.test("decode - fclass.s instruction 9", () =>
    decode_test("11100000000000111001111101010011", "fclass.s x30, f7"),
);

Deno.test("decode - fclass.s instruction 10", () =>
    decode_test("11100000000000011001000111010011", "fclass.s x3, f3"),
);

Deno.test("decode - fclass.s instruction 11", () =>
    decode_test("11100000000001100001011001010011", "fclass.s x12, f12"),
);

Deno.test("decode - fclass.s instruction 12", () =>
    decode_test("11100000000010110001101101010011", "fclass.s x22, f22"),
);

Deno.test("decode - fclass.s instruction 13", () =>
    decode_test("11100000000010000001011111010011", "fclass.s x15, f16"),
);

Deno.test("decode - fclass.s instruction 14", () =>
    decode_test("11100000000011001001110001010011", "fclass.s x24, f25"),
);

Deno.test("decode - fclass.s instruction 15", () =>
    decode_test("11100000000000010001111011010011", "fclass.s x29, f2"),
);

Deno.test("decode - fclass.s instruction 16", () =>
    decode_test("11100000000011010001001011010011", "fclass.s x5, f26"),
);

Deno.test("decode - fclass.s instruction 17", () =>
    decode_test("11100000000001000001100011010011", "fclass.s x17, f8"),
);

Deno.test("decode - fclass.s instruction 18", () =>
    decode_test("11100000000010011001100111010011", "fclass.s x19, f19"),
);
