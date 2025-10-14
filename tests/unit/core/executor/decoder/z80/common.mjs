import { loadArchitecture } from "@/core/core.mjs";
import fs from "node:fs";
import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { decode } from "@/core/executor/decoder.mjs";

export function setupArchitecture(
    architecturePath = "./architecture/Z80.yml",
) {
    const architectureFile = fs.readFileSync(architecturePath, "utf8");
    loadArchitecture(architectureFile);
}

export function decode_test(instruction, expected, architecturePath) {
    setupArchitecture(architecturePath);
    const result = decode(instruction);

    assertEquals(result.assembly, expected);
}
