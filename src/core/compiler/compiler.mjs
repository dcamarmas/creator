/*
 *  Copyright 2018-2025 Felix Garcia Carballeira, Alejandro Calderon Mateos, Diego Camarmas Alonso
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
"use strict";
import { raise } from "../capi/validation.mjs";
import {
    architecture,
    newArchitecture,
    architecture_hash,
    status,
    code_assembly,
    update_binary,
    backup_stack_address,
    backup_data_address,
    arch,
    REGISTERS,
    main_memory,
    BYTESIZE,
    WORDSIZE,
    ENDIANNESSARR,
    MAXNWORDS,
} from "../core.mjs";
import { decode_instruction } from "../executor/decoder.mjs";
import { bi_intToBigInt } from "../utils/bigint.mjs";
import { creator_ga } from "../utils/creator_ga.mjs";
import { logger } from "../utils/creator_logger.mjs";
import { bin2hex, isDeno, isWeb, uint_to_float64 } from "../utils/utils.mjs";
import { resetStats } from "../executor/stats.mts";

const compiler_map = {
    default: assembly_compiler_default,
    sjasmplus: console.log("womp womp"),
};

// Conditional import for the WASM compiler based on the environment (web or Deno)
import { DataCategoryJS as DataCategoryJS_web } from "./web/creator_compiler.js";
import { DataCategoryJS as DataCategoryJS_deno } from "./deno/creator_compiler.js";

let DataCategoryJS;
if (isDeno) {
    // Deno HAS to be imported like this, as it doesn't provide a default
    DataCategoryJS = DataCategoryJS_deno;
} else if (isWeb) {
    DataCategoryJS = DataCategoryJS_web;
} else {
    throw new Error(
        "Unsupported environment: neither Deno nor web browser detected",
    );
}

/*Compilation index*/
const tokenIndex = 0;
let nEnters = 0;
let pc = 4; //PRUEBA
export let align;

/*Instructions memory address*/
export let address;
/*Error code messages*/
const compileError = {
    m0: function (ret) {
        return String(ret.token);
    },
    m1: function (ret) {
        return String("Repeated tag: " + ret.token);
    },
    m2: function (ret) {
        return "Instruction '" + ret.token + "' not found";
    },
    m3: function (ret) {
        return "Incorrect instruction syntax for '" + ret.token + "'";
    },
    m4: function (ret) {
        return "Register '" + ret.token + "' not found";
    },
    m5: function (ret) {
        return "Immediate number '" + ret.token + "' is too big";
    },
    m6: function (ret) {
        return "Immediate number '" + ret.token + "' is not valid";
    },
    m7: function (ret) {
        return "Tag '" + ret.token + "' is not valid";
    },
    m8: function (ret) {
        return "Address '" + ret.token + "' is too big";
    },
    m9: function (ret) {
        return "Address '" + ret.token + "' is not valid";
    },
    m10: function (ret) {
        return (
            ".space value out of range (" +
            ret.token +
            " is greater than 50MiB)"
        );
    },
    m11: function (ret) {
        return "The space directive value should be positive and greater than zero";
    },
    m12: function (ret) {
        return String(
            "This field is too small to encode in binary '" + ret.token,
        );
    },
    m13: function (ret) {
        return String("Incorrect pseudoinstruction definition " + ret.token);
    },
    m14: function (ret) {
        return String("Invalid directive: " + ret.token);
    },
    m15: function (ret) {
        return "Invalid value '" + ret.token + "' as number.";
    },
    m16: function (ret) {
        return String('The string of characters must start with "' + ret.token);
    },
    m17: function (ret) {
        return String('The string of characters must end with "' + ret.token);
    },
    m18: function (ret) {
        return "Number '" + ret.token + "' is too big";
    },
    m19: function (ret) {
        return "Number '" + ret.token + "' is empty";
    },
    //'m20': function(ret) { return "The text segment should start with '"       + ret.token + "'" },
    m21: function (ret) {
        return String("The data must be aligned" + ret.token);
    },
    m22: function (ret) {
        return "The number should be positive '" + ret.token + "'";
    },
    m23: function (ret) {
        return String("Empty directive" + ret.token);
    },
    m24: function (ret) {
        return String("After the comma you should go a blank --> " + ret.token);
    },
    //'m25': function(ret) { return "Incorrect syntax "                          + ret.token + "" },
    m26: function (ret) {
        return String("Syntax error near line: " + ret.token);
    },
    m27: function (ret) {
        return "Please check instruction syntax, inmediate ranges, register name, etc.";
    },
};
/*Instructions memory*/
export let instructions = [];
export function clear_instructions() {
    instructions = [];
}
export function set_instructions(value) {
    instructions = value;
}
export let tag_instructions = {};
let instructions_binary = [];

