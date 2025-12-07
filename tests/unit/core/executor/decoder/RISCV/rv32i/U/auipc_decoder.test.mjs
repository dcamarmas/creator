import { decode_test } from "../../common.mjs";

Deno.test("decode - auipc instruction 1", () =>
    decode_test("00000000000000000000000000010111", "auipc x0, 0"),
);

Deno.test("decode - auipc instruction 2", () =>
    decode_test("00000000000000000000000010010111", "auipc x1, 0"),
);

Deno.test("decode - auipc instruction 3", () =>
    decode_test("11111111111111111111000010010111", "auipc x1, -1"),
);

Deno.test("decode - auipc instruction 4", () =>
    decode_test("10000000000000000000000100010111", "auipc x2, -524288"),
);

Deno.test("decode - auipc instruction 5", () =>
    decode_test("00000000000000000001000110010111", "auipc x3, 1"),
);

Deno.test("decode - auipc instruction 6", () =>
    decode_test("00010010001101000101001000010111", "auipc x4, 74565"),
);

Deno.test("decode - auipc instruction 7", () =>
    decode_test("01010101010101010101001010010111", "auipc x5, 349525"),
);

Deno.test("decode - auipc instruction 8", () =>
    decode_test("10101010101010101010111110010111", "auipc x31, -349526"),
);

Deno.test("decode - auipc instruction 9", () =>
    decode_test("01111111111111111111011110010111", "auipc x15, 524287"),
);

Deno.test("decode - auipc instruction 10", () =>
    decode_test("10000000000000000001101000010111", "auipc x20, -524287"),
);
