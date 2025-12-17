/**
 * Copyright 2018-2025 CREATOR Team.
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

import fs from "node:fs";
import yaml from "js-yaml";
import process from "node:process";
import * as creator from "../core/core.mjs";
import type { Architecture } from "@/core/core.d.ts";
import type { ReturnType } from "./types.mts";
import { cliState } from "./state.mts";
import { sjasmplusAssemble } from "../core/assembler/sjasmplus/deno/sjasmplus.mjs";
import { assembleCreator } from "../core/assembler/creatorAssembler/deno/creatorAssembler.mjs";
import { rasmAssemble } from "../core/assembler/rasm/deno/rasm.mjs";

/**
 * Map of available assembler backends
 */
export const assemblerMap = {
    default: assembleCreator,
    sjasmplus: sjasmplusAssemble,
    rasm: rasmAssemble,
};

/**
 * Load architecture from file
 */
export function loadArchitecture(filePath: string, isaExtensions: string[]): void {
    const architectureFile = fs.readFileSync(filePath, "utf8");
    const architectureObj = yaml.load(architectureFile) as Architecture;
    cliState.pluginName = architectureObj.config.plugin;
    const ret: ReturnType = creator.loadArchitecture(
        architectureFile,
        isaExtensions,
    );
    if (ret.status !== "ok") {
        console.error(`Error loading architecture: ${ret.token}.`);
        process.exit(1);
    }
}

/**
 * Load a binary file from disk into memory.
 * Only works with 8-bit byte memories for direct file compatibility.
 */
export function loadBinaryFile(filePath: string, offset = 0n): ReturnType {
    try {
        const fileData = fs.readFileSync(filePath);
        creator.main_memory.loadROM(new Uint8Array(fileData), offset);

        // Create a new backup of memory that includes the loaded binary data
        // This ensures that reset() will restore to the state with the binary loaded
        creator.updateMainMemoryBackup(creator.main_memory.dump());

        return {
            status: "ok",
            msg: "Binary file loaded successfully",
        };
    } catch (error) {
        return {
            status: "error",
            msg: `Error loading binary file: ${(error as Error).message}`,
        };
    }
}

/**
 * Load binary file and set state
 */
export function loadBin(filePath: string): void {
    if (!filePath) {
        console.error("No binary file specified.");
        return;
    }

    const ret = loadBinaryFile(filePath);
    if (ret.status !== "ok") {
        console.error(ret.msg);
        process.exit(1);
    }

    cliState.binaryLoaded = true;
    console.log(ret.msg);
}

/**
 * Load library file
 */
export function loadLibrary(filePath: string): void {
    if (!filePath) {
        console.log("No library file specified.");
        return;
    }

    const libraryFile = fs.readFileSync(filePath, "utf8");
    creator.load_library(libraryFile);
    console.log("Library loaded successfully.");
}

/**
 * Assemble an assembly file
 */
export async function assemble(filePath: string, assembler?: string): Promise<void> {
    if (!filePath) {
        console.log("No assembly file specified.");
        return;
    }

    // Get function from the assembler map, with type safety
    const assemblerKey =
        assembler && assembler in assemblerMap
            ? (assembler as keyof typeof assemblerMap)
            : "default";
    const assemblerFunction = assemblerMap[assemblerKey];
    const assemblyFile = fs.readFileSync(filePath, "utf8");
    const ret: ReturnType = await creator.assembly_compile(
        assemblyFile,
        assemblerFunction,
    );
    if (ret && ret.status !== "ok") {
        console.error(ret.msg);
        process.exit(1);
    }
}
