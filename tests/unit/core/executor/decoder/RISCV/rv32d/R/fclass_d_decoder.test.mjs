import { decode_test } from "../../common.mjs";
Deno.test("decode - fclass.d instruction 1", () =>
    decode_test("11100010000000001001000001010011", "fclass.d x0, f1"),
);

Deno.test("decode - fclass.d instruction 2", () =>
    decode_test("11100010000000101001001001010011", "fclass.d x4, f5"),
);

Deno.test("decode - fclass.d instruction 3", () =>
    decode_test("11100010000000000001000001010011", "fclass.d x0, f0"),
);

Deno.test("decode - fclass.d instruction 4", () =>
    decode_test("11100010000011111001111111010011", "fclass.d x31, f31"),
);

Deno.test("decode - fclass.d instruction 5", () =>
    decode_test("11100010000000000001011111010011", "fclass.d x15, f0"),
);

Deno.test("decode - fclass.d instruction 6", () =>
    decode_test("11100010000011111001100001010011", "fclass.d x16, f31"),
);

Deno.test("decode - fclass.d instruction 7", () =>
    decode_test("11100010000000010001000011010011", "fclass.d x1, f2"),
);

Deno.test("decode - fclass.d instruction 8", () =>
    decode_test("11100010000010100001010101010011", "fclass.d x10, f20"),
);

Deno.test("decode - fclass.d instruction 9", () =>
    decode_test("11100010000000111001111101010011", "fclass.d x30, f7"),
);

Deno.test("decode - fclass.d instruction 10", () =>
    decode_test("11100010000000011001000111010011", "fclass.d x3, f3"),
);

Deno.test("decode - fclass.d instruction 11", () =>
    decode_test("11100010000001100001011001010011", "fclass.d x12, f12"),
);

Deno.test("decode - fclass.d instruction 12", () =>
    decode_test("11100010000010110001101101010011", "fclass.d x22, f22"),
);

Deno.test("decode - fclass.d instruction 13", () =>
    decode_test("11100010000010000001011111010011", "fclass.d x15, f16"),
);

Deno.test("decode - fclass.d instruction 14", () =>
    decode_test("11100010000011001001110001010011", "fclass.d x24, f25"),
);

Deno.test("decode - fclass.d instruction 15", () =>
    decode_test("11100010000000010001111011010011", "fclass.d x29, f2"),
);

Deno.test("decode - fclass.d instruction 16", () =>
    decode_test("11100010000011010001001011010011", "fclass.d x5, f26"),
);

Deno.test("decode - fclass.d instruction 17", () =>
    decode_test("11100010000001000001100011010011", "fclass.d x17, f8"),
);

Deno.test("decode - fclass.d instruction 18", () =>
    decode_test("11100010000010011001100111010011", "fclass.d x19, f19"),
);
