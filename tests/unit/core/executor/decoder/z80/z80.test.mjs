import { decode_test } from "./common.mjs";

const ARCH_PATH = "./architecture/Z80.yml";
Deno.test("decode - nop instruction ", () =>
    decode_test(new Uint8Array([0x00]), "nop", ARCH_PATH),
);

Deno.test("decode - add instruction ", () =>
    decode_test(new Uint8Array([0x80]), "add a, b", ARCH_PATH),
);

Deno.test("decode - ld bc (nn) instruction 1 ", () =>
    decode_test(new Uint8Array([0xED, 0x4B, 0x00, 0x00]), "ld bc, (0)", ARCH_PATH),
);

Deno.test("decode - ld bc (nn) instruction 2 ", () =>
    decode_test(new Uint8Array([0xED, 0x4B, 0xFF, 0xFF]), "ld bc, (65535)", ARCH_PATH),
);
