
/*
 *  Copyright 2018-2024 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos
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


 /*
  * Data Structure
  */

    /*
     *  track_stack_names = [ "PC=xxx", "main" ] ;
     */
    var track_stack_names = [];

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
    var track_stack_limits = [];


 /*
  * Public API
  */

//
// Initialize
// Example: track_stack_create() ;
//
function track_stack_create()
{
    var ret = {
        ok: true,
        msg: ""
    };

    // initialize array
    track_stack_names  = [];
    track_stack_limits = [];
    track_stack_enter("main");

    return ret;
}

//
// "jal X, ..." -> add new element (at the end)
// Example: track_stack_Enter("main")
//
function track_stack_enter ( function_name )
{
    var ret = {
        ok: true,
        msg: ""
    };

    // 1.- caller name
    track_stack_names.push(function_name) ;

    // 2.- new call element
    var new_elto = {
        function_name:          function_name,
        begin_caller:           track_stack_getTop().val.begin_callee, // llamante: FFFFFFFC, FFFFFFF0
        end_caller:             track_stack_getTop().val.end_callee,   // llamante: FFFFFFF0, FFFFFF00
        begin_callee:           architecture.memory_layout[4].value,   // llamado:  FFFFFFF0, FFFFFF00
        end_callee:             architecture.memory_layout[4].value    // llamado:  FFFFFFF0, FFFFFF00
    };

    track_stack_limits.push(new_elto);

    // 3.- update UI
    if (typeof window !== "undefined")
    {
        app._data.callee_subrutine  = track_stack_names[track_stack_names.length - 1];
        app._data.caller_subrutine  = track_stack_names[track_stack_names.length - 2];
        app._data.begin_caller      = new_elto.begin_caller; 
        app._data.end_caller        = new_elto.end_caller;
        app._data.begin_callee      = new_elto.begin_callee;
        app._data.end_callee        = new_elto.end_callee;
    }

    return ret;
}

//
// "jr ra, ..." -> remove last element
// Example: track_stack_Leave() ;
//
function track_stack_leave()
{
    var ret = {
        ok: true,
        msg: ""
    };

    // check params
    if (0 === track_stack_limits.length)
    {
        ret.msg = "track_stack_Leave: empty track_stack_limits !!.\n";
        return ret;
    }

    // pop both stacks
    track_stack_limits.pop();
    if (track_stack_names.length > 0) {
        track_stack_names.pop() ;
    }

    // draw stack zones
    var elto_top = track_stack_getTop() ;
    if ( (typeof window !== "undefined") && (elto_top.val != null) )
    {
        app._data.callee_subrutine = track_stack_names[track_stack_names.length - 1];
        app._data.caller_subrutine = track_stack_names[track_stack_names.length - 2];
        app._data.begin_caller     = elto_top.val.begin_caller;  // llamante: FFFFFFFC, FFFFFFF0, FFFFFF00
        app._data.end_caller       = elto_top.val.end_caller;    // llamante: FFFFFFF0, FFFFFF00, FFFFF000
        app._data.begin_callee     = elto_top.val.begin_callee;  // llamado:  FFFFFFF0, FFFFFF00, FFFFF000
        app._data.end_callee       = elto_top.val.end_callee;    // llamado:  FFFFFFF0, FFFFFF00, FFFFF000
    }

    return ret;
}

//
// Get the last element
// Example: var elto = track_stack_getTop() ;
//
function track_stack_getTop()
{
    var ret = {
        ok: true,
        val: {
            begin_caller: architecture.memory_layout[4].value,
            end_caller: architecture.memory_layout[4].value,
            begin_callee: architecture.memory_layout[4].value,
            end_callee: architecture.memory_layout[4].value
        },
        msg: ""
    };

    // check params
    if (0 === track_stack_limits.length)
    {
        ret.ok = false;
        ret.msg = "track_stack_getTop: empty track_stack_limits !!.\n";
        return ret;
    }

    // return the last element in the array
    ret.val = track_stack_limits[track_stack_limits.length - 1];
    if (typeof ret.val.begin_caller === "undefined"){
        ret.val.begin_caller = architecture.memory_layout[4].value;
    }

    return ret;
}

//
// Let programmers to modify some arbitrary field.
// Example: track_stack_getTop("function_name", 1, 2, "main") ;
//
function track_stack_setTop( field, indexComponent, indexElement, value )
{
    var ret = {
        ok: true,
        msg: ""
    };

    // check params
    if (0 === track_stack_limits.length)
    {
        ret.ok = false;
        ret.msg = "track_stack_getTop: empty track_stack_limits !!.\n";
        return ret;
    }

    // set field value
    var elto = track_stack_limits[track_stack_limits.length - 1];
    if (typeof elto.length !== "undefined")
    {
        elto[field][indexComponent][indexElement] = value;
        return ret;
    }

    elto[field] = value;
    return ret;
}

//
// Updates the .end_callee field of the top stack element
// Example: track_stack_setsp("0xFFFFFFF0") ;
//
function track_stack_setsp(value)
{
    if (typeof window !== "undefined") {
        app._data.end_callee = value;   // llamado:  FFFFFFF0, FFFFFF00, FFFFF000
    }

    // check params
    if (0 === track_stack_limits.length) {
        return;
    }

    // return the last element in the array
    var elto = track_stack_limits[track_stack_limits.length - 1];
    elto.end_callee = value;
}

//
// Reset
// Example: track_stack_reset() ;
//
function track_stack_reset()
{
    var ret = {
        ok: true,
        msg: ""
    };

    // initialize stack_call
    track_stack_names  = [];
    track_stack_limits = [];
    track_stack_enter("main");

    // draw new limits
    if (typeof window !== "undefined")
    {
        app._data.track_stack_names = track_stack_names;
        app._data.callee_subrutine  = track_stack_names[track_stack_names.length - 1];
        app._data.caller_subrutine  = "";
        app._data.begin_caller      = architecture.memory_layout[4].value;
        app._data.end_caller        = architecture.memory_layout[4].value;
        app._data.begin_callee      = architecture.memory_layout[4].value;
        app._data.end_callee        = architecture.memory_layout[4].value;
    }

    return ret ;
}

