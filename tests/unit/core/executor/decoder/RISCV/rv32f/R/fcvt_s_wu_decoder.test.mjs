import { decode_test } from "../../common.mjs";

Deno.test("decode - fcvt.s.wu instruction 1", () =>
    decode_test("11010000000100001000000001010011", "fcvt.s.wu f0, x1, rne"),
);

Deno.test("decode - fcvt.s.wu instruction 2", () =>
    decode_test("11010000000100101001001001010011", "fcvt.s.wu f4, x5, rtz"),
);

Deno.test("decode - fcvt.s.wu instruction 3", () =>
    decode_test("11010000000101001010010001010011", "fcvt.s.wu f8, x9, rdn"),
);

Deno.test("decode - fcvt.s.wu instruction 4", () =>
    decode_test("11010000000101101011011001010011", "fcvt.s.wu f12, x13, rup"),
);

Deno.test("decode - fcvt.s.wu instruction 5", () =>
    decode_test("11010000000110001100100001010011", "fcvt.s.wu f16, x17, rmm"),
);

Deno.test("decode - fcvt.s.wu instruction 6", () =>
    decode_test("11010000000110101111101001010011", "fcvt.s.wu f20, x21"),
);

Deno.test("decode - fcvt.s.wu instruction 7", () =>
    decode_test("11010000000100000111000001010011", "fcvt.s.wu f0, x0"),
);

Deno.test("decode - fcvt.s.wu instruction 8", () =>
    decode_test("11010000000111111111111111010011", "fcvt.s.wu f31, x31"),
);

Deno.test("decode - fcvt.s.wu instruction 9", () =>
    decode_test("11010000000111111111000001010011", "fcvt.s.wu f0, x31"),
);

Deno.test("decode - fcvt.s.wu instruction 10", () =>
    decode_test("11010000000100000111111111010011", "fcvt.s.wu f31, x0"),
);

Deno.test("decode - fcvt.s.wu instruction 11", () =>
    decode_test("11010000000100010111000011010011", "fcvt.s.wu f1, x2"),
);

Deno.test("decode - fcvt.s.wu instruction 12", () =>
    decode_test("11010000000110100111010101010011", "fcvt.s.wu f10, x20"),
);

Deno.test("decode - fcvt.s.wu instruction 13", () =>
    decode_test("11010000000100111111111101010011", "fcvt.s.wu f30, x7"),
);

Deno.test("decode - fcvt.s.wu instruction 14", () =>
    decode_test("11010000000101010001101001010011", "fcvt.s.wu f20, x10, rtz"),
);

Deno.test("decode - fcvt.s.wu instruction 15", () =>
    decode_test("11010000000100101010110011010011", "fcvt.s.wu f25, x5, rdn"),
);

Deno.test("decode - fcvt.s.wu instruction 16", () =>
    decode_test("11010000000111000011100001010011", "fcvt.s.wu f16, x24, rup"),
);

Deno.test("decode - fcvt.s.wu instruction 17", () =>
    decode_test("11010000000101111100111111010011", "fcvt.s.wu f31, x15, rmm"),
);

Deno.test("decode - fcvt.s.wu instruction 18", () =>
    decode_test("11010000000110110111101101010011", "fcvt.s.wu f22, x22"),
);

Deno.test("decode - fcvt.s.wu instruction 19", () =>
    decode_test("11010000000100011111000111010011", "fcvt.s.wu f3, x3"),
);

Deno.test("decode - fcvt.s.wu instruction 20", () =>
    decode_test("11010000000100010111111011010011", "fcvt.s.wu f29, x2"),
);
