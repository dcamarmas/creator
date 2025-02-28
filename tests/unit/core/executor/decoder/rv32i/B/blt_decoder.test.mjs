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

Deno.test("decode_instruction - blt instruction 1", () =>
    decode_test("00000010000000000100010001100011", "blt x0 x0 40"),
);

Deno.test("decode_instruction - blt instruction 2", () =>
    decode_test("00000010001000001100001001100011", "blt x1 x2 36"),
);

Deno.test("decode_instruction - blt instruction 3", () =>
    decode_test("00000010001100011100000001100011", "blt x3 x3 32"),
);

Deno.test("decode_instruction - blt instruction 4", () =>
    decode_test("00000001111111111100111001100011", "blt x31 x31 28"),
);

Deno.test("decode_instruction - blt instruction 5", () =>
    decode_test("00000001010001111100110001100011", "blt x15 x20 24"),
);

Deno.test("decode_instruction - blt instruction 6", () =>
    decode_test("00000000000000100100101001100011", "blt x4 x0 20"),
);

Deno.test("decode_instruction - blt instruction 7", () =>
    decode_test("00000000100101000100011001100011", "blt x8 x9 12"),
);

Deno.test("decode_instruction - blt instruction 8", () =>
    decode_test("00000001111111110100010001100011", "blt x30 x31 8"),
);

Deno.test("decode_instruction - blt instruction 9", () =>
    decode_test("00000000000100001100001001100011", "blt x1 x1 4"),
);
