/**
 *  Copyright 2018-2025 Felix Garcia Carballeira, Alejandro Calderon Mateos,
 *                      Diego Camarmas Alonso
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

import { main_memory, stackTracker, BYTESIZE } from "../core.mjs";
import { creator_executor_exit } from "../executor/executor.mjs";
import { raise } from "./validation.mjs";
import { crex_findReg } from "../register/registerLookup.mjs";
import {
    creator_callstack_newWrite,
    creator_callstack_newRead,
} from "../sentinel/sentinel.mjs";

/*
 *  CREATOR instruction description API:
 *  Memory access
 */

/**
 * Writes a value to memory respecting endianness configuration
 * @param {bigint} address - Memory address to write to
 * @param {bigint} value - Value to write
 * @param {number} bytes - Number of bytes to write
 * @returns {number[]} - Array of bytes written
 */
function writeValueToMemory(address, value, bytes) {
    if (value < 0n) {
        throw "The value to write must be a positive integer";
    }

    const wordSize = main_memory.getWordSize();

    if (bytes === 1) {
        // Single byte write
        const byteValue = Number(value & 0xffn);
        main_memory.write(address, byteValue);
        return [byteValue];
    } else if (bytes <= wordSize) {
        // Multi-byte value that fits within a word
        const byteArray = main_memory.splitToBytes(value);

        // Pad from the left (most significant bytes) to match requested size
        const paddedByteArray = new Array(bytes).fill(0);
        const startIndex = Math.max(0, bytes - byteArray.length);
        for (let i = 0; i < byteArray.length && i < bytes; i++) {
            paddedByteArray[startIndex + i] = byteArray[i];
        }

        if (bytes === wordSize) {
            // Write as a full word
            main_memory.writeWord(address, paddedByteArray);
        } else {
            // Write individual bytes for partial word
            for (let i = 0; i < paddedByteArray.length; i++) {
                main_memory.write(address + BigInt(i), paddedByteArray[i]);
            }
        }
        return paddedByteArray;
    } else {
        // Value spans multiple words
        const byteArray = main_memory.splitToBytes(value);

        // Pad from the left to match requested size
        const paddedByteArray = new Array(bytes).fill(0);
        const startIndex = Math.max(0, bytes - byteArray.length);
        for (let i = 0; i < byteArray.length && i < bytes; i++) {
            paddedByteArray[startIndex + i] = byteArray[i];
        }

        // Write as multiple words
        let currentAddr = address;
        for (let i = 0; i < paddedByteArray.length; i += wordSize) {
            const wordBytes = paddedByteArray.slice(i, i + wordSize);
            // Pad the word if necessary
            while (wordBytes.length < wordSize) {
                wordBytes.push(0);
            }
            main_memory.writeWord(currentAddr, wordBytes);
            currentAddr += BigInt(wordSize);
        }
        return paddedByteArray;
    }
}

/**
 * Reads a value from memory respecting endianness configuration
 * @param {bigint} addr - Memory address to read from
 * @param {bigint} bytes - Number of bytes to read
 * @returns {bigint} - The value read from memory
 */
function readValueFromMemory(addr, bytes) {
    const wordSize = main_memory.getWordSize();
    bytes = BigInt(bytes);
    if (bytes === 1n) {
        // Single byte - read directly
        return BigInt(main_memory.read(addr));
    } else if (bytes <= wordSize) {
        // Multi-byte value that fits within a word - use readWord to respect endianness
        const wordAddr = addr - (addr % BigInt(wordSize));
        const word = main_memory.readWord(wordAddr);
        const byteOffset = Number(addr % BigInt(wordSize));

        // Extract the relevant bytes from the word
        let val = 0n;
        for (let i = 0; i < Number(bytes); i++) {
            const byteIndex = byteOffset + i;
            if (byteIndex < wordSize) {
                val =
                    (val << BigInt(main_memory.getBitsPerByte())) |
                    BigInt(word[byteIndex]);
            }
        }
        return val;
    } else {
        // Value spans multiple words - read as individual words
        let val = 0n;
        let currentAddr = addr;
        let remainingBytes = Number(bytes);

        while (remainingBytes > 0) {
            const bytesThisWord = Math.min(wordSize, remainingBytes);
            const word = main_memory.readWord(currentAddr);

            // Extract bytes from this word (from the end for big-endian result)
            const startIdx = wordSize - bytesThisWord;
            for (let i = startIdx; i < wordSize; i++) {
                val =
                    (val << BigInt(main_memory.getBitsPerByte())) |
                    BigInt(word[i]);
            }

            currentAddr += BigInt(wordSize);
            remainingBytes -= bytesThisWord;
        }
        return val;
    }
}

