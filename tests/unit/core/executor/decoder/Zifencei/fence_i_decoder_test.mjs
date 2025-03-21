import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { decode_instruction } from "../../../../../../src/core/executor/decoder.mjs";
import {
    load_architecture,
    newArchitectureLoad,
} from "../../../../../../src/core/core.mjs";
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

Deno.test("decode_instruction - fence.i instruction", () =>
    decode_test("00000000000000000001000000001111", "fence.i"),
);
