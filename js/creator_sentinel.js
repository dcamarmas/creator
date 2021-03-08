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

 /* 
  * [ "x", "y" ] ;
  */
 var stack_call_names = [];

 /*
  * [
  *   {
  *     function_name: "",
  *     enter_stack_pointer: 0x0,
  *     registers_sm:           [ indexComp: [ 0, ... ]... ; // once per register: state
  *     registers_value:        [ indexComp: [ 0x0, ... ], ... ; // once per register: initial value (before save)
  *     register_address_write: [ indexComp: [ [0x0, 0x4, ...], ... ], ... ; // once per register: in which position is stored
  *     register_address_read:  [ indexComp: [ [0x0, 0x4, ...], ... ], ... ; // once per register: from which position is restored
  *   },
  *   ...
  * ] ;
  */

 /*
  * States:
  *  0 -> Init
  *  1 -> Saved in memory/stack
  *  2 -> Restored from memory/stack
  *  3 -> Error
  *  4 -> Save/.../Restore/Save
  */

 var stack_call_registers = [];


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
    stack_call_names     = [];
    stack_call_registers = [];
    creator_callstack_enter("main");

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

    // 1.- caller name
    stack_call_names.push(function_name) ;

    // 2.- caller element
    var arr_sm = [];
    var arr_write = []
    var arr_read = []
    var arr_value = []

    for (var i = 0; i < architecture.components.length; i++)
    {
        arr_sm.push([]);
        arr_write.push([]);
         arr_read.push([]);
        arr_value.push([]);

        for (var j = 0; j < architecture.components[i].elements.length; j++)
        {
            arr_sm[i].push(0);
            arr_write[i].push([]);
             arr_read[i].push([]);
             arr_value[i].push(architecture.components[i].elements[j].value);
        }
    }

    var new_elto = {
        function_name:          function_name,
        enter_stack_pointer:    architecture.memory_layout[4].value,
        registers_sm:           arr_sm,
        registers_value:        arr_value,
        register_address_write: arr_write,
        register_address_read:  arr_read
    };

    stack_call_registers.push(new_elto);

    // return ok
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

    // get stack top element
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
    }

    //check sp that points to corresponding address
    if (ret.ok)
    {
        if (architecture.memory_layout[4].value != last_elto.enter_stack_pointer)
        {
            ret.ok  = false;
            ret.msg = "Stack memory has not been released successfully";
        }


    }

    /*****************************
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
    **********************************/

    // pop stack
    stack_call_registers.pop();
    if (stack_call_names.length > 0) {
        stack_call_names.pop() ;
    }

    // return ok
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
    if (0 == stack_call_registers.length)
    {
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
    if (0 == stack_call_registers.length)
    {
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

//
// Let programmers to modify register state
// Example: creator_callstack_setState(1, 2, 1) ;
//
function creator_callstack_setState (indexComponent, indexElement, newState)
{
  var elto = creator_callstack_getTop();
  elto.val.registers_sm[indexComponent][indexElement] = newState;
}


function creator_callstack_getState (indexComponent, indexElement)
{
  var elto = creator_callstack_getTop();
  return elto.val.registers_sm[indexComponent][indexElement];
}

//
// Let programmers add a new write
// Example: creator_callstack_newWrite(1, 2, 0x12345) ;
//
function creator_callstack_newWrite (indexComponent, indexElement, address)
{
  var elto = creator_callstack_getTop();
  elto.val.register_address_write[indexComponent][indexElement].push(address);

  //Move state finite machine
  var state = creator_callstack_getState(indexComponent, indexElement);
  if(state == 0 || state == 1 || state == 2){
    creator_callstack_setState(indexComponent, indexElement, 1);
    return;
  }
  if(state == 2){
    creator_callstack_setState(indexComponent, indexElement, 4);
    return;
  }
  creator_callstack_setState(indexComponent, indexElement, 3);
}

//
// Let programmers add a new read
// Example: creator_callstack_newRead(1, 2, 0x12345) ;
//
function creator_callstack_newRead (indexComponent, indexElement, address)
{
  var elto = creator_callstack_getTop();
  elto.val.register_address_read[indexComponent][indexElement].push(address);

  //Move state finite machine
  var state = creator_callstack_getState(indexComponent, indexElement);
  if(state == 1 || state == 2 || state == 4){
    creator_callstack_setState(indexComponent, indexElement, 2);
    return;
  }
  creator_callstack_setState(indexComponent, indexElement, 3);
}

//
// Let programmers add a new read
// Example: creator_callstack_newRead(1, 2, 0x12345) ;
//
function creator_callstack_writeRegister (indexComponent, indexElement)
{
  //Move state finite machine
  var state = creator_callstack_getState(indexComponent, indexElement);
  if(state == 1 || state == 4){
    creator_callstack_setState(indexComponent, indexElement, 1);
    return;
  }
  creator_callstack_setState(indexComponent, indexElement, 3);
}

//
// Reset
// Example: creator_callstack_reset() ;
//
function creator_callstack_reset()
{
    var ret = {
        ok: true,
        msg: ""
    };

    // initialize stack_call
    stack_call_names     = [];
    stack_call_registers = [];
    creator_callstack_enter("main");

    // return ok
    return ret ;
}

