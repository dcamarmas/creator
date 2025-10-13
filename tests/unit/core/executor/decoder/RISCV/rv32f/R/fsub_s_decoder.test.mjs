import { decode_test } from "../../common.mjs";

Deno.test("decode - fsub.s instruction 1", () =>
    decode_test("00001000001000001000000001010011", "fsub.s f0, f1, f2, rne"),
);

Deno.test("decode - fsub.s instruction 2", () =>
    decode_test("00001000011000101001001001010011", "fsub.s f4, f5, f6, rtz"),
);

Deno.test("decode - fsub.s instruction 3", () =>
    decode_test("00001000101001001010010001010011", "fsub.s f8, f9, f10, rdn"),
);

Deno.test("decode - fsub.s instruction 4", () =>
    decode_test("00001000111001101011011001010011", "fsub.s f12, f13, f14, rup"),
);

Deno.test("decode - fsub.s instruction 5", () =>
    decode_test("00001001001010001100100001010011", "fsub.s f16, f17, f18, rmm"),
);

Deno.test("decode - fsub.s instruction 6", () =>
    decode_test("00001001011010101111101001010011", "fsub.s f20, f21, f22"),
);

Deno.test("decode - fsub.s instruction 7", () =>
    decode_test("00001000000000000111000001010011", "fsub.s f0, f0, f0"),
);

Deno.test("decode - fsub.s instruction 8", () =>
    decode_test("00001001111111111111111111010011", "fsub.s f31, f31, f31"),
);

Deno.test("decode - fsub.s instruction 9", () =>
    decode_test("00001001111100000111000001010011", "fsub.s f0, f0, f31"),
);

Deno.test("decode - fsub.s instruction 10", () =>
    decode_test("00001000000011111111111111010011", "fsub.s f31, f31, f0"),
);

Deno.test("decode - fsub.s instruction 11", () =>
    decode_test("00001000001100010111000011010011", "fsub.s f1, f2, f3"),
);

Deno.test("decode - fsub.s instruction 12", () =>
    decode_test("00001001111010100111010101010011", "fsub.s f10, f20, f30"),
);

Deno.test("decode - fsub.s instruction 13", () =>
    decode_test("00001001010101110111001111010011", "fsub.s f7, f14, f21"),
);

Deno.test("decode - fsub.s instruction 14", () =>
    decode_test("00001000010101010001101001010011", "fsub.s f20, f10, f5, rtz"),
);

Deno.test("decode - fsub.s instruction 15", () =>
    decode_test("00001000111100101010110011010011", "fsub.s f25, f5, f15, rdn"),
);

Deno.test("decode - fsub.s instruction 16", () =>
    decode_test("00001000100011000011100001010011", "fsub.s f16, f24, f8, rup"),
);

Deno.test("decode - fsub.s instruction 17", () =>
    decode_test("00001001000000000100111111010011", "fsub.s f31, f0, f16, rmm"),
);

Deno.test("decode - fsub.s instruction 18", () =>
    decode_test("00001000000110110111101101010011", "fsub.s f22, f22, f1"),
);

Deno.test("decode - fsub.s instruction 19", () =>
    decode_test("00001000001100011111000111010011", "fsub.s f3, f3, f3"),
);

Deno.test("decode - fsub.s instruction 20", () =>
    decode_test("00001001110100010111111011010011", "fsub.s f29, f2, f29"),
);
