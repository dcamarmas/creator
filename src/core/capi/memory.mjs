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
import { architecture, main_memory } from "../core.mjs";
import { creator_executor_exit } from "../executor/executor.mjs";
import { isMisaligned, raise } from "./validation.mjs";
import { crex_findReg } from "../register/registerLookup.mjs";
import {
    creator_callstack_newWrite,
    creator_callstack_newRead,
} from "../sentinel/sentinel.mjs";
import { logger } from "../utils/creator_logger.mjs";

/*
 *  CREATOR instruction description API:
 *  Memory access
 */
/*
 * Name:        mp_write - Write value into a memory address
 * Sypnosis:    mp_write (destination_address, value2store, byte_or_half_or_word)
 * Description: similar to memmove/memcpy, store a value into an address
 */
// Memory operations
export const MEM = {
    write: function (address, value, reg_name) {
        // if (isMisaligned(addr, type)) {
        //     raise("The memory must be align");
        //     creator_executor_exit(true);
        // }

        const addr_16 = parseInt(address, 16);
        if (
            addr_16 >= parseInt(architecture.memory_layout[0].value) &&
            addr_16 <= parseInt(architecture.memory_layout[1].value)
        ) {
            raise("Segmentation fault. You tried to write in the text segment");
            creator_executor_exit(true);
        }
        let bytes;
        try {
            // The memory is implemented as a Memory class instance.
            // The memory class ONLY reads and writes one byte at a time,
            // so we need to handle the size of the value to write.
            // first, we need to split the value to write into bytes
            bytes = main_memory.splitToBytes(value);
            logger.debug(
                `Writing value '0x${value.toString(16)}' to memory at address '0x${address.toString(
                    16,
                )}' as bytes: ${bytes.map(b => `0x${b.toString(16)}`).join(", ")}`,
            );
            // Now we write each byte to the memory
            for (let i = 0n; i < bytes.length; i++) {
                main_memory.write(address + i, bytes[i]);
            }
        } catch (e) {
            raise(
                "Invalid memory access to address '0x" +
                    address.toString(16) +
                    "'",
            );
            creator_executor_exit(true);
        }

        const ret = crex_findReg(reg_name);
        if (ret.match === 0) {
            return;
        }

        const i = ret.indexComp;
        const j = ret.indexElem;

        creator_callstack_newWrite(i, j, address, bytes.length);
    },

    read: function (addr, bytes, reg_name) {
        // Implementation of capi_mem_read
        let val = 0n;

        // if (isMisaligned(addr, bytes)) {
        //     raise("The memory must be align");
        //     creator_executor_exit(true);
        // }

        const addr_16 = parseInt(addr, 16);
        if (
            addr_16 >= parseInt(architecture.memory_layout[0].value, 16) &&
            addr_16 <= parseInt(architecture.memory_layout[1].value, 16)
        ) {
            raise("Segmentation fault. You tried to read in the text segment");
            creator_executor_exit(true);
        }

        try {
            // the memory only reads one byte at a time,
            // so we need to read the bytes one by one
            const bytesRead = [];
            for (let i = 0n; i < bytes; i++) {
                const byte = main_memory.read(addr + i);
                bytesRead.push(byte);
            }

            // Combine bytes into a single value (big-endian)
            val = 0n;
            for (let i = 0; i < bytesRead.length; i++) {
                val =
                    (val << BigInt(main_memory.getBitsPerByte())) |
                    BigInt(bytesRead[i]);
            }
            console.log("Read value:", val);
        } catch (e) {
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
};
