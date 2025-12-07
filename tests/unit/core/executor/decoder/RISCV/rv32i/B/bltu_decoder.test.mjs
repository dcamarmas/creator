import { decode_test } from "../../common.mjs";

Deno.test("decode - bltu instruction 1", () =>
    decode_test("00000010000000000110010001100011", "bltu x0, x0, 40"),
);

Deno.test("decode - bltu instruction 2", () =>
    decode_test("00000010001000001110001001100011", "bltu x1, x2, 36"),
);

Deno.test("decode - bltu instruction 3", () =>
    decode_test("00000010001100011110000001100011", "bltu x3, x3, 32"),
);

Deno.test("decode - bltu instruction 4", () =>
    decode_test("00000001111111111110111001100011", "bltu x31, x31, 28"),
);

Deno.test("decode - bltu instruction 5", () =>
    decode_test("00000001010001111110110001100011", "bltu x15, x20, 24"),
);

Deno.test("decode - bltu instruction 6", () =>
    decode_test("00000000000000100110101001100011", "bltu x4, x0, 20"),
);

Deno.test("decode - bltu instruction 7", () =>
    decode_test("00000000010100000110100001100011", "bltu x0, x5, 16"),
);

Deno.test("decode - bltu instruction 8", () =>
    decode_test("00000000100101000110011001100011", "bltu x8, x9, 12"),
);

Deno.test("decode - bltu instruction 9", () =>
    decode_test("00000001111111110110010001100011", "bltu x30, x31, 8"),
);

Deno.test("decode - bltu instruction 10", () =>
    decode_test("00000000000100001110001001100011", "bltu x1, x1, 4"),
);
