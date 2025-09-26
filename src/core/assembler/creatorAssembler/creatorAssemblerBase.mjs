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

import {
    main_memory,
    status,
    update_binary,
    architecture,
    backup_stack_address,
    backup_data_address,
    newArchitecture,
    ENDIANNESSARR,
    WORDSIZE,
    BYTESIZE,
} from "../../core.mjs";
import { creator_ga } from "../../utils/creator_ga.mjs";
import {
    set_tag_instructions,
    writeMultiByteValueAsWords,
    setAddress,
    setInstructions,
    formatErrorWithColors,
} from "../assembler.mjs";
import { logger } from "../../utils/creator_logger.mjs";

let instructions_binary = [];

/**
 * Common assembly compiler implementation shared between web and deno versions
 * @param {string} code - Assembly code to compile
 * @param {boolean} library - Whether this is a library compilation
 * @param {Object} wasmModules - WASM modules containing ArchitectureJS and DataCategoryJS
 * @returns {Object} Compilation result
 */
// eslint-disable-next-line max-lines-per-function
export function assembleCreatorBase(code, library, wasmModules) {
    /* Google Analytics */
    creator_ga("compile", "compile.assembly");
    const color = 1;

    const { ArchitectureJS, DataCategoryJS } = wasmModules;

    let arch;
    try {
        arch = ArchitectureJS.from_json(JSON.stringify(architecture));
    } catch (error) {
        logger.error("Error loading architecture:", error);
        return {
            type: "warning",
            token: "Unsupported architecture",
            bgcolor: "danger",
            status: "error",
        };
    }
    const instructions = [];
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
    architecture.memory_layout.stack.start = backup_stack_address;
    architecture.memory_layout.data.end = backup_data_address;

    // Compile code
    let label_table;
    try {
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
            const data = data_mem[i];
            // const size = BigInt(data.size());
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
                                newArchitecture.config.word_size /
                                newArchitecture.config.byte_size;

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
                            const floatTag = labels[0] ?? "";
                            const floatType = "float32";
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
                                newArchitecture.config.word_size /
                                newArchitecture.config.byte_size;

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
                            const doubleTag = labels[0] ?? "";
                            const doubleType = "float64";
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
                            const byteTag = labels[0] ?? "";
                            const byteType = "byte";
                            main_memory.addHint(addr, byteTag, byteType, 8);
                            break;
                        }
                        case "word":
                            {
                                const wordValue = BigInt(
                                    "0x" + data.value(false),
                                );
                                // Get word size from architecture configuration
                                const wordSizeBytes =
                                    newArchitecture.config.word_size /
                                    newArchitecture.config.byte_size;
                                // Split the word into bytes
                                const wordBytes = new Uint8Array(wordSizeBytes);

                                // Extract bytes from the word value based on word size
                                for (let i = 0; i < wordSizeBytes; i++) {
                                    const shiftAmount = BigInt(
                                        (wordSizeBytes - 1 - i) *
                                            newArchitecture.config.byte_size,
                                    );
                                    wordBytes[i] = Number(
                                        (wordValue >> shiftAmount) &
                                            BigInt(
                                                (1 <<
                                                    newArchitecture.config
                                                        .byte_size) -
                                                    1,
                                            ),
                                    );
                                }

                                main_memory.writeWord(addr, wordBytes);

                                // Add memory hint for the word
                                const wordTag = labels[0] ?? "";
                                const wordType = "word";
                                main_memory.addHint(
                                    addr,
                                    wordTag,
                                    wordType,
                                    newArchitecture.config.word_size,
                                );
                            }

                            break;

                        case "double_word": {
                            const dwordValue = BigInt("0x" + data.value(false));
                            // Get word size from architecture configuration
                            const wordSizeBytes =
                                newArchitecture.config.word_size /
                                newArchitecture.config.byte_size;

                            // Split dword into two words (high and low)
                            const highWord =
                                dwordValue >>
                                BigInt(newArchitecture.config.word_size);
                            const lowWord =
                                dwordValue &
                                BigInt(
                                    (1n <<
                                        BigInt(
                                            newArchitecture.config.word_size,
                                        )) -
                                        1n,
                                );

                            // Convert words to byte arrays
                            const highWordBytes = new Uint8Array(wordSizeBytes);
                            const lowWordBytes = new Uint8Array(wordSizeBytes);

                            for (let i = 0; i < wordSizeBytes; i++) {
                                const shiftAmount = BigInt(
                                    (wordSizeBytes - 1 - i) *
                                        newArchitecture.config.byte_size,
                                );
                                highWordBytes[i] = Number(
                                    (highWord >> shiftAmount) &
                                        BigInt(
                                            (1 <<
                                                newArchitecture.config
                                                    .byte_size) -
                                                1,
                                        ),
                                );
                                lowWordBytes[i] = Number(
                                    (lowWord >> shiftAmount) &
                                        BigInt(
                                            (1 <<
                                                newArchitecture.config
                                                    .byte_size) -
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
                            const dwordTag = labels[0] ?? "";
                            const dwordType = "dword";
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
                            const halfTag = labels[0] ?? "";
                            const halfType = "half";
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
                    const stringTag = labels[0] ?? "";
                    const stringType = "string";
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
                    const spaceTag = labels[0] ?? "";
                    const spaceType =
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
            msg: formatErrorWithColors(error),
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

    if (typeof document !== "undefined" && document.app)
        document.app.$data.instructions = instructions;

    const tag_instructions = {};
    for (const [name, info] of Object.entries(label_table)) {
        tag_instructions[info.address] = {
            tag: name,
            global: info.global,
        };
    }

    setAddress(architecture.memory_layout.text.start);
    setInstructions(instructions);
    set_tag_instructions(tag_instructions);
    return {
        errorcode: "",
        token: "",
        type: "",
        update: "",
        status: "ok",
    };
}
