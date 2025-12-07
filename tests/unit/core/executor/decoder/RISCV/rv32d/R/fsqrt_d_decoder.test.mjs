import { decode_test } from "../../common.mjs";
Deno.test("decode - fsqrt.d instruction 1", () =>
    decode_test("01011010000000001000000001010011", "fsqrt.d f0, f1, rne"),
);

Deno.test("decode - fsqrt.d instruction 2", () =>
    decode_test("01011010000000101001001001010011", "fsqrt.d f4, f5, rtz"),
);

Deno.test("decode - fsqrt.d instruction 3", () =>
    decode_test("01011010000001001010010001010011", "fsqrt.d f8, f9, rdn"),
);

Deno.test("decode - fsqrt.d instruction 4", () =>
    decode_test("01011010000001101011011001010011", "fsqrt.d f12, f13, rup"),
);

Deno.test("decode - fsqrt.d instruction 5", () =>
    decode_test("01011010000010001100100001010011", "fsqrt.d f16, f17, rmm"),
);

Deno.test("decode - fsqrt.d instruction 6", () =>
    decode_test("01011010000010101111101001010011", "fsqrt.d f20, f21"),
);

Deno.test("decode - fsqrt.d instruction 7", () =>
    decode_test("01011010000000000111000001010011", "fsqrt.d f0, f0"),
);

Deno.test("decode - fsqrt.d instruction 8", () =>
    decode_test("01011010000011111111111111010011", "fsqrt.d f31, f31"),
);

Deno.test("decode - fsqrt.d instruction 9", () =>
    decode_test("01011010000011111111000001010011", "fsqrt.d f0, f31"),
);

Deno.test("decode - fsqrt.d instruction 10", () =>
    decode_test("01011010000000000111111111010011", "fsqrt.d f31, f0"),
);

Deno.test("decode - fsqrt.d instruction 11", () =>
    decode_test("01011010000000010111000011010011", "fsqrt.d f1, f2"),
);

Deno.test("decode - fsqrt.d instruction 12", () =>
    decode_test("01011010000010100111010101010011", "fsqrt.d f10, f20"),
);

Deno.test("decode - fsqrt.d instruction 13", () =>
    decode_test("01011010000001110111001111010011", "fsqrt.d f7, f14"),
);

Deno.test("decode - fsqrt.d instruction 14", () =>
    decode_test("01011010000001010001101001010011", "fsqrt.d f20, f10, rtz"),
);

Deno.test("decode - fsqrt.d instruction 15", () =>
    decode_test("01011010000000101010110011010011", "fsqrt.d f25, f5, rdn"),
);

Deno.test("decode - fsqrt.d instruction 16", () =>
    decode_test("01011010000011000011100001010011", "fsqrt.d f16, f24, rup"),
);

Deno.test("decode - fsqrt.d instruction 17", () =>
    decode_test("01011010000000000100111111010011", "fsqrt.d f31, f0, rmm"),
);

Deno.test("decode - fsqrt.d instruction 18", () =>
    decode_test("01011010000010110111101101010011", "fsqrt.d f22, f22"),
);

Deno.test("decode - fsqrt.d instruction 19", () =>
    decode_test("01011010000000011111000111010011", "fsqrt.d f3, f3"),
);

Deno.test("decode - fsqrt.d instruction 20", () =>
    decode_test("01011010000000010111111011010011", "fsqrt.d f29, f2"),
);
