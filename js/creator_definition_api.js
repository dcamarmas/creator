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

function check_protection_jal () // TODO: update the name to a proper one :-)
{
    var function_name = "main";  // TODO: get current subrutine name

    creator_callstack_enter(function_name) ;
}

function check_protection_jrra () // TODO: update the name to a proper one :-)
{
    var ret = creator_callstack_leave();

    // If everything is ok, just return 
    if (ret.ok) {
        return;
    }

    // Othewise...
    /* Google Analytics */
    creator_ga('send', 'event', 'execute', 'execute.exception', 'execute.exception.protection_jrra' + ret.msg);

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

