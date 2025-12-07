import { decode_test } from "../common.mjs";

Deno.test("decode - fence.i instruction", () =>
    decode_test("00000000000000000001000000001111", "fence.i"),
);
