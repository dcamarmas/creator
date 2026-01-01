/**
 * Copyright 2018-2026 CREATOR Team.
 *
 * This file is part of CREATOR.
 *
 * CREATOR is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * CREATOR is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with CREATOR.  If not, see <http://www.gnu.org/licenses/>.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { main_memory } from "../../../core.mjs";
import {
    precomputeInstructions,
    set_tag_instructions,
} from "../../assembler.mjs";
import { parseDebugSymbolsRASM, toTagInstructions } from "../utils.mjs";

/**
 * Parses the console output from RASM's -map flag to extract a simple
 * instruction-address-to-source-line-number mapping.
 *
 * @param {string} rawRasmOutput The multi-line string captured from RASM's console output.
 * @returns {object} An object mapping a numeric address to its source line number.
 *                   Example: { 11: 16, 9: 15 } (where 11 is 0x000B)
 */
function parseSourceLineMapping(rawRasmOutput) {
    const sourceMap = {};
    const ansiColorRegex = /\u001b\[[0-9;]*m/g;
    const instructionRegex = /^[^|]+\|([^|]+)\|.*\(L(\d+):[^)]+\)/;

    const allLines = rawRasmOutput.split("\n");

    for (const line of allLines) {
        const cleanLine = line.replace(ansiColorRegex, "");
        const match = cleanLine.match(instructionRegex);

        if (match) {
            const addressString = match[1].trim();
            const lineNumber = parseInt(match[2], 10);

            // Convert the hex address string to a number for the key
            const addressNumber = parseInt(addressString, 16);

            sourceMap[addressNumber] = lineNumber;
        }
    }
    return sourceMap;
}

export function rasmAssemble(code) {
    // --- Setup temporary files ---
    const filename = "program";
    const asmFilename = filename + ".asm";
    const binFilename = filename + ".bin";
    const symFilename = filename + ".sym"; // For old-style labels
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "rasm-"));
    const tempAsmPath = path.join(tmpDir, asmFilename);
    const tempBinPath = path.join(tmpDir, binFilename);
    const tempSymPath = path.join(tmpDir, symFilename);

    fs.writeFileSync(tempAsmPath, code, "utf8");

    // --- Run rasm with ALL required flags ---
    // We need '-sp' for labels, '-os' for the label file,
    // '-map' for source-line info, and '-ob' for the binary.
    const result = spawnSync(
        "rasm",
        [tempAsmPath, "-sp", "-os", tempSymPath, "-ob", tempBinPath, "-map"],
        {
            encoding: "utf8",
            maxBuffer: 10 * 1024 * 1024,
            cwd: tmpDir,
        },
    );

    // Combine stdout and stderr to capture the full "-map" output
    const rasmConsoleOutput = (result.stdout || "") + (result.stderr || "");

    if (result.status !== 0) {
        // Clean up temp files
        try {
            fs.unlinkSync(tempAsmPath);
        } catch {}
        try {
            fs.unlinkSync(tempSymPath);
        } catch {}
        try {
            fs.rmdirSync(tmpDir);
        } catch {}
        return {
            errorcode: "rasm",
            type: "error",
            bgcolor: "danger",
            status: "error",
            msg: rasmConsoleOutput || "rasm failed",
        };
    }

    // Read the output binary
    const binary = fs.readFileSync(tempBinPath);

    // Read debug symbols (labels only) if available
    let debugSymbols = null;
    try {
        debugSymbols = fs.readFileSync(tempSymPath, "utf8");
    } catch {}

    // Parse debug symbols (labels only) if available
    const parsedSymbols = parseDebugSymbolsRASM(debugSymbols);
    const sourceMap = parseSourceLineMapping(rasmConsoleOutput);

    main_memory.loadROM(binary);
    precomputeInstructions(code, sourceMap, parsedSymbols);

    // Add hints to memory based on the parsed labels
    for (const [name, addr] of Object.entries(parsedSymbols)) {
        main_memory.addHint(addr, name);
    }

    // Set the tag instructions for the parsed symbols
    // This is a new step to ensure that the tag_instructions map is updated
    set_tag_instructions(toTagInstructions(parsedSymbols));

    // --- Clean up all temp files ---
    try {
        fs.unlinkSync(tempAsmPath);
    } catch {}
    try {
        fs.unlinkSync(tempBinPath);
    } catch {}
    try {
        fs.unlinkSync(tempSymPath);
    } catch {}
    try {
        fs.rmdirSync(tmpDir);
    } catch {}

    // --- Return all data ---
    return {
        errorcode: "",
        token: "",
        type: "",
        update: "",
        status: "ok",
        binary,
        stdout: rasmConsoleOutput,
        sourceMap,
    };
}
