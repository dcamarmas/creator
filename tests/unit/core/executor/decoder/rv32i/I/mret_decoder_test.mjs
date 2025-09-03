import { decode_test } from "../common.mjs";

Deno.test("decode_instruction - mret instruction", () =>
    decode_test("00110000001000000000000001110011", "mret"),
);
