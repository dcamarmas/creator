import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { decode_instruction } from "../../../../../../../src/core/executor/decoder.mjs";
import {
    load_architecture,
    architecture,
} from "../../../../../../../src/core/core.mjs";
import fs from "node:fs";

function setupArchitecture() {
    const architecturePath = "./architecture/RISC_V_RV32IMFD.json";
    const architecture_file = fs.readFileSync(architecturePath, "utf8");
    load_architecture(architecture_file);
}

function decode_test(instruction, expected) {
    setupArchitecture();
    const result = decode_instruction(instruction);

    assertEquals(result.instructionExec, expected);
}

Deno.test("decode_instruction - sb instruction 1", () =>
    decode_test("00000000000000000000000000100011", "sb x0 0 (x0)"),
);

Deno.test("decode_instruction - sb instruction 2", () =>
    decode_test("00000000000100001000000000100011", "sb x1 0 (x1)"),
);

Deno.test("decode_instruction - sb instruction 3", () =>
    decode_test("00000000001000010000000010100011", "sb x2 1 (x2)"),
);

Deno.test("decode_instruction - sb instruction 4", () =>
    decode_test("11111110001100011000111110100011", "sb x3 -1 (x3)"),
);

Deno.test("decode_instruction - sb instruction 5", () =>
    decode_test("01111110010000100000111110100011", "sb x4 2047 (x4)"),
);

Deno.test("decode_instruction - sb instruction 6", () =>
    decode_test("10000000010100101000000000100011", "sb x5 -2048 (x5)"),
);

Deno.test("decode_instruction - sb instruction 7", () =>
    decode_test("00000000011000111000000000100011", "sb x6 0 (x7)"),
);

Deno.test("decode_instruction - sb instruction 8", () =>
    decode_test("00000001111111110000000000100011", "sb x31 0 (x30)"),
);

Deno.test("decode_instruction - sb instruction 9", () =>
    decode_test("01000000111110000000000000100011", "sb x15 1024 (x16)"),
);

Deno.test("decode_instruction - sb instruction 10", () =>
    decode_test("11000001010010101000000000100011", "sb x20 -1024 (x21)"),
);

Deno.test("decode_instruction - sb instruction 11", () =>
    decode_test("00000000101000000000000000100011", "sb x10 0 (x0)"),
);

Deno.test("decode_instruction - sb instruction 12", () =>
    decode_test("00000010100001001000010100100011", "sb x8 42 (x9)"),
);
