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
import { architecture } from "../core.mjs";
import { crex_show_notification } from "../executor/executor.mjs";
import { tag_instructions } from "../compiler/compiler.mjs";
import { track_stack_enter, track_stack_leave } from "../memory/stackTracker.mjs";

export let CAPI_DRAW_STACK = {
    drawstack_begin: function (addr) {
        var function_name = "";

        // 1.- get function name
        if (typeof architecture.components[0] !== "undefined") {
            if (typeof tag_instructions[addr] == "undefined") function_name = "0x" + parseInt(addr).toString(16);
            else function_name = tag_instructions[addr];
        }

        // 2.- callstack_enter
        track_stack_enter(function_name);
    },
    drawstack_end: function () {
        // track leave
        var ret = track_stack_leave();

        // 2) If everything is ok, just return
        if (ret.ok) {
            return;
        }

        // User notification
        crex_show_notification(ret.msg, "warning");
    },
};
