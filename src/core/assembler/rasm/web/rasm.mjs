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

import { RasmModule } from "./wasm/rasm.js";
import { main_memory } from "../../../core.mjs";
import {
    precomputeInstructions,
    set_tag_instructions,
    formatErrorWithColors,
    getCleanErrorMessage,
    parseRasmErrorsForLinter,
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

// eslint-disable-next-line max-lines-per-function
export async function rasmAssemble(code) {
    // Re-initialize WASM module every time
    let rasmModule;
    const result = {
        errorcode: "",
        token: "",
        type: "",
        update: "",
        status: "ko",
        binary: "",
    };

    // Arrays to capture stdout and stderr
    const capturedStdout = [];
    const capturedStderr = [];

    try {
        // Load the rasm WebAssembly module
        rasmModule = await RasmModule({
            locateFile: file => {
                return new URL(`./wasm/${file}`, import.meta.url).href;
            },
            print: text => {
                capturedStdout.push(text);
                console.log(text); // Still log to console for debugging
            },
            printErr: text => {
                capturedStderr.push(text);
                console.error(text); // Still log to console for debugging
            },
        });

        if (!rasmModule.FS) {
            throw new Error("File system not available in WebAssembly module");
        }

        // Always use fixed filenames
        const filename = "program";
        const asmFilename = filename + ".asm";
        const binFilename = filename + ".bin";
        const symFilename = filename + ".sym";

        // Write source as-is
        rasmModule.FS.writeFile(asmFilename, code);

        // check if the file exists
        if (!rasmModule.FS.analyzePath(asmFilename).exists) {
            result.status = "ko";
            result.update = "Assembly source file not found: " + asmFilename;
            return result;
        }

        // --- FIRST PASS: Check for errors without the map ---

        // Clear any output from WASM module initialization before the first run
        capturedStdout.length = 0;
        capturedStderr.length = 0;

        const args_no_map = [
            asmFilename,
            "-sp",
            "-os",
            symFilename,
            "-ob",
            binFilename,
        ];

        // Call main function for the first pass
        const first_exit_code = rasmModule.callMain(args_no_map);

        // Check for errors. If an error occurs, the output will not contain the map.
        if (first_exit_code !== 0) {
            const rasmErrorOutput =
                capturedStdout.join("\n") + capturedStderr.join("\n");
            const cleanErrorText = getCleanErrorMessage(rasmErrorOutput);
            result.msg = formatErrorWithColors(rasmErrorOutput);
            result.type = "error";
            result.bgcolor = "danger";
            result.status = "error";
            // Parse multiple errors from RASM output
            result.linter = parseRasmErrorsForLinter(cleanErrorText);

            return result;
        }

        // --- SECOND PASS: If successful, run again to get the map ---

        // Clear the output from the first successful run
        capturedStdout.length = 0;
        capturedStderr.length = 0;

        const args_with_map = [
            asmFilename,
            "-sp",
            "-os",
            symFilename,
            "-ob",
            binFilename,
            "-map",
        ];

        // Call main again, this time with the -map flag
        const second_exit_code = rasmModule.callMain(args_with_map);
        const rasmConsoleOutput =
            capturedStdout.join("\n") + capturedStderr.join("\n");

        // This is a safeguard; it shouldn't fail if the first pass succeeded.
        if (second_exit_code !== 0) {
            throw new Error(
                `Assembly inconsistency: The assembler failed on the second pass (with -map) after succeeding on the first. Output:\n${rasmConsoleOutput}`,
            );
        }

        // --- PROCESS SUCCESSFUL ASSEMBLY ---

        if (!rasmModule.FS.analyzePath(binFilename).exists) {
            result.msg = "No binary file generated";
            result.type = "error";
            result.bgcolor = "danger";
            result.status = "error";
            return result;
        }

        const binary = rasmModule.FS.readFile(binFilename, {
            encoding: "binary",
        });

        // Debug symbols
        let parsedSymbols = {};
        if (rasmModule.FS.analyzePath(symFilename).exists) {
            const debugSymbols = rasmModule.FS.readFile(symFilename, {
                encoding: "utf8",
            });
            // Parse debug symbols if available
            parsedSymbols = parseDebugSymbolsRASM(debugSymbols);
        }

        const sourceMap = parseSourceLineMapping(rasmConsoleOutput);

        main_memory.loadROM(binary);
        precomputeInstructions(code, sourceMap, parsedSymbols);

        // Add hints to memory based on the parsed labels
        for (const [name, addr] of Object.entries(parsedSymbols)) {
            main_memory.addHint(addr, name);
        }

        // Set the tag instructions for the parsed symbols
        set_tag_instructions(toTagInstructions(parsedSymbols));

        // Add captured logs to result
        result.binary = binary;
        result.stdout = rasmConsoleOutput;
        result.sourceMap = sourceMap;
        result.status = "ok";
    } catch (error) {
        console.error("Assembly error:", error);
        result.msg = error.message;
        result.type = "error";
        result.bgcolor = "danger";
        result.status = "error";
    }

    return result;
}
