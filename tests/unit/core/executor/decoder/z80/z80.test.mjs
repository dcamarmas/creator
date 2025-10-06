import { decode_test } from "./common.mjs";

Deno.test("decode_instruction - nop instruction ", () =>
    decode_test("0x00", "nop"),
);

Deno.test("decode_instruction - add instruction ", () =>
    decode_test("0x80", "add a, b"),
);

Deno.test("decode_instruction - ld bc (nn) instruction 1 ", () =>
    decode_test("0xED4B0000", "ld bc, (0)"),
);

Deno.test("decode_instruction - ld bc (nn) instruction 2 ", () =>
    decode_test("0xED4BFFFF", "ld bc, (65535)"),
);
