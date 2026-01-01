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
import { parseDebugSymbols, precomputeInstructions } from "../../assembler.mjs";

export function sjasmplusAssemble(code) {
    // Create a temporary directory
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sjasmplus-"));
    const tmp = path.join(tmpDir, "temp.asm");
    fs.writeFileSync(tmp, code, "utf8");

    // Output file
    const outFile = tmp.replace(/\.asm$/, ".bin");
    const symFile = tmp.replace(/\.asm$/, ".sym");

    // Run sjasmplus (needs to be installed in the system)
    const result = spawnSync(
        "sjasmplus",
        ["--raw=" + outFile, "--sym=" + symFile, tmp],
        {
            encoding: "utf8",
            maxBuffer: 10 * 1024 * 1024,
        },
    );

    if (result.status !== 0) {
        // Clean up temp files
        try {
            fs.unlinkSync(tmp);
        } catch {}
        try {
            fs.unlinkSync(outFile);
        } catch {}
        try {
            fs.unlinkSync(symFile);
        } catch {}
        try {
            fs.rmdirSync(tmpDir);
        } catch {}
        return {
            errorcode: "sjasmplus",
            type: "error",
            bgcolor: "danger",
            status: "error",
            msg: result.stderr || "sjasmplus failed",
        };
    }

    // Read the output binary
    const binary = fs.readFileSync(outFile);

    // Read debug symbols if available
    let debugSymbols = null;
    try {
        debugSymbols = fs.readFileSync(symFile, "utf8");
    } catch {}

    // Parse debug symbols if available
    const parsedSymbols = parseDebugSymbols(debugSymbols);

    main_memory.loadROM(binary);
    precomputeInstructions(parsedSymbols);

    // Now add hints to memory based on the parsed symbols (its a dictionary)
    for (const [name, addr] of Object.entries(parsedSymbols)) {
        main_memory.addHint(addr, name);
    }

    // Clean up temp files
    try {
        fs.unlinkSync(tmp);
    } catch {}
    try {
        fs.unlinkSync(outFile);
    } catch {}
    try {
        fs.unlinkSync(symFile);
    } catch {}
    try {
        fs.rmdirSync(tmpDir);
    } catch {}

    return {
        errorcode: "",
        token: "",
        type: "",
        update: "",
        status: "ok",
        binary,
        stdout: result.stdout,
    };
}
