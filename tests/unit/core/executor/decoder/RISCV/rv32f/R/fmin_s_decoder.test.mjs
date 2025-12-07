import { decode_test } from "../../common.mjs";

Deno.test("decode - fmin.s instruction 1", () =>
    decode_test("00101000001000001000000001010011", "fmin.s f0, f1, f2"),
);

Deno.test("decode - fmin.s instruction 2", () =>
    decode_test("00101000010100100000000111010011", "fmin.s f3, f4, f5"),
);

Deno.test("decode - fmin.s instruction 3", () =>
    decode_test("00101000000000000000000001010011", "fmin.s f0, f0, f0"),
);

Deno.test("decode - fmin.s instruction 4", () =>
    decode_test("00101001111111111000111111010011", "fmin.s f31, f31, f31"),
);

Deno.test("decode - fmin.s instruction 5", () =>
    decode_test("00101001111100000000000001010011", "fmin.s f0, f0, f31"),
);

Deno.test("decode - fmin.s instruction 6", () =>
    decode_test("00101000000011111000111111010011", "fmin.s f31, f31, f0"),
);

Deno.test("decode - fmin.s instruction 7", () =>
    decode_test("00101000000011111000000001010011", "fmin.s f0, f31, f0"),
);

Deno.test("decode - fmin.s instruction 8", () =>
    decode_test("00101001111100000000111111010011", "fmin.s f31, f0, f31"),
);

Deno.test("decode - fmin.s instruction 9", () =>
    decode_test("00101000001100010000000011010011", "fmin.s f1, f2, f3"),
);

Deno.test("decode - fmin.s instruction 10", () =>
    decode_test("00101001111010100000010101010011", "fmin.s f10, f20, f30"),
);

Deno.test("decode - fmin.s instruction 11", () =>
    decode_test("00101001010101110000001111010011", "fmin.s f7, f14, f21"),
);

Deno.test("decode - fmin.s instruction 12", () =>
    decode_test("00101000011100110000001101010011", "fmin.s f6, f6, f7"),
);

Deno.test("decode - fmin.s instruction 13", () =>
    decode_test("00101000100001001000010001010011", "fmin.s f8, f9, f8"),
);

Deno.test("decode - fmin.s instruction 14", () =>
    decode_test("00101000101001010000010101010011", "fmin.s f10, f10, f10"),
);

Deno.test("decode - fmin.s instruction 15", () =>
    decode_test("00101001000110000000011111010011", "fmin.s f15, f16, f17"),
);

Deno.test("decode - fmin.s instruction 16", () =>
    decode_test("00101001101011001000110001010011", "fmin.s f24, f25, f26"),
);

Deno.test("decode - fmin.s instruction 17", () =>
    decode_test("00101000111001101000011011010011", "fmin.s f13, f13, f14"),
);

Deno.test("decode - fmin.s instruction 18", () =>
    decode_test("00101001011010111000101101010011", "fmin.s f22, f23, f22"),
);

Deno.test("decode - fmin.s instruction 19", () =>
    decode_test("00101001111000001000100101010011", "fmin.s f18, f1, f30"),
);

Deno.test("decode - fmin.s instruction 20", () =>
    decode_test("00101000000111111000100111010011", "fmin.s f19, f31, f1"),
);

Deno.test("decode - fmin.s instruction 21", () =>
    decode_test("00101000001011101000111011010011", "fmin.s f29, f29, f2"),
);

Deno.test("decode - fmin.s instruction 22", () =>
    decode_test("00101000101100010000010111010011", "fmin.s f11, f2, f11"),
);