/*Binary*/

export function setInstructions(instructions_) {
    instructions = instructions_;
}

/**
 * Helper function to write multi-byte values as words to memory
 * @param {bigint} addr - Starting memory address
 * @param {Uint8Array} bytes - Array of bytes to write
 * @param {number} wordSizeBytes - Size of each word in bytes
 */
function writeMultiByteValueAsWords(addr, bytes, wordSizeBytes) {
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

//
// Compiler
//

/*Compile assembly code*/

export function precomputeInstructions(tags = null) {
    // When we don't use the default compiler, we need to precompute the instructions.
    // To do so, we iterate through the binary file, and decode the instructions, adding them to the instructions array.

    // First we need to fetch only the addresses that have been written to memory.
    const segments = main_memory.getMemorySegments();
    const textSegment = segments.get("text");
    let memory = main_memory.getWrittenAddresses();
    memory = memory.filter(
        addr =>
            addr >= Number(textSegment.startAddress) &&
            addr <= Number(textSegment.endAddress),
    );
    if (memory.length === 0) {
        raise("No memory written, cannot precompute instructions");
    }

    // Iterate through the memory addresses, decoding instructions.
    instructions = [];
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

        // Get only the first nwords for the machine code
        const machineCode = words
            .slice(0, instruction.nwords)
            .join("")
            .toUpperCase();

        if (instruction) {
            // Find tag label for this address if tags are provided
            let label = "";
            if (tags) {
                for (const [tag, tagAddr] of Object.entries(tags)) {
                    if (Number(addr) === Number(tagAddr)) {
                        label = tag;
                        break;
                    }
                }
            }
            instructions.push({
                Address: "0x" + addr.toString(16),
                Label: label,
                loaded: instruction.instructionExec,
                binary: false,
                user: "0x" + machineCode,
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
    console.log("Instructions precomputed successfully");
}

function parseDebugSymbols(debugSymbols) {
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

// eslint-disable-next-line max-lines-per-function
function assembly_compiler_default(code, library, color) {
    /* Google Analytics */
    creator_ga("compile", "compile.assembly");

    instructions = [];
    tag_instructions = {};
    main_memory.zeroOut();
    main_memory.clearHints(); // Clear any existing memory hints
    status.execution_init = 1;

    let library_offset = 0;
    const library_instructions = update_binary.instructions_binary?.length ?? 0;
    for (let i = 0; i < library_instructions; i++) {
        const instruction = update_binary.instructions_binary[i];
        instruction.hide = !(i === 0 || instruction.globl === true);
        if (instruction.globl !== true) {
            instruction.Label = "";
        }
        instructions.push(instruction);
        library_offset =
            parseInt(instruction.Address, 16) +
            Math.ceil(instruction.loaded.length / 8);
    }

    // Convert the library labels to the format used by the compiler,
    // filtering out non-global labels
    const library_labels =
        update_binary.instructions_tag
            ?.filter(x => x.globl)
            .reduce((tbl, x) => {
                tbl[x.tag] = x.addr;
                return tbl;
            }, {}) ?? {};
    const labels_json = JSON.stringify(library_labels);

    /*Allocation of memory addresses*/
    architecture.memory_layout[4].value = backup_stack_address;
    architecture.memory_layout[3].value = backup_data_address;

    /* Reset stats */

    resetStats()

    status.executedInstructions = 0;
    status.clkCycles = 0;

    // Compile code
    let label_table;
    try {
        // Verify an architecture has been loaded
        if (arch === undefined || arch === null) {
            return {
                errorcode: "100",
                token: "Please load an architecture before compiling",
                type: "warning",
                bgcolor: "danger",
                status: "error",
            };
        }
        // Compile assembly
        const compiled = arch.compile(
            code,
            library_offset,
            labels_json,
            library ?? false,
            color,
        );
        // Extract instructions
        instructions.push(
            ...compiled.instructions.map(x => ({
                Address: x.address,
                Label: x.labels[0] ?? "",
                loaded: x.loaded,
                binary: x.binary,
                user: x.user,
                Break: null,
                hide: false,
                visible: true,
            })),
        );
        // Extract binary instructions for library
        instructions_binary = instructions.map((x, idx) => ({
            Address: x.Address,
            Label: x.Label,
            Break: null,
            // Newly compiled instructions have their binary encoding in the
            // `binary` field, but instructions from the library store it in
            // the `loaded` field. Read the corresponding field depending on
            // where the instruction comes from, knowing that the first
            // `library_instructions` instructions come from the library
            loaded: idx < library_instructions ? x.loaded : x.binary,
            visible: false,
            user: null,
        }));
        // Extract label table for library
        label_table = compiled.label_table.reduce((tbl, x) => {
            tbl[x.name] = { address: x.address, global: x.global };
            return tbl;
        }, {});
        // Extract data elements and load them on memory
        const data_mem = compiled.data;
        for (let i = 0; i < data_mem.length; i++) {
            const data = compiled.data[i];
            const size = BigInt(data.size());
            const addr = BigInt(data.address());
            const labels = data.labels();

            switch (data.data_category()) {
                case DataCategoryJS.Number:
                    switch (data.type()) {
                        case "float": {
                            const floatValue = data.value(true);
                            // Convert float to 32-bit IEEE 754 representation
                            const buffer = new ArrayBuffer(4);
                            const view = new DataView(buffer);
                            view.setFloat32(0, floatValue, false);

                            // Get word size from architecture configuration
                            const wordSizeBytes =
                                newArchitecture.arch_conf.WordSize /
                                newArchitecture.arch_conf.ByteSize;

                            // Extract bytes from the float's binary representation
                            const floatBytes = new Uint8Array(4);
                            for (let i = 0; i < 4; i++) {
                                floatBytes[i] = view.getUint8(i);
                            }

                            // Write the float as words to memory
                            writeMultiByteValueAsWords(
                                addr,
                                floatBytes,
                                wordSizeBytes,
                            );

                            // Add memory hint for the float
                            let floatTag = labels[0] ?? "";
                            let floatType = "float32";
                            main_memory.addHint(addr, floatTag, floatType, 32);
                            break;
                        }
                        case "double": {
                            const doubleValue = data.value(true);
                            // Convert double to 64-bit IEEE 754 representation
                            const buffer = new ArrayBuffer(8);
                            const view = new DataView(buffer);
                            view.setFloat64(0, doubleValue, false); // false = big-endian

                            // Get word size from architecture configuration
                            const wordSizeBytes =
                                newArchitecture.arch_conf.WordSize /
                                newArchitecture.arch_conf.ByteSize;

                            // Extract bytes from the double's binary representation
                            const doubleBytes = new Uint8Array(8);
                            for (let i = 0; i < 8; i++) {
                                doubleBytes[i] = view.getUint8(i);
                            }

                            // Write the double as words to memory
                            writeMultiByteValueAsWords(
                                addr,
                                doubleBytes,
                                wordSizeBytes,
                            );

                            // Add memory hint for the double
                            let doubleTag = labels[0] ?? "";
                            let doubleType = "float64";
                            main_memory.addHint(
                                addr,
                                doubleTag,
                                doubleType,
                                64,
                            );
                            break;
                        }
                        case "byte": {
                            const byteValue = Number("0x" + data.value(false));
                            main_memory.write(addr, byteValue);

                            // Add memory hint for the byte
                            let byteTag = labels[0] ?? "";
                            let byteType = "byte";
                            main_memory.addHint(addr, byteTag, byteType, 8);
                            break;
                        }
                        case "word":
                            {
                                const wordValue = BigInt("0x" + data.value(false));
                                // Get word size from architecture configuration
                                const wordSizeBytes =
                                    newArchitecture.arch_conf.WordSize /
                                    newArchitecture.arch_conf.ByteSize;
                                // Split the word into bytes
                                const wordBytes = new Uint8Array(wordSizeBytes);

                                // Extract bytes from the word value based on word size
                                for (let i = 0; i < wordSizeBytes; i++) {
                                    const shiftAmount = BigInt(
                                        (wordSizeBytes - 1 - i) *
                                            newArchitecture.arch_conf.ByteSize,
                                    );
                                    wordBytes[i] = Number(
                                        (wordValue >> shiftAmount) &
                                            BigInt(
                                                (1 <<
                                                    newArchitecture.arch_conf
                                                        .ByteSize) -
                                                    1,
                                            ),
                                    );
                                }

                                main_memory.writeWord(addr, wordBytes);

                                // Add memory hint for the word
                                let wordTag = labels[0] ?? "";
                                let wordType = "word";
                                main_memory.addHint(
                                    addr,
                                    wordTag,
                                    wordType,
                                    newArchitecture.arch_conf.WordSize,
                                );
                            }

                            break;

                        case "double_word": {
                            const dwordValue = BigInt("0x" + data.value(false));
                            // Get word size from architecture configuration
                            const wordSizeBytes =
                                newArchitecture.arch_conf.WordSize /
                                newArchitecture.arch_conf.ByteSize;

                            // Split dword into two words (high and low)
                            const highWord =
                                dwordValue >>
                                BigInt(newArchitecture.arch_conf.WordSize);
                            const lowWord =
                                dwordValue &
                                BigInt(
                                    (1n <<
                                        BigInt(
                                            newArchitecture.arch_conf.WordSize,
                                        )) -
                                        1n,
                                );

                            // Convert words to byte arrays
                            const highWordBytes = new Uint8Array(wordSizeBytes);
                            const lowWordBytes = new Uint8Array(wordSizeBytes);

                            for (let i = 0; i < wordSizeBytes; i++) {
                                const shiftAmount = BigInt(
                                    (wordSizeBytes - 1 - i) *
                                        newArchitecture.arch_conf.ByteSize,
                                );
                                highWordBytes[i] = Number(
                                    (highWord >> shiftAmount) &
                                        BigInt(
                                            (1 <<
                                                newArchitecture.arch_conf
                                                    .ByteSize) -
                                                1,
                                        ),
                                );
                                lowWordBytes[i] = Number(
                                    (lowWord >> shiftAmount) &
                                        BigInt(
                                            (1 <<
                                                newArchitecture.arch_conf
                                                    .ByteSize) -
                                                1,
                                        ),
                                );
                            }

                            // Write two words to memory
                            main_memory.writeWord(addr, highWordBytes);
                            main_memory.writeWord(
                                addr + BigInt(wordSizeBytes),
                                lowWordBytes,
                            );

                            // Add memory hint for the dword
                            let dwordTag = labels[0] ?? "";
                            let dwordType = "dword";
                            main_memory.addHint(addr, dwordTag, dwordType, 64);
                            break;
                        }

                        case "half": {
                            const halfValue = BigInt("0x" + data.value(false));
                            // Split the half-word into bytes
                            const halfBytes = new Uint8Array(2);
                            halfBytes[0] = Number((halfValue >> 8n) & 0xffn);
                            halfBytes[1] = Number(halfValue & 0xffn);

                            // Reorder bytes according to endianness
                            // For half-word, we need to determine the byte order within a 2-byte boundary
                            // Extract the relative ordering from ENDIANNESSARR for the first 2 bytes

                            // This might seem obvious, but even though ENDIANNESSARR contains the ordering
                            // of the bytes within a word, and it can be any order (not just big-endian or
                            // little-endian), if we're looking at a half-word (2 bytes), the order can
                            // ONLY be one of two possibilities:
                            // 1. Big-endian: byte0 first, byte1 second
                            // 2. Little-endian: byte1 first, byte0 second

                            const orderedBytes = new Uint8Array(2);

                            // Find which positions in ENDIANNESSARR correspond to bytes 0 and 1
                            const byte0Pos = ENDIANNESSARR.indexOf(0);
                            const byte1Pos = ENDIANNESSARR.indexOf(1);

                            // Order the bytes according to their positions
                            if (byte0Pos < byte1Pos) {
                                // Big-endian order for half-word
                                orderedBytes[0] = halfBytes[0];
                                orderedBytes[1] = halfBytes[1];
                            } else {
                                // Little-endian order for half-word
                                orderedBytes[0] = halfBytes[1];
                                orderedBytes[1] = halfBytes[0];
                            }

                            // Write byte by byte
                            main_memory.write(addr, orderedBytes[0]);
                            main_memory.write(addr + 1n, orderedBytes[1]);

                            // Add memory hint for the half-word
                            let halfTag = labels[0] ?? "";
                            let halfType = "half";
                            main_memory.addHint(addr, halfTag, halfType, 16);

                            break;
                        }
                        default: {
                            throw new Error(
                                `Unsupported number type: ${data.type()}`,
                            );
                        }
                    }

                    break;
                case DataCategoryJS.String: {
                    const encoder = new TextEncoder();
                    let currentAddr = addr;
                    const startAddr = addr;

                    for (const ch_h of data.value(false)) {
                        const bytes = new Uint8Array(4);
                        const n = encoder.encodeInto(ch_h, bytes).written;
                        // Write the string to memory
                        for (let j = 0; j < n; j++) {
                            main_memory.write(currentAddr, bytes[j]);
                            currentAddr++;
                        }
                    }

                    // Add memory hint for the string
                    const stringLength = Number(currentAddr - startAddr);
                    let stringTag = labels[0] ?? "";
                    let stringType = "string";
                    main_memory.addHint(
                        startAddr,
                        stringTag,
                        stringType,
                        stringLength * 8,
                    ); // stringLength in bytes * 8 bits per byte
                    break;
                }
                case DataCategoryJS.Padding:
                case DataCategoryJS.Space: {
                    const space_size = BigInt(data.size());
                    if (space_size < 0n) {
                        throw new Error(
                            "The space directive value should be positive and greater than zero",
                        );
                    }
                    if (space_size > 50n * 1024n * 1024n) {
                        throw new Error(
                            ".space value out of range (greater than 50MiB)",
                        );
                    }
                    // Write zeroes to the memory
                    for (let j = 0n; j < space_size; j++) {
                        main_memory.write(addr + j, 0);
                    }

                    // Add memory hint for the space/padding
                    let spaceTag = labels[0] ?? "";
                    let spaceType =
                        data.data_category() === DataCategoryJS.Padding
                            ? "padding"
                            : "space";
                    main_memory.addHint(
                        addr,
                        spaceTag,
                        spaceType,
                        Number(space_size) * 8,
                    ); // space_size in bytes * 8 bits per byte
                    break;
                }
                default:
                    throw new Error(
                        `Unknown data category: ${data.data_category()}`,
                    );
            }
        }
        // Catch any errors thrown by the compiler
    } catch (error) {
        return {
            errorcode: "101",
            type: "error",
            bgcolor: "danger",
            status: "error",
            msg: error,
        };
    }

    /* Enter the binary in the text segment */
    for (const instruction of update_binary.instructions_binary ?? []) {
        const auxAddr = parseInt(instruction.Address, 16);

        // Split binary into words and write to memory
        for (let j = 0; j < instruction.loaded.length; j += WORDSIZE) {
            const wordBinary = instruction.loaded.substr(j, WORDSIZE);
            const wordBytes = [];

            // Split word into bytes
            for (let k = 0; k < wordBinary.length; k += BYTESIZE) {
                const byte = parseInt(wordBinary.substr(k, BYTESIZE), 2);
                wordBytes.push(byte);
            }

            main_memory.writeWord(BigInt(auxAddr + j / BYTESIZE), wordBytes);
        }
    }

    /* Enter the assembled instructions in the text segment */
    for (let i = library_instructions; i < instructions.length; i++) {
        const instruction = instructions[i];
        const baseAddr = parseInt(instruction.Address, 16);

        // Split binary into words and write to memory
        for (let j = 0; j < instruction.binary.length; j += WORDSIZE) {
            const wordBinary = instruction.binary.substr(j, WORDSIZE);
            const wordBytes = [];

            // Split word into bytes
            for (let k = 0; k < wordBinary.length; k += BYTESIZE) {
                const byte = parseInt(wordBinary.substr(k, BYTESIZE), 2);
                wordBytes.push(byte);
            }

            main_memory.writeWord(BigInt(baseAddr + j / BYTESIZE), wordBytes);
        }
    }

    /*Save binary*/
    for (const instruction of instructions_binary) {
        if (instruction.Label !== "") {
            if (label_table[instruction.Label].global === true) {
                instruction.globl = true;
            } else {
                instruction.Label = "";
            }
        }
    }

    if (typeof document !== "undefined")
        document.app.$data.instructions = instructions;

    address = parseInt(architecture.memory_layout[0].value, 16);

    return {
        errorcode: "",
        token: "",
        type: "",
        update: "",
        status: "ok",
    };
}

/**
 * Dispatcher for assembly compilers.
 * @param {string} code
 * @param {any} library
 * @param {any} color
 * @param {string} compiler
 */
export function assembly_compiler(code, library, color, compiler = "default") {
    const fn = compiler_map[compiler] || compiler_map.default;
    return fn(code, library, color);
}
