import { loadArchitecture } from "@/core/core.mjs";
import fs from "node:fs";
import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { decode } from "@/core/executor/decoder.mjs";

export const RV32IMFD_PATH = "./architecture/RISCV/RV32IMFD.yml";
export const RV32IMFD_INT_PATH = "./architecture/RISCV/RV32IMFD-Interrupts.yml";
export function setupArchitecture(
    architecturePath = "./architecture/RISCV/RV32IMFD.yml",
) {
    const architectureFile = fs.readFileSync(architecturePath, "utf8");
    loadArchitecture(architectureFile);
}

function instructionToUint8Array(instruction) {
    let value;
    if (instruction.startsWith('0x') || instruction.startsWith('0X')) {
        value = parseInt(instruction, 16);
    } else if (instruction.startsWith('0b') || instruction.startsWith('0B')) {
        value = parseInt(instruction.slice(2), 2);
    } else {
        value = parseInt(instruction, 2);
    }
    
    const array = new Uint8Array(4);
    array[3] = value & 0xFF;
    array[2] = (value >> 8) & 0xFF;
    array[1] = (value >> 16) & 0xFF;
    array[0] = (value >> 24) & 0xFF;
    
    return array;
}

export function decode_test(instruction, expected, architecturePath) {
    setupArchitecture(architecturePath);
    const instructionBytes = instructionToUint8Array(instruction);
    const result = decode(instructionBytes, true);

    assertEquals(result.assembly, expected);
}
