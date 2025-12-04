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

import { raise } from "../capi/validation.mjs";
import { main_memory, status, architecture } from "../core.mjs";
import { MAXNWORDS } from "../utils/architectureProcessor.mjs";
import { decode } from "../executor/decoder.mjs";
import ansicolor from "ansicolor";
import { resetStats } from "../executor/stats.mts";

/*Instructions memory address*/
export let address;
export function setAddress(address_) {
    address = address_;
}
/*Instructions memory*/

/** @type {import("./assembler.d.ts").Instruction[]} */
export const instructions = [];
export function clear_instructions() {
    instructions.splice(0, instructions.length);
}
export function setInstructions(instructions_) {
    instructions.splice(0, instructions.length, ...instructions_);
}

/** @type {import("./assembler.d.ts").Instruction[]} */
export const libraryInstructions = [];
export function clearLibraryInstructions() {
    libraryInstructions.splice(0, libraryInstructions.length);
}
export function setLibraryInstructions(instructions_) {
    libraryInstructions.splice(0, libraryInstructions.length, ...instructions_);
}

export let tag_instructions = {};

export function set_tag_instructions(tag_instructions_) {
    tag_instructions = tag_instructions_;
}

/**
 * Helper function to write multi-byte values as words to memory
 * @param {bigint} addr - Starting memory address
 * @param {Uint8Array} bytes - Array of bytes to write
 * @param {number} wordSizeBytes - Size of each word in bytes
 */
export function writeMultiByteValueAsWords(addr, bytes, wordSizeBytes) {
    for (
        let wordOffset = 0;
        wordOffset < bytes.length;
        wordOffset += wordSizeBytes
    ) {
        const wordBytes = new Uint8Array(wordSizeBytes);
        for (
            let i = 0;
            i < wordSizeBytes && wordOffset + i < bytes.length;
            i++
        ) {
            wordBytes[i] = bytes[wordOffset + i];
        }
        main_memory.writeWord(addr + BigInt(wordOffset), wordBytes);
    }
}

/**
 * Converts error messages containing ANSI escape codes to HTML with CSS styling
 * @param {string|Error} error - Error message or Error object containing ANSI escape codes
 * @returns {string} HTML string with CSS styling preserving original colors
 */
export function formatErrorWithColors(error) {
    // Parse the error string (which contains ANSI escape codes) into spans
    const errorMsg = String(error);
    const parsed = ansicolor.parse(errorMsg);

    // Convert spans to HTML with CSS styling
    const htmlMsg = parsed.spans
        .map(span => {
            if (span.css) {
                return `<span style="${span.css}">${span.text}</span>`;
            }
            return span.text;
        })
        .join("");

    return htmlMsg;
}

export function getCleanErrorMessage(error) {
    const errorMsg = String(error);
    const parsed = ansicolor.parse(errorMsg);
    const cleanMsg = parsed.spans.map(span => span.text).join("");
    return cleanMsg;
}

/**
 * Parse a clean error message to extract structured error information for linting
 * Example input: "[E02] Error: Instruction no isn't defined\n   ╭─[ assembly:3:1 ]\n   │\n 3 │ no\n..."
 * @param {string} cleanErrorMessage - The clean error message (without ANSI codes)
 * @returns {{errorText: string, line: number, column: number} | null} Parsed error information or null if parsing fails
 */
export function parseErrorForLinter(cleanErrorMessage) {
    if (!cleanErrorMessage || typeof cleanErrorMessage !== "string") {
        return null;
    }

    // Extract the main error text (first line with [EXX] Error: ...)
    // Pattern: [E02] Error: ...
    const errorTextMatch = cleanErrorMessage.match(/^\[E\d+\]\s+Error:.*$/m);
    const errorText = errorTextMatch ? errorTextMatch[0].trim() : "";

    // Extract line and column from the assembly:LINE:COLUMN pattern
    // Pattern: assembly:3:1
    const locationMatch = cleanErrorMessage.match(/assembly:(\d+):(\d+)/);

    if (!locationMatch) {
        // If we can't find location info, return null or a default
        return errorText
            ? {
                  errorText,
                  line: 1,
                  column: 1,
              }
            : null;
    }

    const line = parseInt(locationMatch[1], 10);
    const column = parseInt(locationMatch[2], 10);

    return {
        errorText: errorText || "Compilation error",
        line,
        column,
    };
}

/**
 * Parse RASM assembler error messages to extract multiple errors
 * Example input: "Pre-processing [program.asm]\nAssembling\n[program.asm:2] Unknown LD format\n[program.asm:3] Unknown LD format\n2 errors"
 * @param {string} cleanErrorMessage - The clean error message (without ANSI codes)
 * @returns {{errorText: string, line: number, column: number}[]} Array of parsed error information
 */
