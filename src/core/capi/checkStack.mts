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

import { architecture, REGISTERS, getPC } from "../core.mjs";
import { crex_show_notification } from "../../web/utils.mjs";
import { tag_instructions } from "../assembler/assembler.mjs";
import { sentinel } from "../sentinel/sentinel.mjs";
import { creator_ga } from "../utils/creator_ga.mjs";
import { coreEvents, CoreEventTypes } from "../events.mts";

export const CHECK_STACK = {
    begin(addr?: bigint) {
        let function_name = "";

        if (addr === undefined) {
            addr = getPC();
        }

        // 1) Passing Convection enable?
        if (!architecture.config.passing_convention) {
            return;
        }

        // 2) get function name
        if (typeof REGISTERS[0] !== "undefined") {
            if (typeof tag_instructions[Number(addr)] === "undefined")
                function_name = "0x" + addr.toString(16);
            else function_name = tag_instructions[Number(addr)]!.tag;
        }

        // 3) callstack_enter
        sentinel.enter(function_name);
    },
    end() {
        // 1) Passing Convection enable?
        if (!architecture.config.passing_convention) {
            return;
        }

        // 2) Get current function name before leave
        const currentFunction = sentinel.getCurrentFunction() || "unknown";

        // 3) Callstack_leave
        const ret = sentinel.leave();

        // 4) If everything is ok, just return
        if (ret.ok) {
            return;
        }

        // 5) Otherwise report the error...
        // Emit event for GUI
        coreEvents.emit(CoreEventTypes.SENTINEL_ERROR, {
            functionName: currentFunction,
            message: ret.msg,
            ok: false,
        });

        // Google Analytics
        creator_ga(
            "execute",
            "execute.exception",
            "execute.exception.protection_jrra" + ret.msg,
        );

        // User notification
        crex_show_notification(ret.msg, "warning");
    },
};
