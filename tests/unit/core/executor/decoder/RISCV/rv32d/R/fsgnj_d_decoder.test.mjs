import { decode_test } from "../../common.mjs";
Deno.test("decode - fsgnj.d instruction 1", () =>
    decode_test("00100010001000001000000001010011", "fsgnj.d f0, f1, f2"),
);

Deno.test("decode - fsgnj.d instruction 2", () =>
    decode_test("00100010010100100000000111010011", "fsgnj.d f3, f4, f5"),
);

Deno.test("decode - fsgnj.d instruction 3", () =>
    decode_test("00100010000000000000000001010011", "fsgnj.d f0, f0, f0"),
);

Deno.test("decode - fsgnj.d instruction 4", () =>
    decode_test("00100011111111111000111111010011", "fsgnj.d f31, f31, f31"),
);

Deno.test("decode - fsgnj.d instruction 5", () =>
    decode_test("00100011111100000000000001010011", "fsgnj.d f0, f0, f31"),
);

Deno.test("decode - fsgnj.d instruction 6", () =>
    decode_test("00100010000011111000111111010011", "fsgnj.d f31, f31, f0"),
);

Deno.test("decode - fsgnj.d instruction 7", () =>
    decode_test("00100010000011111000000001010011", "fsgnj.d f0, f31, f0"),
);

Deno.test("decode - fsgnj.d instruction 8", () =>
    decode_test("00100011111100000000111111010011", "fsgnj.d f31, f0, f31"),
);

Deno.test("decode - fsgnj.d instruction 9", () =>
    decode_test("00100010001100010000000011010011", "fsgnj.d f1, f2, f3"),
);

Deno.test("decode - fsgnj.d instruction 10", () =>
    decode_test("00100011111010100000010101010011", "fsgnj.d f10, f20, f30"),
);

Deno.test("decode - fsgnj.d instruction 11", () =>
    decode_test("00100011010101110000001111010011", "fsgnj.d f7, f14, f21"),
);

Deno.test("decode - fsgnj.d instruction 12", () =>
    decode_test("00100010011100110000001101010011", "fsgnj.d f6, f6, f7"),
);

Deno.test("decode - fsgnj.d instruction 13", () =>
    decode_test("00100010100001001000010001010011", "fsgnj.d f8, f9, f8"),
);

Deno.test("decode - fsgnj.d instruction 14", () =>
    decode_test("00100010101001010000010101010011", "fsgnj.d f10, f10, f10"),
);

Deno.test("decode - fsgnj.d instruction 15", () =>
    decode_test("00100011000110000000011111010011", "fsgnj.d f15, f16, f17"),
);

Deno.test("decode - fsgnj.d instruction 16", () =>
    decode_test("00100011101011001000110001010011", "fsgnj.d f24, f25, f26"),
);

Deno.test("decode - fsgnj.d instruction 17", () =>
    decode_test("00100010111001101000011011010011", "fsgnj.d f13, f13, f14"),
);

Deno.test("decode - fsgnj.d instruction 18", () =>
    decode_test("00100011011010111000101101010011", "fsgnj.d f22, f23, f22"),
);

Deno.test("decode - fsgnj.d instruction 19", () =>
    decode_test("00100011111000001000100101010011", "fsgnj.d f18, f1, f30"),
);

Deno.test("decode - fsgnj.d instruction 20", () =>
    decode_test("00100010000111111000100111010011", "fsgnj.d f19, f31, f1"),
);

Deno.test("decode - fsgnj.d instruction 21", () =>
    decode_test("00100010001011101000111011010011", "fsgnj.d f29, f29, f2"),
);

Deno.test("decode - fsgnj.d instruction 22", () =>
    decode_test("00100010101100010000010111010011", "fsgnj.d f11, f2, f11"),
);
