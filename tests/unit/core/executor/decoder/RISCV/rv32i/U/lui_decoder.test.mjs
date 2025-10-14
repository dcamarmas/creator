import { decode_test } from "../../common.mjs";

Deno.test("decode - lui instruction 1", () =>
    decode_test("00000000000000000000000000110111", "lui x0, 0"),
);

Deno.test("decode - lui instruction 2", () =>
    decode_test("00000000000000000000000010110111", "lui x1, 0"),
);

Deno.test("decode - lui instruction 3", () =>
    decode_test("11111111111111111111000010110111", "lui x1, 1048575"),
);

Deno.test("decode - lui instruction 4", () =>
    decode_test("10000000000000000000000100110111", "lui x2, 524288"),
);

Deno.test("decode - lui instruction 5", () =>
    decode_test("00000000000000000001000110110111", "lui x3, 1"),
);

Deno.test("decode - lui instruction 6", () =>
    decode_test("00010010001101000101001000110111", "lui x4, 74565"),
);

Deno.test("decode - lui instruction 7", () =>
    decode_test("01010101010101010101001010110111", "lui x5, 349525"),
);

Deno.test("decode - lui instruction 8", () =>
    decode_test("10101010101010101010111110110111", "lui x31, 699050"),
);

Deno.test("decode - lui instruction 9", () =>
    decode_test("01111111111111111111011110110111", "lui x15, 524287"),
);

Deno.test("decode - lui instruction 10", () =>
    decode_test("10000000000000000001101000110111", "lui x20, 524289"),
);
