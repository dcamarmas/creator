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

import { architecture, REGISTERS } from "../core.mjs";
import { crex_show_notification } from "../../web/utils.mjs";
import { tag_instructions } from "../assembler/assembler.mjs";
import {
    creator_callstack_enter,
    creator_callstack_leave,
} from "../sentinel/sentinel.mjs";
import { creator_ga } from "../utils/creator_ga.mjs";

export const CHECK_STACK = {
    begin(addr) {
        let function_name = "";

        // 1) Passing Convection enable?
        if (!architecture.config.passing_convention) {
            return;
        }

        // 2) get function name
        if (typeof REGISTERS[0] !== "undefined") {
            if (typeof tag_instructions[addr] === "undefined")
                function_name = "0x" + parseInt(addr).toString(16);
            else function_name = tag_instructions[addr];
        }

        // 3) callstack_enter
        creator_callstack_enter(function_name);
    },
    end() {
        // 1) Passing Convection enable?
        if (!architecture.config.passing_convention) {
            return;
        }

        // 2) Callstack_leave
        const ret = creator_callstack_leave();

        // 3) If everything is ok, just return
        if (ret.ok) {
            return;
        }

        // 4) Othewise report some warning...
        // Google Analytics
        creator_ga(
            "execute",
            "execute.exception",
            "execute.exception.protection_jrra" + ret.msg,
        );

        // User notification
        crex_show_notification(ret.msg, "danger");
    },
};
