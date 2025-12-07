import { decode_test } from "../../common.mjs";

Deno.test("decode - fsgnj.s instruction 1", () =>
    decode_test("00100000001000001000000001010011", "fsgnj.s f0, f1, f2"),
);

Deno.test("decode - fsgnj.s instruction 2", () =>
    decode_test("00100000010100100000000111010011", "fsgnj.s f3, f4, f5"),
);

Deno.test("decode - fsgnj.s instruction 3", () =>
    decode_test("00100000000000000000000001010011", "fsgnj.s f0, f0, f0"),
);

Deno.test("decode - fsgnj.s instruction 4", () =>
    decode_test("00100001111111111000111111010011", "fsgnj.s f31, f31, f31"),
);

Deno.test("decode - fsgnj.s instruction 5", () =>
    decode_test("00100001111100000000000001010011", "fsgnj.s f0, f0, f31"),
);

Deno.test("decode - fsgnj.s instruction 6", () =>
    decode_test("00100000000011111000111111010011", "fsgnj.s f31, f31, f0"),
);

Deno.test("decode - fsgnj.s instruction 7", () =>
    decode_test("00100000000011111000000001010011", "fsgnj.s f0, f31, f0"),
);

Deno.test("decode - fsgnj.s instruction 8", () =>
    decode_test("00100001111100000000111111010011", "fsgnj.s f31, f0, f31"),
);

Deno.test("decode - fsgnj.s instruction 9", () =>
    decode_test("00100000001100010000000011010011", "fsgnj.s f1, f2, f3"),
);

Deno.test("decode - fsgnj.s instruction 10", () =>
    decode_test("00100001111010100000010101010011", "fsgnj.s f10, f20, f30"),
);

Deno.test("decode - fsgnj.s instruction 11", () =>
    decode_test("00100001010101110000001111010011", "fsgnj.s f7, f14, f21"),
);

Deno.test("decode - fsgnj.s instruction 12", () =>
    decode_test("00100000011100110000001101010011", "fsgnj.s f6, f6, f7"),
);

Deno.test("decode - fsgnj.s instruction 13", () =>
    decode_test("00100000100001001000010001010011", "fsgnj.s f8, f9, f8"),
);

Deno.test("decode - fsgnj.s instruction 14", () =>
    decode_test("00100000101001010000010101010011", "fsgnj.s f10, f10, f10"),
);

Deno.test("decode - fsgnj.s instruction 15", () =>
    decode_test("00100001000110000000011111010011", "fsgnj.s f15, f16, f17"),
);

Deno.test("decode - fsgnj.s instruction 16", () =>
    decode_test("00100001101011001000110001010011", "fsgnj.s f24, f25, f26"),
);

Deno.test("decode - fsgnj.s instruction 17", () =>
    decode_test("00100000111001101000011011010011", "fsgnj.s f13, f13, f14"),
);

Deno.test("decode - fsgnj.s instruction 18", () =>
    decode_test("00100001011010111000101101010011", "fsgnj.s f22, f23, f22"),
);

Deno.test("decode - fsgnj.s instruction 19", () =>
    decode_test("00100001111000001000100101010011", "fsgnj.s f18, f1, f30"),
);

Deno.test("decode - fsgnj.s instruction 20", () =>
    decode_test("00100000000111111000100111010011", "fsgnj.s f19, f31, f1"),
);

Deno.test("decode - fsgnj.s instruction 21", () =>
    decode_test("00100000001011101000111011010011", "fsgnj.s f29, f29, f2"),
);

Deno.test("decode - fsgnj.s instruction 22", () =>
    decode_test("00100000101100010000010111010011", "fsgnj.s f11, f2, f11"),
);
