import { decode_test } from "../common.mjs";

Deno.test("decode_instruction - ebreak instruction", () =>
    decode_test("00000000000100000000000001110011", "ebreak"),
);