export function parseRasmErrorsForLinter(cleanErrorMessage) {
    if (!cleanErrorMessage || typeof cleanErrorMessage !== "string") {
        return [];
    }

    const errors = [];

    // RASM error format: [filename:LINE] Error message
    // Pattern: [program.asm:2] Unknown LD format
    const errorPattern = /\[([^\]]+):(\d+)\]\s*(.+)/g;
    let match;

    while ((match = errorPattern.exec(cleanErrorMessage)) !== null) {
        const line = parseInt(match[2], 10);
        const errorMessage = match[3].trim();

        errors.push({
            errorText: errorMessage,
            line,
            column: 1, // RASM doesn't provide column info, default to 1
        });
    }

    // If no errors were found using the pattern, try to extract a general error
    if (errors.length === 0) {
        const lines = cleanErrorMessage
            .split("\n")
            .filter(l => l.trim().length > 0);
        // Look for lines that might contain error info (not pre-processing/assembling messages)
        const errorLines = lines.filter(
            l =>
                !l.includes("Pre-processing") &&
                !l.includes("Assembling") &&
                !l.match(/^\d+\s+errors?$/), // Skip "2 errors" summary line
        );

        if (errorLines.length > 0) {
            errors.push({
                errorText: errorLines.join(" "),
                line: 1,
                column: 1,
            });
        }
    }

    return errors;
}

export function precomputeInstructions(sourceCode, sourceMap, tags = null) {
    // When we don't use the default assembler, we need to precompute the instructions.
    // This is the array used to display the instructions in the UI.
    // To do so, we iterate through the binary file, and decode the instructions, adding them to the instructions array.

    const sourceLines = sourceCode ? sourceCode.split("\n") : [];

    // First we need to fetch only the addresses that have been written to memory.
    const segments = main_memory.getMemorySegments();
    const textSegment = segments.get("text");
    let memory = main_memory.getWrittenAddresses();
    memory = memory.filter(
        addr =>
            addr >= Number(textSegment.start) &&
            addr <= Number(textSegment.end),
    );
    if (memory.length === 0) {
        console.error("No memory written, cannot precompute instructions");
        return;
    }

    // Iterate through the memory addresses, decoding instructions.
    const instructions = [];
    let idx = 0;
    while (idx < memory.length) {
        const addr = memory[idx];
        const words = [];
        const allBytes = [];
        // Read up to MAXNWORDS words starting from the current address
        for (let j = 0; j < MAXNWORDS && idx + j < memory.length; j++) {
            const wordBytes = main_memory.readWord(BigInt(memory[idx + j]));
            const word = Array.from(new Uint8Array(wordBytes))
                .map(byte => byte.toString(16).padStart(2, "0"))
                .join("");
            words.push(word);
            allBytes.push(...new Uint8Array(wordBytes));
        }
        const decoded = decode(new Uint8Array(allBytes));

        if (decoded.status === "ok") {
            const machineCode = words
                .slice(0, decoded.instruction.nwords)
                .join("")
                .toUpperCase();
            let label = "";
            if (tags) {
                const foundTag = Object.keys(tags).find(
                    tag => Number(tags[tag]) === Number(addr),
                );
                if (foundTag) {
                    label = foundTag;
                }
            }

            // --- Find the user's source code for this instruction ---
            let userLine = "0x" + machineCode; // Default to machine code
            if (sourceMap && sourceMap[addr]) {
                const lineNumber = sourceMap[addr];
                if (lineNumber > 0 && lineNumber <= sourceLines.length) {
                    let line = sourceLines[lineNumber - 1];

                    line = line.replace(/;.*/, "").trim();

                    if (line) {
                        userLine = line;
                    }
                }
            }

            instructions.push({
                Address: "0x" + addr.toString(16),
                Label: label,
                loaded: decoded.assembly,
                binary: false,
                user: userLine,
                _rowVariant: "",
                Break: null,
                hide: false,
                visible: true,
            });

            idx += decoded.instruction.nwords;
        } else {
            // If decoding fails, skip to next address to avoid infinite loop
            idx += 1;
        }
    }

    setInstructions(instructions);
}

export function parseDebugSymbols(debugSymbols) {
    const symbols = {};
    const lines = debugSymbols.split("\n");
    for (const line of lines) {
        const parts = line.split(/\s+/);
        if (parts.length < 2) continue; // Skip invalid lines
        // In each line, the tag is whatever is before ":", and the address is whatever is after "0x"
        const tag = parts[0].replace(":", "");

        // now search in the full line for the address
        const address = parts.find(part => part.startsWith("0x"));
        if (!address) continue; // Skip lines without an address
        const addressValue = parseInt(address, 16);

        // Store the tag and address in the symbols object
        symbols[tag] = addressValue;
    }
    return symbols;
}

/**
 * Dispatcher for assembly compilers.
 * @param {string} code
 * @param {any} library
 * @param {string} compiler
 */
export function assembly_compiler(code, library, compiler) {
    // If no compiler is specified, error out
    if (!compiler) {
        raise("No compiler specified for assembly compilation");
    }

    // reset stats
    resetStats();
    status.executedInstructions = 0;
    status.clkCycles = 0;

    return compiler(code, library);
}
