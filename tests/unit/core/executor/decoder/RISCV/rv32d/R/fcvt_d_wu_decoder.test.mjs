import { decode_test } from "../../common.mjs";
Deno.test("decode - fcvt.d.wu instruction 1", () =>
    decode_test("11010010000100001000000001010011", "fcvt.d.wu f0, x1"),
);

Deno.test("decode - fcvt.d.wu instruction 2", () =>
    decode_test("11010010000100101000001001010011", "fcvt.d.wu f4, x5"),
);

Deno.test("decode - fcvt.d.wu instruction 3", () =>
    decode_test("11010010000101001000010001010011", "fcvt.d.wu f8, x9"),
);

Deno.test("decode - fcvt.d.wu instruction 4", () =>
    decode_test("11010010000101101000011001010011", "fcvt.d.wu f12, x13"),
);

Deno.test("decode - fcvt.d.wu instruction 5", () =>
    decode_test("11010010000110001000100001010011", "fcvt.d.wu f16, x17"),
);

Deno.test("decode - fcvt.d.wu instruction 6", () =>
    decode_test("11010010000100000000000001010011", "fcvt.d.wu f0, x0"),
);

Deno.test("decode - fcvt.d.wu instruction 7", () =>
    decode_test("11010010000111111000111111010011", "fcvt.d.wu f31, x31"),
);

Deno.test("decode - fcvt.d.wu instruction 8", () =>
    decode_test("11010010000111111000000001010011", "fcvt.d.wu f0, x31"),
);

Deno.test("decode - fcvt.d.wu instruction 9", () =>
    decode_test("11010010000100000000111111010011", "fcvt.d.wu f31, x0"),
);

Deno.test("decode - fcvt.d.wu instruction 10", () =>
    decode_test("11010010000100010000000011010011", "fcvt.d.wu f1, x2"),
);

Deno.test("decode - fcvt.d.wu instruction 11", () =>
    decode_test("11010010000110100000010101010011", "fcvt.d.wu f10, x20"),
);

Deno.test("decode - fcvt.d.wu instruction 12", () =>
    decode_test("11010010000100111000111101010011", "fcvt.d.wu f30, x7"),
);

Deno.test("decode - fcvt.d.wu instruction 13", () =>
    decode_test("11010010000101010000101001010011", "fcvt.d.wu f20, x10"),
);

Deno.test("decode - fcvt.d.wu instruction 14", () =>
    decode_test("11010010000100101000110011010011", "fcvt.d.wu f25, x5"),
);

Deno.test("decode - fcvt.d.wu instruction 15", () =>
    decode_test("11010010000111000000100001010011", "fcvt.d.wu f16, x24"),
);

Deno.test("decode - fcvt.d.wu instruction 16", () =>
    decode_test("11010010000101111000111111010011", "fcvt.d.wu f31, x15"),
);

Deno.test("decode - fcvt.d.wu instruction 17", () =>
    decode_test("11010010000110110000101101010011", "fcvt.d.wu f22, x22"),
);

Deno.test("decode - fcvt.d.wu instruction 18", () =>
    decode_test("11010010000100011000000111010011", "fcvt.d.wu f3, x3"),
);

Deno.test("decode - fcvt.d.wu instruction 19", () =>
    decode_test("11010010000100010000111011010011", "fcvt.d.wu f29, x2"),
);
