import { decode_test } from "../../common.mjs";

Deno.test("decode - fmv.w.x instruction 1", () =>
    decode_test("11110000000000001000000001010011", "fmv.w.x f0, x1"),
);

Deno.test("decode - fmv.w.x instruction 2", () =>
    decode_test("11110000000000101000001001010011", "fmv.w.x f4, x5"),
);

Deno.test("decode - fmv.w.x instruction 3", () =>
    decode_test("11110000000000000000000001010011", "fmv.w.x f0, x0"),
);

Deno.test("decode - fmv.w.x instruction 4", () =>
    decode_test("11110000000011111000111111010011", "fmv.w.x f31, x31"),
);

Deno.test("decode - fmv.w.x instruction 5", () =>
    decode_test("11110000000011111000000001010011", "fmv.w.x f0, x31"),
);

Deno.test("decode - fmv.w.x instruction 6", () =>
    decode_test("11110000000000000000111111010011", "fmv.w.x f31, x0"),
);

Deno.test("decode - fmv.w.x instruction 7", () =>
    decode_test("11110000000000010000000011010011", "fmv.w.x f1, x2"),
);

Deno.test("decode - fmv.w.x instruction 8", () =>
    decode_test("11110000000010100000010101010011", "fmv.w.x f10, x20"),
);

Deno.test("decode - fmv.w.x instruction 9", () =>
    decode_test("11110000000000111000111101010011", "fmv.w.x f30, x7"),
);

Deno.test("decode - fmv.w.x instruction 10", () =>
    decode_test("11110000000000011000000111010011", "fmv.w.x f3, x3"),
);

Deno.test("decode - fmv.w.x instruction 11", () =>
    decode_test("11110000000001100000011001010011", "fmv.w.x f12, x12"),
);

Deno.test("decode - fmv.w.x instruction 12", () =>
    decode_test("11110000000010110000101101010011", "fmv.w.x f22, x22"),
);

Deno.test("decode - fmv.w.x instruction 13", () =>
    decode_test("11110000000010000000011111010011", "fmv.w.x f15, x16"),
);

Deno.test("decode - fmv.w.x instruction 14", () =>
    decode_test("11110000000011001000110001010011", "fmv.w.x f24, x25"),
);

Deno.test("decode - fmv.w.x instruction 15", () =>
    decode_test("11110000000000010000111011010011", "fmv.w.x f29, x2"),
);

Deno.test("decode - fmv.w.x instruction 16", () =>
    decode_test("11110000000011010000001011010011", "fmv.w.x f5, x26"),
);

Deno.test("decode - fmv.w.x instruction 17", () =>
    decode_test("11110000000001000000100011010011", "fmv.w.x f17, x8"),
);
