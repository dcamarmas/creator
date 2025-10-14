import { decode_test } from "../../common.mjs";
Deno.test("decode - fsgnjx.d instruction 1", () =>
    decode_test("00100010001000001010000001010011", "fsgnjx.d f0, f1, f2"),
);

Deno.test("decode - fsgnjx.d instruction 2", () =>
    decode_test("00100010010100100010000111010011", "fsgnjx.d f3, f4, f5"),
);

Deno.test("decode - fsgnjx.d instruction 3", () =>
    decode_test("00100010000000000010000001010011", "fsgnjx.d f0, f0, f0"),
);

Deno.test("decode - fsgnjx.d instruction 4", () =>
    decode_test("00100011111111111010111111010011", "fsgnjx.d f31, f31, f31"),
);

Deno.test("decode - fsgnjx.d instruction 5", () =>
    decode_test("00100011111100000010000001010011", "fsgnjx.d f0, f0, f31"),
);

Deno.test("decode - fsgnjx.d instruction 6", () =>
    decode_test("00100010000011111010111111010011", "fsgnjx.d f31, f31, f0"),
);

Deno.test("decode - fsgnjx.d instruction 7", () =>
    decode_test("00100010000011111010000001010011", "fsgnjx.d f0, f31, f0"),
);

Deno.test("decode - fsgnjx.d instruction 8", () =>
    decode_test("00100011111100000010111111010011", "fsgnjx.d f31, f0, f31"),
);

Deno.test("decode - fsgnjx.d instruction 9", () =>
    decode_test("00100010001100010010000011010011", "fsgnjx.d f1, f2, f3"),
);

Deno.test("decode - fsgnjx.d instruction 10", () =>
    decode_test("00100011111010100010010101010011", "fsgnjx.d f10, f20, f30"),
);

Deno.test("decode - fsgnjx.d instruction 11", () =>
    decode_test("00100011010101110010001111010011", "fsgnjx.d f7, f14, f21"),
);

Deno.test("decode - fsgnjx.d instruction 12", () =>
    decode_test("00100010011100110010001101010011", "fsgnjx.d f6, f6, f7"),
);

Deno.test("decode - fsgnjx.d instruction 13", () =>
    decode_test("00100010100001001010010001010011", "fsgnjx.d f8, f9, f8"),
);

Deno.test("decode - fsgnjx.d instruction 14", () =>
    decode_test("00100010101001010010010101010011", "fsgnjx.d f10, f10, f10"),
);

Deno.test("decode - fsgnjx.d instruction 15", () =>
    decode_test("00100011000110000010011111010011", "fsgnjx.d f15, f16, f17"),
);

Deno.test("decode - fsgnjx.d instruction 16", () =>
    decode_test("00100011101011001010110001010011", "fsgnjx.d f24, f25, f26"),
);

Deno.test("decode - fsgnjx.d instruction 17", () =>
    decode_test("00100010111001101010011011010011", "fsgnjx.d f13, f13, f14"),
);

Deno.test("decode - fsgnjx.d instruction 18", () =>
    decode_test("00100011011010111010101101010011", "fsgnjx.d f22, f23, f22"),
);

Deno.test("decode - fsgnjx.d instruction 19", () =>
    decode_test("00100011111000001010100101010011", "fsgnjx.d f18, f1, f30"),
);

Deno.test("decode - fsgnjx.d instruction 20", () =>
    decode_test("00100010000111111010100111010011", "fsgnjx.d f19, f31, f1"),
);

Deno.test("decode - fsgnjx.d instruction 21", () =>
    decode_test("00100010001011101010111011010011", "fsgnjx.d f29, f29, f2"),
);

Deno.test("decode - fsgnjx.d instruction 22", () =>
    decode_test("00100010101100010010010111010011", "fsgnjx.d f11, f2, f11"),
);
