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

Deno.test("decode_instruction - sw instruction 1", () =>
    decode_test("00000000000000000010000000100011", "sw x0 0 (x0)"),
);

Deno.test("decode_instruction - sw instruction 2", () =>
    decode_test("00000000000100001010000000100011", "sw x1 0 (x1)"),
);

Deno.test("decode_instruction - sw instruction 3", () =>
    decode_test("00000000001000010010000010100011", "sw x2 1 (x2)"),
);

Deno.test("decode_instruction - sw instruction 4", () =>
    decode_test("11111110001100011010111110100011", "sw x3 -1 (x3)"),
);

Deno.test("decode_instruction - sw instruction 5", () =>
    decode_test("01111110010000100010111110100011", "sw x4 2047 (x4)"),
);

Deno.test("decode_instruction - sw instruction 6", () =>
    decode_test("10000000010100101010000000100011", "sw x5 -2048 (x5)"),
);

Deno.test("decode_instruction - sw instruction 7", () =>
    decode_test("00000000011000111010000000100011", "sw x6 0 (x7)"),
);

Deno.test("decode_instruction - sw instruction 8", () =>
    decode_test("00000001111111110010000000100011", "sw x31 0 (x30)"),
);

Deno.test("decode_instruction - sw instruction 9", () =>
    decode_test("01000000111110000010000000100011", "sw x15 1024 (x16)"),
);

Deno.test("decode_instruction - sw instruction 10", () =>
    decode_test("11000001010010101010000000100011", "sw x20 -1024 (x21)"),
);

Deno.test("decode_instruction - sw instruction 11", () =>
    decode_test("00000000101000000010000000100011", "sw x10 0 (x0)"),
);

Deno.test("decode_instruction - sw instruction 12", () =>
    decode_test("00000010100001001010010100100011", "sw x8 42 (x9)"),
);
