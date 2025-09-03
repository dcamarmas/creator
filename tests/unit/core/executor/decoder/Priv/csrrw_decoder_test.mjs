import { decode_test } from "./common.mjs";

Deno.test("decode_instruction - csrrw instruction", () =>
    decode_test("00110100001000000001000001110011", "csrrw x0 mcause x0"),
);
