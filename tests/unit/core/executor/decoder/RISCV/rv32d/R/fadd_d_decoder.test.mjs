import { decode_test } from "../../common.mjs";

Deno.test("decode - FADD.D instruction 1", () =>
    decode_test("00000010001000001000000001010011", "fadd.d f0, f1, f2, rne"),
);

Deno.test("decode - FADD.D instruction 2", () =>
    decode_test("00000010011000101001001001010011", "fadd.d f4, f5, f6, rtz"),
);

Deno.test("decode - FADD.D instruction 3", () =>
    decode_test("00000010101001001010010001010011", "fadd.d f8, f9, f10, rdn"),
);

Deno.test("decode - FADD.D instruction 4", () =>
    decode_test("00000010111001101011011001010011", "fadd.d f12, f13, f14, rup"),
);

Deno.test("decode - FADD.D instruction 5", () =>
    decode_test("00000011001010001100100001010011", "fadd.d f16, f17, f18, rmm"),
);

Deno.test("decode - FADD.D instruction 6", () =>
    decode_test("00000011011010101111101001010011", "fadd.d f20, f21, f22"),
);

Deno.test("decode - FADD.D instruction 7", () =>
    decode_test("00000010000000000111000001010011", "fadd.d f0, f0, f0"),
);

Deno.test("decode - FADD.D instruction 8", () =>
    decode_test("00000011111111111111111111010011", "fadd.d f31, f31, f31"),
);

Deno.test("decode - FADD.D instruction 9", () =>
    decode_test("00000011111100000111000001010011", "fadd.d f0, f0, f31"),
);

Deno.test("decode - FADD.D instruction 10", () =>
    decode_test("00000010000011111111111111010011", "fadd.d f31, f31, f0"),
);

Deno.test("decode - FADD.D instruction 11", () =>
    decode_test("00000010001100010111000011010011", "fadd.d f1, f2, f3"),
);

Deno.test("decode - FADD.D instruction 12", () =>
    decode_test("00000011111010100111010101010011", "fadd.d f10, f20, f30"),
);

Deno.test("decode - FADD.D instruction 13", () =>
    decode_test("00000011010101110111001111010011", "fadd.d f7, f14, f21"),
);

Deno.test("decode - FADD.D instruction 14", () =>
    decode_test("00000010010101010001101001010011", "fadd.d f20, f10, f5, rtz"),
);

Deno.test("decode - FADD.D instruction 15", () =>
    decode_test("00000010111100101010110011010011", "fadd.d f25, f5, f15, rdn"),
);

Deno.test("decode - FADD.D instruction 16", () =>
    decode_test("00000010100011000011100001010011", "fadd.d f16, f24, f8, rup"),
);

Deno.test("decode - FADD.D instruction 17", () =>
    decode_test("00000011000000000100111111010011", "fadd.d f31, f0, f16, rmm"),
);

Deno.test("decode - FADD.D instruction 18", () =>
    decode_test("00000010000110110111101101010011", "fadd.d f22, f22, f1"),
);

Deno.test("decode - FADD.D instruction 19", () =>
    decode_test("00000010001100011111000111010011", "fadd.d f3, f3, f3"),
);

Deno.test("decode - FADD.D instruction 20", () =>
    decode_test("00000011110100010111111011010011", "fadd.d f29, f2, f29"),
);
