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
import { address } from "../assembler/assembler.mjs";
import { console_log } from "../utils/creator_logger.mjs";

/*
 * Data Structure
 */
/*
 * [ "x", "y" ] ;
 */
let stack_call_names = [];
/*
 * [
 *   {
 *     function_name: "",
 *     enter_stack_pointer: 0x0,
 *     register_sm:           [ indexComp: [ 0, ... ]... ; // once per register: state
 *     register_value:        [ indexComp: [ 0x0, ... ], ... ; // once per register: initial value (before save)
 *     register_size_write:   [ indexComp: [ 0x0, ... ], ... ; // once per register: size value
 *     register_size_read:    [ indexComp: [ 0x0, ... ], ... ; // once per register: size value
 *     register_address_write: [ indexComp: [ [0x0, 0x4, ...], ... ], ... ; // once per register: in which position is stored
 *     register_address_read:  [ indexComp: [ [0x0, 0x4, ...], ... ], ... ; // once per register: from which position is restored
 *   },
 *   ...
 * ] ;
 *
 */
/*
 *
 * TODO: update this with draw.io graph
 * States:
 *  0 -> Init
 *  1 -> Saved in memory/stack
 *  2 -> Restored from memory/stack (read from memory stage)
 *  5 -> Restored from memory/stack (write register stage)
 *  3 -> Error
 *  4 -> Save/.../Restore/Save
 *
 *
 * Transitions (state x action -> next state):
 *
 *           WM==  WM!= RM  WR  RR  END
 *      0     1    1     2  a4   0   3
 *      1     1    7     6  5    1   b4
 *      2     1    1     2  e4   2   3
 *      3     -    -     -  -    -   -
 *      4     -    -     -  -    -   -
 *      5     d4   5     6  5    5   c4
 *      6     d4   6     6  0    6   c4
 *      7     7    7     6  5    7   b4
 *
 */
const stack_state_transition = [
    { "wm==": 1, "wm!=": 1, rm: 2, wr: 40, rr: 0, end: 3 },
    { "wm==": 1, "wm!=": 7, rm: 6, wr: 5, rr: 1, end: 40 },
    { "wm==": 1, "wm!=": 1, rm: 2, wr: 45, rr: 2, end: 3 },
    { "wm==": -1, "wm!=": -1, rm: -1, wr: -1, rr: -1, end: -1 },
    { "wm==": -1, "wm!=": -1, rm: -1, wr: -1, rr: -1, end: -1 },
    { "wm==": 44, "wm!=": 5, rm: 6, wr: 5, rr: 5, end: 43 },
    { "wm==": 44, "wm!=": 6, rm: 6, wr: 0, rr: 6, end: 43 },
    { "wm==": 7, "wm!=": 7, rm: 6, wr: 5, rr: 7, end: 42 },
];
let stack_call_register = [];
/*
 * Public API
 */
