import { decode_test } from "../../common.mjs";

Deno.test("decode - fnmsub.S instruction 1", () =>
    decode_test("00011000001000001000000001001011", "fnmsub.s f0, f1, f2, f3, rne"),
);

Deno.test("decode - fnmsub.S instruction 2", () =>
    decode_test("00111000011000101001001001001011", "fnmsub.s f4, f5, f6, f7, rtz"),
);

Deno.test("decode - fnmsub.S instruction 3", () =>
    decode_test(
        "01011000101001001010010001001011",
        "fnmsub.s f8, f9, f10, f11, rdn",
    ),
);

Deno.test("decode - fnmsub.S instruction 4", () =>
    decode_test(
        "01111000111001101011011001001011",
        "fnmsub.s f12, f13, f14, f15, rup",
    ),
);

Deno.test("decode - fnmsub.S instruction 5", () =>
    decode_test(
        "10011001001010001100100001001011",
        "fnmsub.s f16, f17, f18, f19, rmm",
    ),
);

Deno.test("decode - fnmsub.S instruction 6", () =>
    decode_test("00000000000000000111000001001011", "fnmsub.s f0, f0, f0, f0"),
);

Deno.test("decode - fnmsub.S instruction 7", () =>
    decode_test("11111001111111111111111111001011", "fnmsub.s f31, f31, f31, f31"),
);

Deno.test("decode - fnmsub.S instruction 8", () =>
    decode_test("11111000000011111111000001001011", "fnmsub.s f0, f31, f0, f31"),
);

Deno.test("decode - fnmsub.S instruction 9", () =>
    decode_test("00100000001100010111000011001011", "fnmsub.s f1, f2, f3, f4"),
);

Deno.test("decode - fnmsub.S instruction 10", () =>
    decode_test("01111001111010100111010101001011", "fnmsub.s f10, f20, f30, f15"),
);

Deno.test("decode - fnmsub.S instruction 11", () =>
    decode_test("11100001010101110111001111001011", "fnmsub.s f7, f14, f21, f28"),
);

Deno.test("decode - fnmsub.S instruction 12", () =>
    decode_test(
        "11110000010101010001101001001011",
        "fnmsub.s f20, f10, f5, f30, rtz",
    ),
);

Deno.test("decode - fnmsub.S instruction 13", () =>
    decode_test(
        "11001000111100101010110011001011",
        "fnmsub.s f25, f5, f15, f25, rdn",
    ),
);

Deno.test("decode - fnmsub.S instruction 14", () =>
    decode_test(
        "10000000100011000011100001001011",
        "fnmsub.s f16, f24, f8, f16, rup",
    ),
);

Deno.test("decode - fnmsub.S instruction 15", () =>
    decode_test(
        "01000001000000000100111111001011",
        "fnmsub.s f31, f0, f16, f8, rmm",
    ),
);

Deno.test("decode - fnmsub.S instruction 16", () =>
    decode_test("00001001011010110111101101001011", "fnmsub.s f22, f22, f22, f1"),
);

Deno.test("decode - fnmsub.S instruction 17", () =>
    decode_test("00011000001100011111000111001011", "fnmsub.s f3, f3, f3, f3"),
);

Deno.test("decode - fnmsub.S instruction 18", () =>
    decode_test("00010001110100010111111011001011", "fnmsub.s f29, f2, f29, f2"),
);
