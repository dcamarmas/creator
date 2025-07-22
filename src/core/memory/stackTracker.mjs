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

import { main_memory, REGISTERS } from "../core.mjs";

/*
 * Helper Functions
 */

/**
 * Gets the stack start address from the memory object
 * @returns {string} Stack start address as hex string
 */
export function getStackStartAddress() {
    const segments = main_memory.getMemorySegments();
    const stackSegment = segments.get("stack");
    return stackSegment.start;
}

/**
 * Gets the current stack pointer value from the registers
 * @returns {string, undefined} Current stack pointer value as hex string
 */
function getCurrentStackPointer() {
    // Find the register with stack_pointer property
    for (let bankIndex = 0; bankIndex < REGISTERS.length; bankIndex++) {
        const bank = REGISTERS[bankIndex];
        if (bank.elements) {
            for (
                let regIndex = 0;
                regIndex < bank.elements.length;
                regIndex++
            ) {
                const register = bank.elements[regIndex];
                if (
                    register.properties &&
                    register.properties.includes("stack_pointer")
                ) {
                    // Convert the value to hex string format
                    const value = register.value;
                    return "0x" + value.toString(16).toUpperCase();
                }
            }
        }
    }
    return undefined;
}

/*
 * Data Structure
 */
/*
 *  track_stack_names = [ "PC=xxx", "main" ] ;
 */
export let track_stack_names = []; // FIXME: the order is broken
/*
 *  track_stack_limits = [
 *		               {
 *		                  function_name: "",
 *		                  begin_caller: 0,
 *		                  end_caller: 0,
 *		                  begin_callee: 0,
 *		                  end_callee: 0
 *		               },
 *		               ...
 *                      ] ;
 */
export let track_stack_limits = [];
/*
 *  stack_hints = {
 *    4294967292: "hint",
 *    ...
 *  } ;
 */
export let stack_hints = {};

/*
 * Public API
 */
//
// Initialize
// Example: track_stack_create() ;
//
export function track_stack_create() {
    const ret = {
        ok: true,
        msg: "",
    };

    // initialize array
    track_stack_names = [];
    track_stack_limits = [];

    return ret;
}

//
// Get the last element
// Example: var elto = track_stack_getTop() ;
//
export function track_stack_getTop() {
    const ret = {
        ok: true,
        val: {
            begin_caller: getCurrentStackPointer(),
            end_caller: getCurrentStackPointer(),
            begin_callee: getCurrentStackPointer(),
            end_callee: getCurrentStackPointer(),
        },
        msg: "",
    };

    // check params
    if (track_stack_limits.length === 0) {
        ret.ok = false;
        ret.msg = "track_stack_getTop: empty track_stack_limits !!.\n";
        return ret;
    }

    // return the last element in the array
    ret.val = track_stack_limits[track_stack_limits.length - 1];
    if (typeof ret.val.begin_caller === "undefined") {
        ret.val.begin_caller = getCurrentStackPointer();
    }

    return ret;
}

//
// "jal X, ..." -> add new element (at the end)
// Example: track_stack_Enter("main")
//
export function track_stack_enter(function_name) {
    const ret = {
        ok: true,
        msg: "",
    };

    // 1.- caller name
    track_stack_names.push(function_name);

    // 2.- new call element
    const new_elto = {
        function_name,
        begin_caller: track_stack_getTop().val.begin_callee, // llamante: FFFFFFFC, FFFFFFF0
        end_caller: track_stack_getTop().val.end_callee, // llamante: FFFFFFF0, FFFFFF00
        begin_callee: getCurrentStackPointer(), // llamado: current SP when function enters
        end_callee: getCurrentStackPointer(), // llamado: will be updated by track_stack_setsp
    };

    track_stack_limits.push(new_elto);

    // 3.- update UI
    if (typeof window !== "undefined") {
        document.app.$data.callee_subrutine =
            track_stack_names[track_stack_names.length - 1];
        document.app.$data.caller_subrutine =
            track_stack_names[track_stack_names.length - 2];
        document.app.$data.begin_caller = new_elto.begin_caller;
        document.app.$data.end_caller = new_elto.end_caller;
        document.app.$data.begin_callee = new_elto.begin_callee;
        document.app.$data.end_callee = new_elto.end_callee;
    }

    return ret;
}
//
// "jr ra, ..." -> remove last element
// Example: track_stack_Leave() ;
//
export function track_stack_leave() {
    const ret = {
        ok: true,
        msg: "",
    };

    // check params
    if (track_stack_limits.length === 0) {
        ret.msg = "track_stack_Leave: empty track_stack_limits !!.\n";
        return ret;
    }

    // pop both stacks
    track_stack_limits.pop();
    if (track_stack_names.length > 0) {
        track_stack_names.pop();
    }

    // draw stack zones
    const elto_top = track_stack_getTop();
    if (typeof window !== "undefined" && elto_top.val !== null) {
        document.app.$data.callee_subrutine =
            track_stack_names[track_stack_names.length - 1];
        document.app.$data.caller_subrutine =
            track_stack_names[track_stack_names.length - 2];
        document.app.$data.begin_caller = elto_top.val.begin_caller; // llamante: FFFFFFFC, FFFFFFF0, FFFFFF00
        document.app.$data.end_caller = elto_top.val.end_caller; // llamante: FFFFFFF0, FFFFFF00, FFFFF000
        document.app.$data.begin_callee = elto_top.val.begin_callee; // llamado:  FFFFFFF0, FFFFFF00, FFFFF000
        document.app.$data.end_callee = elto_top.val.end_callee; // llamado:  FFFFFFF0, FFFFFF00, FFFFF000
    }

    return ret;
}

