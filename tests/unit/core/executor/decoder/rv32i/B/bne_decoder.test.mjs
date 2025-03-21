import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { decode_instruction } from "../../../../../../../src/core/executor/decoder.mjs";
import {
    load_architecture,
    newArchitectureLoad,
} from "../../../../../../../src/core/core.mjs";
import fs from "node:fs";

function setupArchitecture() {
    const architecturePath = "./architecture/new/architecture.yml";
    const instructionsPath = "./architecture/new/instructions.yml";
    const architecture_file = fs.readFileSync(architecturePath, "utf8");
    const instructions_file = fs.readFileSync(instructionsPath, "utf8");
    newArchitectureLoad(architecture_file, instructions_file);
}

function decode_test(instruction, expected) {
    setupArchitecture();
    const result = decode_instruction(instruction, true);

    assertEquals(result, expected);
}

Deno.test("decode_instruction - bne instruction 1", () =>
    decode_test("00000010000000000001010001100011", "bne x0 x0 40"),
);

Deno.test("decode_instruction - bne instruction 2", () =>
    decode_test("00000010001000001001001001100011", "bne x1 x2 36"),
);

Deno.test("decode_instruction - bne instruction 3", () =>
    decode_test("00000010001100011001000001100011", "bne x3 x3 32"),
);

Deno.test("decode_instruction - bne instruction 4", () =>
    decode_test("00000001111111111001111001100011", "bne x31 x31 28"),
);

Deno.test("decode_instruction - bne instruction 5", () =>
    decode_test("00000001010001111001110001100011", "bne x15 x20 24"),
);

Deno.test("decode_instruction - bne instruction 6", () =>
    decode_test("00000000000000100001101001100011", "bne x4 x0 20"),
);

Deno.test("decode_instruction - bne instruction 7", () =>
    decode_test("00000000010100000001100001100011", "bne x0 x5 16"),
);

Deno.test("decode_instruction - bne instruction 8", () =>
    decode_test("00000000100101000001011001100011", "bne x8 x9 12"),
);

Deno.test("decode_instruction - bne instruction 9", () =>
    decode_test("00000001111111110001010001100011", "bne x30 x31 8"),
);

Deno.test("decode_instruction - bne instruction 10", () =>
    decode_test("00000000000100001001001001100011", "bne x1 x1 4"),
);
