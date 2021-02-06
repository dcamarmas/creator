/*
 *  Copyright 2018-2021 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos
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

 var stack_call_registers = [];
 /*
  stack_call_registers = 
      [
        {
           function_name: "",
           begin_caller: 0,
           end_caller: 0,
           begin_callee: 0,
           end_callee: 0,
           registers_modified:     [ indexComp: [ false, ... ]... ; // once per register: not modified
           registers_saved:        [ indexComp: [ false, ... ]... ; // once per register: saved on stack
           registers_value:        [ indexComp: [ 0x0, ... ], ... ; // once per register: initial value (before save)
           register_address_write: [ indexComp: [ 0x0, ... ], ... ; // once per register: in which position is stored
           register_address_read:  [ indexComp: [ 0x0, ... ], ... ; // once per register: from which position is restored
        },
        ...
      ] ;
 */


/*
 * Public API
 */

//
// Initialize
// Example: creator_callstack_create() ;
//
function creator_callstack_create()
{
    var ret = {
        ok: true,
        msg: ""
    };

    // initialize stack_call
    stack_call_registers = [];

    return ret;
}

//
// "jal X, ..." -> add new element (at the end)
// Example: creator_callstack_Enter("main")
//
function creator_callstack_enter(function_name)
{
    var ret = {
        ok: true,
        msg: ""
    };

    // initialize fields
    var arr_saved = [];
    var arr_modified = [];
    var arr_write = []
    var arr_read = []
    var arr_value = []
    
    for (var i = 0; i < architecture.components.length; i++)
    {
           arr_saved.push([]);
        arr_modified.push([]);
        arr_write.push([]);
         arr_read.push([]);
        arr_value.push([]);

        for (var j = 0; j < architecture.components[i].elements.length; j++)
        {
               arr_saved[i].push(false);
            arr_modified[i].push(false);
            arr_write[i].push(0x0);
             arr_read[i].push(0x0);
             arr_value[i].push(architecture.components[i].elements[j].value);
        }
    }

    if (typeof window !== "undefined"){
      app._data.begin_caller = architecture.memory_layout[4].value;
      app._data.end_caller = architecture.memory_layout[4].value;
      app._data.begin_callee = architecture.memory_layout[4].value;
      app._data.end_callee = architecture.memory_layout[4].value;
    }

    // initialize elto
    var new_elto = {
        function_name:          function_name,
        begin_caller:           creator_callstack_getTop().begin_callee, // llamante: FFFFFFFC, FFFFFFF0
        end_caller:             architecture.memory_layout[4].value,     // llamante: FFFFFFF0, FFFFFF00
        begin_callee:           architecture.memory_layout[4].value,     // llamado:  FFFFFFF0, FFFFFF00
        end_callee:             architecture.memory_layout[4].value,     // llamado:  FFFFFFF0, FFFFFF00
        registers_saved:        arr_saved,
        registers_modified:     arr_modified,
        registers_value:        arr_value,
        register_address_write: arr_write,
        register_address_read:  arr_read
    };
    
    stack_call_registers.push(new_elto);
    return ret;
}

