import { decode_test } from "../../common.mjs";

Deno.test("decode - bge instruction 1", () =>
    decode_test("00000010000000000101010001100011", "bge x0, x0, 40"),
);

Deno.test("decode - bge instruction 2", () =>
    decode_test("00000010001000001101001001100011", "bge x1, x2, 36"),
);

Deno.test("decode - bge instruction 3", () =>
    decode_test("00000010001100011101000001100011", "bge x3, x3, 32"),
);

Deno.test("decode - bge instruction 4", () =>
    decode_test("00000001111111111101111001100011", "bge x31, x31, 28"),
);

Deno.test("decode - bge instruction 5", () =>
    decode_test("00000001010001111101110001100011", "bge x15, x20, 24"),
);

Deno.test("decode - bge instruction 6", () =>
    decode_test("00000000000000100101101001100011", "bge x4, x0, 20"),
);

Deno.test("decode - bge instruction 7", () =>
    decode_test("00000000010100000101100001100011", "bge x0, x5, 16"),
);

Deno.test("decode - bge instruction 8", () =>
    decode_test("00000000100101000101011001100011", "bge x8, x9, 12"),
);

Deno.test("decode - bge instruction 9", () =>
    decode_test("00000001111111110101010001100011", "bge x30, x31, 8"),
);

Deno.test("decode - bge instruction 10", () =>
    decode_test("00000000000100001101001001100011", "bge x1, x1, 4"),
);
