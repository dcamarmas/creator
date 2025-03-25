import { decode_test } from "../common.mjs";

Deno.test("decode_instruction - ecall instruction", () =>
    decode_test("00000000000000000000000001110011", "ecall"),
);
