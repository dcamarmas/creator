import { decode_test } from "../../common.mjs";

Deno.test("decode - fmv.x.w instruction 1", () =>
    decode_test("11100000000000001000000001010011", "fmv.x.w x0, f1"),
);

Deno.test("decode - fmv.x.w instruction 2", () =>
    decode_test("11100000000000101000001001010011", "fmv.x.w x4, f5"),
);

Deno.test("decode - fmv.x.w instruction 3", () =>
    decode_test("11100000000000000000000001010011", "fmv.x.w x0, f0"),
);

Deno.test("decode - fmv.x.w instruction 4", () =>
    decode_test("11100000000011111000111111010011", "fmv.x.w x31, f31"),
);

Deno.test("decode - fmv.x.w instruction 5", () =>
    decode_test("11100000000011111000000001010011", "fmv.x.w x0, f31"),
);

Deno.test("decode - fmv.x.w instruction 6", () =>
    decode_test("11100000000000000000111111010011", "fmv.x.w x31, f0"),
);

Deno.test("decode - fmv.x.w instruction 7", () =>
    decode_test("11100000000000010000000011010011", "fmv.x.w x1, f2"),
);

Deno.test("decode - fmv.x.w instruction 8", () =>
    decode_test("11100000000010100000010101010011", "fmv.x.w x10, f20"),
);

Deno.test("decode - fmv.x.w instruction 9", () =>
    decode_test("11100000000000111000111101010011", "fmv.x.w x30, f7"),
);

Deno.test("decode - fmv.x.w instruction 10", () =>
    decode_test("11100000000000011000000111010011", "fmv.x.w x3, f3"),
);

Deno.test("decode - fmv.x.w instruction 11", () =>
    decode_test("11100000000001100000011001010011", "fmv.x.w x12, f12"),
);

Deno.test("decode - fmv.x.w instruction 12", () =>
    decode_test("11100000000010110000101101010011", "fmv.x.w x22, f22"),
);

Deno.test("decode - fmv.x.w instruction 13", () =>
    decode_test("11100000000010000000011111010011", "fmv.x.w x15, f16"),
);

Deno.test("decode - fmv.x.w instruction 14", () =>
    decode_test("11100000000011001000110001010011", "fmv.x.w x24, f25"),
);

Deno.test("decode - fmv.x.w instruction 15", () =>
    decode_test("11100000000000010000111011010011", "fmv.x.w x29, f2"),
);

Deno.test("decode - fmv.x.w instruction 16", () =>
    decode_test("11100000000011010000001011010011", "fmv.x.w x5, f26"),
);

Deno.test("decode - fmv.x.w instruction 17", () =>
    decode_test("11100000000001000000100011010011", "fmv.x.w x17, f8"),
);