//
// "jr ra, ..." -> remove last element
// Example: creator_callstack_Leave() ;
//
function creator_callstack_leave()
{
    var ret = {
        ok: true,
        msg: ""
    };

        // check params
    if (0 == stack_call_registers.length) {
        ret.msg = "creator_callstack_Leave: empty stack_call_registers !!.\n";
        return ret;
    }

    var last_elto = stack_call_registers[stack_call_registers.length - 1];

        // check values (check currrent state)
    if (ret.ok)
        {
        for (var i = 0; i < architecture.components.length; i++)
        {
            for (var j = 0; j < architecture.components[i].elements.length; j++)
            {
                if ((last_elto.registers_value[i][j] != architecture.components[i].elements[j].value) &&
                    (architecture.components[i].elements[j].properties.includes("saved"))
                )
                {
                    ret.ok  = false;
                    ret.msg = "Possible failure in the parameter passing convention";
                    break;
                }
            }
        }

        if(creator_callstack_getTop().val.end_caller != architecture.memory_layout[4].value){
          ret.ok = false;
          ret.msg = "Possible failure in the parameter passing convention";
        }
    }
                  
    /*
    if (ret.ok)
    {
        for (var i = 0; i < architecture.components.length; i++)
        {
            for (var j = 0; j < architecture.components[i].elements.length; j++)
            {

                if (
                    (true  == last_elto.registers_modified[i][j]) && // modified but
                    (false == last_elto.registers_saved[i][j]) &&
                                    (architecture.components[i].elements[j].properties.icludes("saved")) // ...but should be saved
                ) 
                {
                    ret.ok = false;
           //       ret.msg = "The value of one or more protected registers is not kept between calls";
                    ret.msg = "The value of one or more protected registers is not kept between calls";
                    break;
                }
            }
        }
    }

    // check values (check currrent state)
    if (ret.ok)
    {
        for (var i = 0; i < architecture.components.length; i++)
        {
            for (var j = 0; j < architecture.components[i].elements.length; j++)
            {   
                if (
                    (true  == last_elto.registers_modified[i][j]) && // modified but
                    (last_elto.register_address_read[i][j] != last_elto.register_address_write[i][j]) && // not read the same address...
                    (architecture.components[i].elements[j].properties.includes("saved")) // ...but should be saved
                )
                {
                    ret.ok  = false;
           //       ret.msg = "The value of one or more protected registers is not kept between calls";
                    ret.msg = "The value of one or more protected registers has not been restored correctly from the address where the register was saved";

                    break;
                }
            }
        }
    }
    */

    stack_call_registers.pop();

    var elto_top = creator_callstack_getTop() ;
    if ( (typeof window !== "undefined") && (elto_top.val != null) )
    {
        app._data.begin_caller  = elto_top.val.begin_caller;  // llamante: FFFFFFFC, FFFFFFF0, FFFFFF00
        app._data.end_caller    = elto_top.val.end_caller;    // llamante: FFFFFFF0, FFFFFF00, FFFFF000
        app._data.begin_callee  = elto_top.val.begin_callee;  // llamado:  FFFFFFF0, FFFFFF00, FFFFF000
        app._data.end_callee    = elto_top.val.end_callee;    // llamado:  FFFFFFF0, FFFFFF00, FFFFF000
    }

    return ret;
}

//
// Get the last element
// Example: var elto = creator_callstack_getTop() ;
//
function creator_callstack_getTop()
{
    var ret = {
        ok: true,
        val: null,
        msg: ""
    };

    // check params
    if (0 == stack_call_registers.length) {
        ret.ok = false;
        ret.msg = "creator_callstack_getTop: empty stack_call_registers !!.\n";
        return ret;
    }

    // return the last element in the array
    ret.val = stack_call_registers[stack_call_registers.length - 1];
    return ret;
}

//
// Let programmers to modify some arbitrary field.
// Example: creator_callstack_getTop("function_name", 1, 2, "main") ;
//
function creator_callstack_setTop( field, indexComponent, indexElement, value )
{
    var ret = {
        ok: true,
        msg: ""
    };

    // check params
    if (0 == stack_call_registers.length) {
        ret.ok = false;
        ret.msg = "creator_callstack_getTop: empty stack_call_registers !!.\n";
        return ret;
    }

    // set field value
    var elto = stack_call_registers[stack_call_registers.length - 1];
    if (typeof elto.length !== "undefined")
    {
        elto[field][indexComponent][indexElement] = value;
        return ret;
    }

    elto[field] = value;
    return ret;
}

function creator_callstack_setsp(value)
{

    if (typeof window !== "undefined"){
      app._data.end_callee = value;   // llamado:  FFFFFFF0, FFFFFF00, FFFFF000
    }

    // check params
    if (0 == stack_call_registers.length) {
        return;
    }

    // return the last element in the array
    var elto = stack_call_registers[stack_call_registers.length - 1];
    elto.end_callee = value;

}

function creator_callstack_reset()
{
    var ret = {
        ok: true,
        msg: ""
    };

    // initialize stack_call
    stack_call_registers = [];

    if (typeof window !== "undefined"){
      app._data.begin_caller  = architecture.memory_layout[4].value;
      app._data.end_caller    = architecture.memory_layout[4].value;
      app._data.begin_callee  = architecture.memory_layout[4].value;
      app._data.end_callee    = architecture.memory_layout[4].value;   
    }
}
