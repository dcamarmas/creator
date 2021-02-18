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
 *  Description API 
 */

//
// check stack
//

function check_protection_jal ()
{
    // 1.- get function name
    var function_name = _get_subrutine_name() ;

    // 2.- callstack_enter
    creator_callstack_enter(function_name) ;
}

function check_protection_jrra ()
{
    // 1.- callstack_leave
    var ret = creator_callstack_leave();

    // 2) If everything is ok, just return 
    if (ret.ok) {
        return;
    }

    // 3) Othewise report some warning...
    // Google Analytics
    creator_ga('send', 'event', 'execute', 'execute.exception', 'execute.exception.protection_jrra' + ret.msg);

    // User notification
    if (typeof window !== "undefined")
    {
        /* Show Web notification */
        show_notification(ret.msg, 'warning');
    }
    else
    {
       console.log(ret.msg);
    }
}


//
// draw stack
//

function draw_stack_jal ()
{
    // 1.- get function name
    var function_name = _get_subrutine_name() ;

    // 2.- callstack_enter
    track_stack_enter(function_name) ;
}

function draw_stack_jrra ()
{
    // track leave
    var ret = track_stack_leave() ;

    // check if any problem
    if (ret.ok != true) {
        console.log("WARNING: " + ret.msg) ;
    }
}


//
// Auxiliar and internal function
//

function _get_subrutine_name ()
{
    var function_name = "" ;

    // if architecture not loaded then return ""
    if (typeof architecture.components[0] == "undefined") {
        return function_name ;
    }

    // PC points to the next instruction... substract 4
    var pc_function = Number(architecture.components[0].elements[0].value) - 4 ;
    var pc_hex = "0x" + pc_function.toString(16) ;

    // set current subrutine name as "PC=0x..."
    function_name = "PC=" + pc_hex ;

    // try to get current subrutine name and save into function_name
    for (var i = 0; i < instructions.length; i++)
    {
/* ************
            // components/simulator/creator_uielto_table_execution.js draw [Next] in the callee address :-)
            if (instructions[i]._rowVariant == 'success') {
                function_name = instructions[i].Label;
                break;
            }
************* */

            if (instructions[i].Address == pc_hex && instructions[i].Label != ""){
                function_name = instructions[i].Label;
                break;
            }
    }

    return function_name ;
}

