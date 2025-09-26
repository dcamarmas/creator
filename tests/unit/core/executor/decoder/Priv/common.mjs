
import { newArchitectureLoad } from "@/core/core.mjs";
import fs from "node:fs";
import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { decode_instruction } from "@/core/executor/decoder.mjs";

export function setupArchitecture(
    architecturePath = "./architecture/RISCV/RV32IMFD_Interrupts.yml",
) {
    const architectureFile = fs.readFileSync(architecturePath, "utf8");
    newArchitectureLoad(architectureFile, true, false);
}

export function decode_test(instruction, expected) {
    setupArchitecture();
    const result = decode_instruction(instruction, true, true);

    assertEquals(result, expected);
}
