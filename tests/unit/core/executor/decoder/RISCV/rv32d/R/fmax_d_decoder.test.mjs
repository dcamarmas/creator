import { decode_test } from "../../common.mjs";
Deno.test("decode - fmax.d instruction 1", () =>
    decode_test("00101010001000001001000001010011", "fmax.d f0, f1, f2"),
);

Deno.test("decode - fmax.d instruction 2", () =>
    decode_test("00101010010100100001000111010011", "fmax.d f3, f4, f5"),
);

Deno.test("decode - fmax.d instruction 3", () =>
    decode_test("00101010000000000001000001010011", "fmax.d f0, f0, f0"),
);

Deno.test("decode - fmax.d instruction 4", () =>
    decode_test("00101011111111111001111111010011", "fmax.d f31, f31, f31"),
);

Deno.test("decode - fmax.d instruction 5", () =>
    decode_test("00101011111100000001000001010011", "fmax.d f0, f0, f31"),
);

Deno.test("decode - fmax.d instruction 6", () =>
    decode_test("00101010000011111001111111010011", "fmax.d f31, f31, f0"),
);

Deno.test("decode - fmax.d instruction 7", () =>
    decode_test("00101010000011111001000001010011", "fmax.d f0, f31, f0"),
);

Deno.test("decode - fmax.d instruction 8", () =>
    decode_test("00101011111100000001111111010011", "fmax.d f31, f0, f31"),
);

Deno.test("decode - fmax.d instruction 9", () =>
    decode_test("00101010001100010001000011010011", "fmax.d f1, f2, f3"),
);

Deno.test("decode - fmax.d instruction 10", () =>
    decode_test("00101011111010100001010101010011", "fmax.d f10, f20, f30"),
);

Deno.test("decode - fmax.d instruction 11", () =>
    decode_test("00101011010101110001001111010011", "fmax.d f7, f14, f21"),
);

Deno.test("decode - fmax.d instruction 12", () =>
    decode_test("00101010011100110001001101010011", "fmax.d f6, f6, f7"),
);

Deno.test("decode - fmax.d instruction 13", () =>
    decode_test("00101010100001001001010001010011", "fmax.d f8, f9, f8"),
);

Deno.test("decode - fmax.d instruction 14", () =>
    decode_test("00101010101001010001010101010011", "fmax.d f10, f10, f10"),
);

Deno.test("decode - fmax.d instruction 15", () =>
    decode_test("00101011000110000001011111010011", "fmax.d f15, f16, f17"),
);

Deno.test("decode - fmax.d instruction 16", () =>
    decode_test("00101011101011001001110001010011", "fmax.d f24, f25, f26"),
);

Deno.test("decode - fmax.d instruction 17", () =>
    decode_test("00101010111001101001011011010011", "fmax.d f13, f13, f14"),
);

Deno.test("decode - fmax.d instruction 18", () =>
    decode_test("00101011011010111001101101010011", "fmax.d f22, f23, f22"),
);

Deno.test("decode - fmax.d instruction 19", () =>
    decode_test("00101011111000001001100101010011", "fmax.d f18, f1, f30"),
);

Deno.test("decode - fmax.d instruction 20", () =>
    decode_test("00101010000111111001100111010011", "fmax.d f19, f31, f1"),
);

Deno.test("decode - fmax.d instruction 21", () =>
    decode_test("00101010001011101001111011010011", "fmax.d f29, f29, f2"),
);

Deno.test("decode - fmax.d instruction 22", () =>
    decode_test("00101010101100010001010111010011", "fmax.d f11, f2, f11"),
);