//
// Get all stack frames
// Example: var frames = track_stack_getFrames() ;
//
export function track_stack_getFrames() {
    const ret = {
        ok: track_stack_limits.length > 0,
        val: track_stack_limits,
        msg: "",
    };

    if (!ret.ok) {
        ret.msg = "track_stack_getFrames: empty track_stack_limits.";
    }

    return ret;
}
//
// Get all function names in the call stack
// Example: var names = track_stack_getNames() ;
//
export function track_stack_getNames() {
    const ret = {
        ok: track_stack_names.length > 0,
        val: track_stack_names,
        msg: "",
    };

    if (!ret.ok) {
        ret.msg = "track_stack_getNames: empty track_stack_names.";
    }

    return ret;
}
//
// Let programmers to modify some arbitrary field.
// Example: track_stack_getTop("function_name", 1, 2, "main") ;
//
// function track_stack_setTop(field, indexComponent, indexElement, value) {
//     const ret = {
//         ok: true,
//         msg: "",
//     };

//     // check params
//     if (track_stack_limits.length === 0) {
//         ret.ok = false;
//         ret.msg = "track_stack_getTop: empty track_stack_limits !!.\n";
//         return ret;
//     }

//     // set field value
//     const elto = track_stack_limits[track_stack_limits.length - 1];
//     if (typeof elto.length !== "undefined") {
//         elto[field][indexComponent][indexElement] = value;
//         return ret;
//     }

//     elto[field] = value;
//     return ret;
// }
//
// Updates the .end_callee field of the top stack element
// Example: track_stack_setsp("0xFFFFFFF0") ;
//
export function track_stack_setsp(value) {
    if (typeof window !== "undefined") {
        document.app.$data.end_callee = value; // llamado:  FFFFFFF0, FFFFFF00, FFFFF000
    }

    // check params
    if (track_stack_limits.length === 0) {
        return;
    }

    // convert value to hex string
    const str = "0x" + value.toString(16).toUpperCase(); // This will be a source of headaches

    // return the last element in the array
    const elto = track_stack_limits[track_stack_limits.length - 1];
    elto.end_callee = str;
}

//
// Add a hint for a specific memory address
// Example: track_stack_addHint(0x0FFFFFFCn, "local_var") ;
//
export function track_stack_addHint(address, name) {
    const ret = {
        ok: true,
        msg: "",
    };

    // Convert address to string if it's a number
    const addr =
        typeof address === "BigInt" || typeof address === "number"
            ? "0x" + address.toString(16).toUpperCase()
            : address;

    stack_hints[addr] = name;
    return ret;
}

//
// Get all hints
// Example: var allHints = track_stack_getAllHints() ;
//
export function track_stack_getAllHints() {
    const ret = {
        ok: Object.keys(stack_hints).length > 0,
        val: stack_hints,
        msg: "",
    };

    if (!ret.ok) {
        ret.msg = "No hints defined";
    }

    return ret;
}

//
// Clear all hints
// Example: track_stack_clearHints() ;
//
export function track_stack_clearHints() {
    const ret = {
        ok: true,
        msg: "",
    };

    stack_hints = {};
    return ret;
}

//
// Reset
// Example: track_stack_reset() ;
//
export function track_stack_reset() {
    const ret = {
        ok: true,
        msg: "",
    };

    // initialize stack_call
    track_stack_names = [];
    track_stack_limits = [];
    stack_hints = {}; // Clear hints

    // draw new limits
    if (typeof window !== "undefined") {
        document.app.$data.track_stack_names = track_stack_names;
        document.app.$data.callee_subrutine =
            track_stack_names[track_stack_names.length - 1];
        document.app.$data.caller_subrutine = "";
        document.app.$data.begin_caller = getCurrentStackPointer();
        document.app.$data.end_caller = getCurrentStackPointer();
        document.app.$data.begin_callee = getCurrentStackPointer();
        document.app.$data.end_callee = getCurrentStackPointer();
    }

    return ret;
}

export function dumpStack() {
    return {
        stack_hints,
        track_stack_names,
        track_stack_limits,
    };
}

export function loadStack(data) {
    if (data.stack_hints) {
        stack_hints = data.stack_hints;
    }
    if (data.track_stack_names) {
        track_stack_names = data.track_stack_names;
    }
    if (data.track_stack_limits) {
        track_stack_limits = data.track_stack_limits;
    }
}
