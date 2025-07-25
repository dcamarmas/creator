/**
 *  Copyright 2018-2025 Felix Garcia Carballeira, Alejandro Calderon Mateos,
 *                      Diego Camarmas Alonso, Jorge Ramos Santana
 *
 *  This file is part of CREATOR.
 *
 *  CREATOR is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  CREATOR is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with CREATOR.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

import { raise } from "../capi/validation.mjs";
import { main_memory, MAXNWORDS, status, architecture } from "../core.mjs";
import { decode_instruction } from "../executor/decoder.mjs";
import ansicolor from "ansicolor";
import { resetStats } from "../executor/stats.mts";
import { enableInterrupts } from "@/core/executor/interrupts.mts";

/*Instructions memory address*/
export let address;
export function setAddress(address_) {
    address = address_;
}
/*Instructions memory*/
export const instructions = [];
export function clear_instructions() {
    instructions.splice(0, instructions.length);
}
export function setInstructions(instructions_) {
    instructions.splice(0, instructions.length, ...instructions_);
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

//
// Compiler
//

/*Compile assembly code*/

export function precomputeInstructions(sourceCode, sourceMap, tags = null) {
    // When we don't use the default compiler, we need to precompute the instructions.
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
        // Read up to MAXNWORDS words starting from the current address
        for (let j = 0; j < MAXNWORDS && idx + j < memory.length; j++) {
            const wordBytes = main_memory.readWord(memory[idx + j]);
            const word = Array.from(new Uint8Array(wordBytes))
                .map(byte => byte.toString(16).padStart(2, "0"))
                .join("");
            words.push(word);
        }
        const word = words.join("");
        const instruction = decode_instruction("0x" + word);
        // const instruction = {
        //     nwords: words.length,
        //     instructionExec: ""
        // };
        const machineCode = words
            .slice(0, instruction.nwords)
            .join("")
            .toUpperCase();

        if (instruction) {
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
                loaded: instruction.instructionExec,
                binary: false,
                user: userLine,
                _rowVariant: "",
                Break: false,
                hide: false,
                visible: true,
            });

            idx += instruction.nwords;
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

    // enable interrupts
    if (architecture.interrupts?.enabled) enableInterrupts();

    return compiler(code, library);
}