//
// Initialize
// Example: creator_callstack_create() ;
//
function creator_callstack_create() {
    const ret = {
        ok: true,
        msg: "",
    };

    // initialize stack_call
    stack_call_names = [];
    stack_call_register = [];
    creator_callstack_enter("main");

    return ret;
}
//
// "jal X, ..." -> add new element (at the end)
// Example: creator_callstack_Enter("main")
//
export function creator_callstack_enter(function_name) {
    const ret = {
        ok: true,
        msg: "",
    };

    // 1.- caller name
    stack_call_names.push(function_name);

    // 2.- caller element
    const arr_sm = [];
    const arr_write = [];
    const arr_read = [];
    const arr_value = [];
    const arr_size_write = [];
    const arr_size_read = [];

    for (let i = 0; i < REGISTERS.length; i++) {
        arr_sm.push([]);
        arr_write.push([]);
        arr_read.push([]);
        arr_value.push([]);
        arr_size_write.push([]);
        arr_size_read.push([]);

        for (let j = 0; j < REGISTERS[i].elements.length; j++) {
            arr_sm[i].push(0);
            arr_write[i].push([]);
            arr_read[i].push([]);
            arr_size_write[i].push([]);
            arr_size_read[i].push([]);
            arr_value[i].push(REGISTERS[i].elements[j].value);
        }
    }

    const new_elto = {
        function_name,
        enter_stack_pointer: architecture.memory_layout.stack.start,
        register_sm: arr_sm,
        register_value: arr_value,
        register_size_write: arr_size_write,
        register_size_read: arr_size_read,
        register_address_write: arr_write,
        register_address_read: arr_read,
    };

    stack_call_register.push(new_elto);

    // return ok
    return ret;
}
//
// "jr ra, ..." -> remove last element
// Example: creator_callstack_Leave() ;
//
// eslint-disable-next-line max-lines-per-function
export function creator_callstack_leave() {
    const ret = {
        ok: true,
        msg: "",
    };

    // check params
    if (stack_call_register.length === 0) {
        ret.msg = "creator_callstack_Leave: empty stack_call_register !!.\n";
        return ret;
    }

    // get stack top element
    let last_elto = stack_call_register[stack_call_register.length - 1];

    //check sp that points to corresponding address
    if (ret.ok) {
        if (
            architecture.memory_layout.stack.start !=
            last_elto.enter_stack_pointer
        ) {
            ret.ok = false;
            ret.msg = "Stack memory has not been released successfully";
        }
    }

    // check values (check currrent state)
    if (ret.ok) {
        for (let i = 0; i < REGISTERS.length; i++) {
            for (let j = 0; j < REGISTERS[i].elements.length; j++) {
                if (
                    last_elto.register_value[i][j] !=
                        REGISTERS[i].elements[j].value &&
                    REGISTERS[i].elements[j].properties.includes("saved")
                ) {
                    ret.ok = false;
                    ret.msg =
                        "Possible failure in the parameter passing convention";
                    break;
                }
            }
        }
    }

    //Check state
    if (ret.ok) {
        for (let i = 0; i < REGISTERS.length; i++) {
            for (let j = 0; j < REGISTERS[i].elements.length; j++) {
                creator_callstack_do_transition("end", i, j, null);

                last_elto = stack_call_register[stack_call_register.length - 1];

                /////////////////////////// TEMPORAL SOLUTION ///////////////////////////////////////////////////////////////////
                //last_index_write = last_elto.register_address_write[i][j].length -1;
                const last_index_read =
                    last_elto.register_address_read[i][j].length - 1;

                if (
                    last_elto.register_address_write[i][j][0] ==
                        last_elto.register_address_read[i][j][
                            last_index_read
                        ] &&
                    last_elto.register_sm[i][j] === 45 &&
                    REGISTERS[i].elements[j].properties.includes("saved") // ...but should be saved
                ) {
                    break;
                }

                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                else if (
                    last_elto.register_sm[i][j] !== 3 &&
                    REGISTERS[i].elements[j].properties.includes("saved") // ...but should be saved
                ) {
                    ret.ok = false;
                    ret.msg =
                        "Possible failure in the parameter passing convention";
                    break;
                }
            }
        }
    }

    //Check address
    if (ret.ok) {
        for (let i = 0; i < REGISTERS.length; i++) {
            for (let j = 0; j < REGISTERS[i].elements.length; j++) {
                //last_index_write = last_elto.register_address_write[i][j].length -1;
                const last_index_read =
                    last_elto.register_address_read[i][j].length - 1;

                if (
                    last_elto.register_address_write[i][j][0] !=
                        last_elto.register_address_read[i][j][
                            last_index_read
                        ] &&
                    REGISTERS[i].elements[j].properties.includes("saved") // ...but should be saved
                ) {
                    ret.ok = false;
                    ret.msg =
                        "Possible failure in the parameter passing convention";
                    break;
                }
            }
        }
    }

    //Check size
    if (ret.ok) {
        for (let i = 0; i < REGISTERS.length; i++) {
            for (let j = 0; j < REGISTERS[i].elements.length; j++) {
                //last_index_write = last_elto.register_size_write[i][j].length -1;
                const last_index_read =
                    last_elto.register_size_read[i][j].length - 1;

                if (
                    last_elto.register_size_write[i][j][0] !=
                        last_elto.register_size_read[i][j][last_index_read] &&
                    REGISTERS[i].elements[j].properties.includes("saved") // ...but should be saved
                ) {
                    ret.ok = false;
                    ret.msg =
                        "Possible failure in the parameter passing convention";
                    break;
                }
            }
        }
    }

    // pop stack
    stack_call_register.pop();
    if (stack_call_names.length > 0) {
        stack_call_names.pop();
    }

    // return ok
    return ret;
}
//
// Get the last element
// Example: var elto = creator_callstack_getTop() ;
//
function creator_callstack_getTop() {
    const ret = {
        ok: true,
        val: null,
        msg: "",
    };

    // check params
    if (stack_call_register.length === 0) {
        ret.ok = false;
        ret.msg = "creator_callstack_getTop: empty stack_call_register !!.\n";
        return ret;
    }

    // return the last element in the array
    ret.val = stack_call_register[stack_call_register.length - 1];
    return ret;
}
//
// Let programmers to modify some arbitrary field.
// Example: creator_callstack_getTop("function_name", 1, 2, "main") ;
//
function creator_callstack_setTop(field, indexComponent, indexElement, value) {
    const ret = {
        ok: true,
        msg: "",
    };

    // check params
    if (stack_call_register.length === 0) {
        ret.ok = false;
        ret.msg = "creator_callstack_getTop: empty stack_call_register !!.\n";
        return ret;
    }

    // set field value
    const elto = stack_call_register[stack_call_register.length - 1];
    if (typeof elto.length !== "undefined") {
        elto[field][indexComponent][indexElement] = value;
        return ret;
    }

    elto[field] = value;
    return ret;
}
//
// Let programmers to modify register state
// Example: creator_callstack_setState(1, 2, 1) ;
//
function creator_callstack_setState(indexComponent, indexElement, newState) {
    const elto = creator_callstack_getTop();
    if (elto.ok === false) {
        console_log("[STATE] Failed to set state: " + elto.msg, "ERROR");
        return "";
    }

    elto.val.register_sm[indexComponent][indexElement] = newState;
}
function creator_callstack_getState(indexComponent, indexElement) {
    const elto = creator_callstack_getTop();
    if (elto.ok === false) {
        console_log("[STATE] Failed to get state: " + elto.msg, "ERROR");
        return "";
    }

    return elto.val.register_sm[indexComponent][indexElement];
}
//
// Let programmers add a new write
// Example: creator_callstack_newWrite(1, 2, 0x12345) ;
//
export function creator_callstack_newWrite(
    indexComponent,
    indexElement,
    address,
    length,
) {
    // Move state finite machine
    creator_callstack_do_transition(
        "wm",
        indexComponent,
        indexElement,
        address,
    );

    const elto = creator_callstack_getTop();
    if (elto.ok == false) {
        console_log(
            "[WRITE] Failed to record new write operation: " + elto.msg,
            "ERROR",
        );
        return "";
    }

    elto.val.register_address_write[indexComponent][indexElement].push(address);
    elto.val.register_size_write[indexComponent][indexElement].push(length);
}
//
// Let programmers add a new read
// Example: creator_callstack_newRead(1, 2, 0x12345) ;
//
export function creator_callstack_newRead(
    indexComponent,
    indexElement,
    address,
    length,
) {
    const elto = creator_callstack_getTop();
    if (elto.ok == false) {
        console_log(
            "[READ] Failed to record new read operation: " + elto.msg,
            "ERROR",
        );
        return "";
    }

    elto.val.register_address_read[indexComponent][indexElement].push(address);
    elto.val.register_size_read[indexComponent][indexElement].push(length);

    // Move state finite machine
    creator_callstack_do_transition(
        "rm",
        indexComponent,
        indexElement,
        address,
    );
}
//
// Let programmers add a new read
// Example: creator_callstack_newRead(1, 2, 0x12345) ;
//
export function creator_callstack_writeRegister(indexComponent, indexElement) {
    // Move state finite machine
    creator_callstack_do_transition(
        "wr",
        indexComponent,
        indexElement,
        address,
    );
}
//
// Reset
// Example: creator_callstack_reset() ;
//
export function creator_callstack_reset() {
    const ret = {
        ok: true,
        msg: "",
    };

    // initialize stack_call
    stack_call_names = [];
    stack_call_register = [];
    creator_callstack_enter("main");

    // return ok
    return ret;
}
//
// do state transition
// Example: creator_callstack_do_transition("wm", 1, 2, 0x12345678)
//

