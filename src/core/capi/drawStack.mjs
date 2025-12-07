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

import { REGISTERS, stackTracker } from "../core.mjs";
import { tag_instructions } from "../assembler/assembler.mjs";

export const DRAW_STACK = {
    begin(addr) {
        let function_name = "";

        // 1.- get function name
        if (typeof REGISTERS[0] !== "undefined") {
            if (typeof tag_instructions[addr] === "undefined")
                function_name = "0x" + parseInt(addr, 10).toString(16);
            else function_name = tag_instructions[addr].tag;
        }

        // 2.- callstack_enter
        stackTracker.newFrame(function_name);
    },
    end() {
        // pop both frames
        stackTracker.popFrame();
        stackTracker.popFrame();
    },

    // Add a hint for a specific memory address
    addHint(address, name) {
        stackTracker.addHint(address, name);
    },
};