/*
 * Name:        mp_write - Write value into a memory address
 * Sypnosis:    mp_write (destination_address, value2store, byte_or_half_or_word)
 * Description: similar to memmove/memcpy, store a value into an address
 */
// Memory operations
export const MEM = {
    write(address, bytes, value, reg_name, hint) {
        // Check if the address is in a writable segment using memory functions
        const segment = main_memory.getSegmentForAddress(address);
        if (segment === "text") {
            raise("Segmentation fault. You tried to write in the text segment");
            creator_executor_exit(true);
        }

        // Validate that write access is allowed for this address
        if (!main_memory.isValidAccess(address, "write")) {
            raise(
                "Segmentation fault. Write access denied for address '0x" +
                    address.toString(16) +
                    "'",
            );
            creator_executor_exit(true);
        }

        let byteArray;
        try {
            byteArray = writeValueToMemory(address, value, bytes);
        } catch (_e) {
            raise(
                "Invalid memory access to address '0x" +
                    address.toString(16) +
                    "'",
            );
            creator_executor_exit(true);
        }

        // Add hint if provided
        if (hint) {
            try {
                const sizeInBits = bytes * BYTESIZE;
                main_memory.addHint(address, "", hint, sizeInBits);
            } catch (e) {
                raise(
                    "Failed to add hint for address '0x" +
                        address.toString(16) +
                        "': " +
                        e,
                );
            }
        }

        const ret = crex_findReg(reg_name);
        if (ret.match === 0) {
            return;
        }

        const i = ret.indexComp;
        const j = ret.indexElem;

        // Add stack hint if we're writing to the stack segment and have a register name
        if (segment === "stack" && reg_name) {
            stackTracker.addHint(address, reg_name);
        }

        creator_callstack_newWrite(i, j, address, byteArray.length);
    },

    read(addr, bytes, reg_name) {
        // Implementation of capi_mem_read
        let val = 0n;

        // Check if the address is in a readable segment using memory functions
        const segment = main_memory.getSegmentForAddress(addr);
        if (segment === "text") {
            raise("Segmentation fault. You tried to read in the text segment");
            creator_executor_exit(true);
        }

        // Validate that read access is allowed for this address
        if (!main_memory.isValidAccess(addr, "read")) {
            raise(
                "Segmentation fault. Read access denied for address '0x" +
                    addr.toString(16) +
                    "'",
            );
            creator_executor_exit(true);
        }

        try {
            val = readValueFromMemory(addr, bytes);
        } catch (_e) {
            raise(
                "Invalid memory access to address '0x" +
                    addr.toString(16) +
                    "'",
            );
            creator_executor_exit(true);
        }

        // Remove the call to undefined function
        const ret = val;

        const find_ret = crex_findReg(reg_name);
        if (find_ret.match === 0) {
            return ret;
        }

        const i = find_ret.indexComp;
        const j = find_ret.indexElem;

        creator_callstack_newRead(i, j, addr, bytes);

        return ret;
    },

    /**
     * Adds a hint for a memory address. If a hint already exists at the specified address, it replaces it.
     * @param {bigint} address - Memory address to add hint for
     * @param {string} hint - Description of the data type or purpose (e.g., "<double>", "<int32>", "<string>")
     * @param {number} [sizeInBits] - Optional size of the type in bits (e.g., 64 for double, 32 for int32)
     * @returns {boolean} - True if the hint was successfully added
     */
    addHint(address, hint, sizeInBits) {
        try {
            main_memory.addHint(address, "", hint, sizeInBits);
            return true;
        } catch (e) {
            raise(
                "Failed to add hint for address '0x" +
                    address.toString(16) +
                    "': " +
                    e,
            );
            return false;
        }
    },
};