function creator_callstack_do_transition(
    doAction,
    indexComponent,
    indexElement,
    address,
) {
    // get current state
    const state = creator_callstack_getState(indexComponent, indexElement);

    // get action
    let action = doAction;
    if (doAction == "wm") {
        const elto = creator_callstack_getTop();
        if (elto.ok == false) {
            console_log(
                "creator_callstack_do_transition: " + elto.msg,
                "ERROR",
            );
            return "";
        }

        const equal =
            elto.val.register_address_write[indexComponent][
                indexElement
            ].includes(address);
        action = equal ? "wm==" : "wm!=";
    }

    if (doAction == "rm") {
        const elto = creator_callstack_getTop();
        if (elto.ok == false) {
            console_log("creator_callstack_do_transition: " + elto.msg);
            return "";
        }

        const equal =
            elto.val.register_address_write[indexComponent][
                indexElement
            ].includes(address);
        if (equal == false) {
            return;
        }
    }

    if (
        typeof stack_state_transition[state] === "undefined" ||
        typeof stack_state_transition[state][action] === "undefined"
    ) {
        if (state < 40 || state < 0) {
            console_log(
                "[TRANSITION] Invalid state transition: State=" +
                    state +
                    ", Action=" +
                    action +
                    " (Component: " +
                    REGISTERS[indexComponent].elements[indexElement].name +
                    ")",
                "ERROR",
            );
        }
        return;
    }

    // get new state: transition(state, action) -> new_state
    const new_state = stack_state_transition[state][action];
    creator_callstack_setState(indexComponent, indexElement, new_state);

    if (action != "end") {
        console_log(
            "[TRANSITION] " +
                REGISTERS[indexComponent].elements[indexElement].name +
                ": State " +
                state +
                " → " +
                new_state +
                " (Action: " +
                action +
                ")",
            "WARN",
        );
    }
}
