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

function passing_convention_begin ( addr )
{
    var function_name = "" ;

    // 1.- get function name
    if (typeof architecture.components[0] !== "undefined")
    {
        if (typeof tag_instructions[addr] == "undefined")
             function_name = "0x" + parseInt(addr).toString(16) ;
        else function_name = tag_instructions[addr] ;
    }

    // 2.- callstack_enter
    creator_callstack_enter(function_name) ;
}

function passing_convention_end ()
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
         show_notification(ret.msg, 'warning');
    else console.log(ret.msg);
}


//
// draw stack
//

function draw_stack_begin ( addr )
{
    var function_name = "" ;

    // 1.- get function name
    if (typeof architecture.components[0] !== "undefined")
    {
        if (typeof tag_instructions[addr] == "undefined")
             function_name = "0x" + parseInt(addr).toString(16) ;
        else function_name = tag_instructions[addr] ;
    }

    // 2.- callstack_enter
    track_stack_enter(function_name) ;
}

function draw_stack_end ()
{
    // track leave
    var ret = track_stack_leave() ;

    // 2) If everything is ok, just return 
    if (ret.ok) {
        return;
    }

    // User notification
    if (typeof window !== "undefined")
         show_notification(ret.msg, 'warning');
    else console.log("WARNING: " + ret.msg) ;
}

