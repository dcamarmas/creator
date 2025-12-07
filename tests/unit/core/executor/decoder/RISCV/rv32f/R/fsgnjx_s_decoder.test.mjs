import { decode_test } from "../../common.mjs";

Deno.test("decode - fsgnjx.s instruction 1", () =>
    decode_test("00100000001000001010000001010011", "fsgnjx.s f0, f1, f2"),
);

Deno.test("decode - fsgnjx.s instruction 2", () =>
    decode_test("00100000010100100010000111010011", "fsgnjx.s f3, f4, f5"),
);

Deno.test("decode - fsgnjx.s instruction 3", () =>
    decode_test("00100000000000000010000001010011", "fsgnjx.s f0, f0, f0"),
);

Deno.test("decode - fsgnjx.s instruction 4", () =>
    decode_test("00100001111111111010111111010011", "fsgnjx.s f31, f31, f31"),
);

Deno.test("decode - fsgnjx.s instruction 5", () =>
    decode_test("00100001111100000010000001010011", "fsgnjx.s f0, f0, f31"),
);

Deno.test("decode - fsgnjx.s instruction 6", () =>
    decode_test("00100000000011111010111111010011", "fsgnjx.s f31, f31, f0"),
);

Deno.test("decode - fsgnjx.s instruction 7", () =>
    decode_test("00100000000011111010000001010011", "fsgnjx.s f0, f31, f0"),
);

Deno.test("decode - fsgnjx.s instruction 8", () =>
    decode_test("00100001111100000010111111010011", "fsgnjx.s f31, f0, f31"),
);

Deno.test("decode - fsgnjx.s instruction 9", () =>
    decode_test("00100000001100010010000011010011", "fsgnjx.s f1, f2, f3"),
);

Deno.test("decode - fsgnjx.s instruction 10", () =>
    decode_test("00100001111010100010010101010011", "fsgnjx.s f10, f20, f30"),
);

Deno.test("decode - fsgnjx.s instruction 11", () =>
    decode_test("00100001010101110010001111010011", "fsgnjx.s f7, f14, f21"),
);

Deno.test("decode - fsgnjx.s instruction 12", () =>
    decode_test("00100000011100110010001101010011", "fsgnjx.s f6, f6, f7"),
);

Deno.test("decode - fsgnjx.s instruction 13", () =>
    decode_test("00100000100001001010010001010011", "fsgnjx.s f8, f9, f8"),
);

Deno.test("decode - fsgnjx.s instruction 14", () =>
    decode_test("00100000101001010010010101010011", "fsgnjx.s f10, f10, f10"),
);

Deno.test("decode - fsgnjx.s instruction 15", () =>
    decode_test("00100001000110000010011111010011", "fsgnjx.s f15, f16, f17"),
);

Deno.test("decode - fsgnjx.s instruction 16", () =>
    decode_test("00100001101011001010110001010011", "fsgnjx.s f24, f25, f26"),
);

Deno.test("decode - fsgnjx.s instruction 17", () =>
    decode_test("00100000111001101010011011010011", "fsgnjx.s f13, f13, f14"),
);

Deno.test("decode - fsgnjx.s instruction 18", () =>
    decode_test("00100001011010111010101101010011", "fsgnjx.s f22, f23, f22"),
);

Deno.test("decode - fsgnjx.s instruction 19", () =>
    decode_test("00100001111000001010100101010011", "fsgnjx.s f18, f1, f30"),
);

Deno.test("decode - fsgnjx.s instruction 20", () =>
    decode_test("00100000000111111010100111010011", "fsgnjx.s f19, f31, f1"),
);

Deno.test("decode - fsgnjx.s instruction 21", () =>
    decode_test("00100000001011101010111011010011", "fsgnjx.s f29, f29, f2"),
);

Deno.test("decode - fsgnjx.s instruction 22", () =>
    decode_test("00100000101100010010010111010011", "fsgnjx.s f11, f2, f11"),
);
