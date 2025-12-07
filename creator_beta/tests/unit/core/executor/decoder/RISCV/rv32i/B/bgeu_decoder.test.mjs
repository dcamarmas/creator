import { decode_test } from "../../common.mjs";

Deno.test("decode - bgeu instruction 1", () =>
    decode_test("00000010000000000111010001100011", "bgeu x0, x0, 40"),
);

Deno.test("decode - bgeu instruction 2", () =>
    decode_test("00000010001000001111001001100011", "bgeu x1, x2, 36"),
);

Deno.test("decode - bgeu instruction 3", () =>
    decode_test("00000010001100011111000001100011", "bgeu x3, x3, 32"),
);

Deno.test("decode - bgeu instruction 4", () =>
    decode_test("00000001111111111111111001100011", "bgeu x31, x31, 28"),
);

Deno.test("decode - bgeu instruction 5", () =>
    decode_test("00000001010001111111110001100011", "bgeu x15, x20, 24"),
);

Deno.test("decode - bgeu instruction 6", () =>
    decode_test("00000000000000100111101001100011", "bgeu x4, x0, 20"),
);

Deno.test("decode - bgeu instruction 7", () =>
    decode_test("00000000010100000111100001100011", "bgeu x0, x5, 16"),
);

Deno.test("decode - bgeu instruction 8", () =>
    decode_test("00000000100101000111011001100011", "bgeu x8, x9, 12"),
);

Deno.test("decode - bgeu instruction 9", () =>
    decode_test("00000001111111110111010001100011", "bgeu x30, x31, 8"),
);

Deno.test("decode - bgeu instruction 10", () =>
    decode_test("00000000000100001111001001100011", "bgeu x1, x1, 4"),
);
