import { decode_test } from "../../common.mjs";
Deno.test("decode - fmadd.d instruction 1", () =>
    decode_test("00011010001000001000000001000011", "fmadd.d f0, f1, f2, f3, rne"),
);

Deno.test("decode - fmadd.d instruction 2", () =>
    decode_test("00111010011000101001001001000011", "fmadd.d f4, f5, f6, f7, rtz"),
);

Deno.test("decode - fmadd.d instruction 3", () =>
    decode_test(
        "01011010101001001010010001000011",
        "fmadd.d f8, f9, f10, f11, rdn",
    ),
);

Deno.test("decode - fmadd.d instruction 4", () =>
    decode_test(
        "01111010111001101011011001000011",
        "fmadd.d f12, f13, f14, f15, rup",
    ),
);

Deno.test("decode - fmadd.d instruction 5", () =>
    decode_test(
        "10011011001010001100100001000011",
        "fmadd.d f16, f17, f18, f19, rmm",
    ),
);

Deno.test("decode - fmadd.d instruction 6", () =>
    decode_test("00000010000000000111000001000011", "fmadd.d f0, f0, f0, f0"),
);

Deno.test("decode - fmadd.d instruction 7", () =>
    decode_test("11111011111111111111111111000011", "fmadd.d f31, f31, f31, f31"),
);

Deno.test("decode - fmadd.d instruction 8", () =>
    decode_test("11111010000011111111000001000011", "fmadd.d f0, f31, f0, f31"),
);

Deno.test("decode - fmadd.d instruction 9", () =>
    decode_test("00100010001100010111000011000011", "fmadd.d f1, f2, f3, f4"),
);

Deno.test("decode - fmadd.d instruction 10", () =>
    decode_test("01111011111010100111010101000011", "fmadd.d f10, f20, f30, f15"),
);

Deno.test("decode - fmadd.d instruction 11", () =>
    decode_test("11100011010101110111001111000011", "fmadd.d f7, f14, f21, f28"),
);

Deno.test("decode - fmadd.d instruction 12", () =>
    decode_test(
        "11110010010101010001101001000011",
        "fmadd.d f20, f10, f5, f30, rtz",
    ),
);

Deno.test("decode - fmadd.d instruction 13", () =>
    decode_test(
        "11001010111100101010110011000011",
        "fmadd.d f25, f5, f15, f25, rdn",
    ),
);

Deno.test("decode - fmadd.d instruction 14", () =>
    decode_test(
        "10000010100011000011100001000011",
        "fmadd.d f16, f24, f8, f16, rup",
    ),
);

Deno.test("decode - fmadd.d instruction 15", () =>
    decode_test(
        "01000011000000000100111111000011",
        "fmadd.d f31, f0, f16, f8, rmm",
    ),
);

Deno.test("decode - fmadd.d instruction 16", () =>
    decode_test("00001011011010110111101101000011", "fmadd.d f22, f22, f22, f1"),
);

Deno.test("decode - fmadd.d instruction 17", () =>
    decode_test("00011010001100011111000111000011", "fmadd.d f3, f3, f3, f3"),
);

Deno.test("decode - fmadd.d instruction 18", () =>
    decode_test("00010011110100010111111011000011", "fmadd.d f29, f2, f29, f2"),
);
