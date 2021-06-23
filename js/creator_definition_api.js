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
 *  CREATOR instruction description API:
 *  Assert
 */

function capi_raise ( msg )
{
    if (typeof app !== "undefined")
         app.exception(msg);
    else console.log(msg);
}

function capi_arithmetic_overflow ( op1, op2, res_u )
{
    op1_u = capi_uint2int(op1) ;
    op2_u = capi_uint2int(op2) ;
    res_u = capi_uint2int(res_u) ;

    return ((op1_u > 0) && (op2_u > 0) && (res_u < 0)) || 
           ((op1_u < 0) && (op2_u < 0) && (res_u > 0)) ;
}

function capi_bad_align ( addr, type )
{
    size = crex_type2size(type) ;
    return (addr % size != 0) ; // && (architecture.properties.memory_align == true) ; <- FUTURE-WORK
}


/*
 *  CREATOR instruction description API:
 *  Memory access
 */

/*
 * Name:        mp_write - Write value into a memory address
 * Sypnosis:    mp_write (destination_address, value2store, byte_or_half_or_word)
 * Description: similar to memmove/memcpy, store a value into an address
 */

function capi_mem_write ( addr, value, type )
{
    var size = 1 ;

    // 1) check address is aligned
    if (capi_bad_align(addr, type))
    {
	capi_raise("The memory must be align") ;
        return;
    }

    // 2) write into memory
    try {
        writeMemory(value, addr, type);
    } 
    catch(e) {
	capi_raise("Invalid memory access to address '0x" + addr.toString(16) + "'") ;
    }
}

/*
 * Name:        mp_read - Read value from a memory address
 * Sypnosis:    mp_read (source_address, byte_or_half_or_word)
 * Description: read a value from an address
 */

function capi_mem_read ( addr, type )
{
    var size = 1 ;
    var val  = 0x0 ;

    // 1) check address is aligned
    if (capi_bad_align(addr, type))
    {
	capi_raise("The memory must be align") ;
        return val;
    }

    // 2) read from memory
    try {
        val = readMemory(addr, type);
    } 
    catch(e) {
	capi_raise("Invalid memory access to address '0x" + addr.toString(16) + "'") ;
        return val;
    }

    // 3) return value
    return crex_value_by_type(val, type) ;
}


/*
 *  CREATOR instruction description API:
 *  Syscall
 */

function capi_exit ( )
{
    return syscall_exit() ;
}

function capi_print_int ( value1 )
{
    var ret1 = crex_findReg(value1) ;
    if (ret1.match == 0)
    {
        throw packExecute(true, "capi_syscall: register " + value1 + " not found", 'danger', null);
        return;
    }

    return print_int(ret1.compIndex, ret1.elemIndex) ;
}

function capi_print_float ( value1 )
{
    var ret1 = crex_findReg(value1) ;
    if (ret1.match == 0)
    {
        throw packExecute(true, "capi_syscall: register " + value1 + " not found", 'danger', null);
        return;
    }

    return print_float(ret1.compIndex, ret1.elemIndex) ;
}

function capi_print_double ( value1 )
{
    var ret1 = crex_findReg(value1) ;
    if (ret1.match == 0)
    {
        throw packExecute(true, "capi_syscall: register " + value1 + " not found", 'danger', null);
        return;
    }

    return print_double(ret1.compIndex, ret1.elemIndex) ;
}

function capi_print_string ( value1 )
{
    var ret1 = crex_findReg(value1) ;
    if (ret1.match == 0)
    {
        throw packExecute(true, "capi_syscall: register " + value1 + " not found", 'danger', null);
        return;
    }

    return print_string(ret1.compIndex, ret1.elemIndex) ;
}

function capi_print_char ( value1 )
{
    var ret1 = crex_findReg(value1) ;
    if (ret1.match == 0)
    {
        throw packExecute(true, "capi_syscall: register " + value1 + " not found", 'danger', null);
        return;
    }

    return print_char(ret1.compIndex, ret1.elemIndex) ;
}

function capi_read_int ( value1 )
{
    var ret1 = crex_findReg(value1) ;
    if (ret1.match == 0)
    {
        throw packExecute(true, "capi_syscall: register " + value1 + " not found", 'danger', null);
        return;
    }

    document.getElementById('enter_keyboard').scrollIntoView();
    return read_int(ret1.compIndex, ret1.elemIndex) ;
}

function capi_read_float ( value1 )
{
    var ret1 = crex_findReg(value1) ;
    if (ret1.match == 0)
    {
        throw packExecute(true, "capi_syscall: register " + value1 + " not found", 'danger', null);
        return;
    }

    document.getElementById('enter_keyboard').scrollIntoView();
    return read_float(ret1.compIndex, ret1.elemIndex) ;
}

function capi_read_double ( value1 )
{
    var ret1 = crex_findReg(value1) ;
    if (ret1.match == 0)
    {
        throw packExecute(true, "capi_syscall: register " + value1 + " not found", 'danger', null);
        return;
    }

    document.getElementById('enter_keyboard').scrollIntoView();
    return read_double(ret1.compIndex, ret1.elemIndex) ;
}

function capi_read_string ( value1, value2 )
{
    var ret1 = crex_findReg(value1) ;
    if (ret1.match == 0)
    {
        throw packExecute(true, "capi_syscall: register " + value1 + " not found", 'danger', null);
        return;
    }

    var ret2 = crex_findReg(value2) ;
    if (ret2.match == 0)
    {
        throw packExecute(true, "capi_syscall: register " + value2 + " not found", 'danger', null);
        return;
    }

    document.getElementById('enter_keyboard').scrollIntoView();
    return read_string(ret1.compIndex, ret1.elemIndex, ret2.compIndex, ret2.elemIndex) ;
}

function capi_read_char ( value1 )
{
    var ret1 = crex_findReg(value1) ;
    if (ret1.match == 0)
    {
        throw packExecute(true, "capi_syscall: register " + value1 + " not found", 'danger', null);
        return;
    }

    document.getElementById('enter_keyboard').scrollIntoView();
    return read_char(ret1.compIndex, ret1.elemIndex) ;
}

function capi_sbrk ( value1, value2 )
{
    var ret1 = crex_findReg(value1) ;
    if (ret1.match == 0)
    {
        throw packExecute(true, "capi_syscall: register " + value1 + " not found", 'danger', null);
        return;
    }

    var ret2 = crex_findReg(value2) ;
    if (ret2.match == 0)
    {
        throw packExecute(true, "capi_syscall: register " + value2 + " not found", 'danger', null);
        return;
    }

    return syscall_sbrk(ret1.compIndex, ret1.elemIndex, ret2.compIndex, ret2.elemIndex) ;
}


/*
 *  CREATOR instruction description API:
 *  Check stack
 */

function capi_callconv_begin ( addr )
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

function capi_callconv_end ()
{
    // 1.- callstack_leave
    var ret = creator_callstack_leave();

    // 2) If everything is ok, just return 
    if (ret.ok) {
        return;
    }

    // 3) Othewise report some warning...
    // Google Analytics
    creator_ga('execute', 'execute.exception', 'execute.exception.protection_jrra' + ret.msg);

    // User notification
    crex_show_notification(ret.msg, 'danger') ;
}

function capi_callconv_memAction ( action, addr, reg_name, type )
{
    // 1) search for reg_name...
    var ret = crex_findReg(reg_name) ;
    if (ret.match == 0) {
        return;
    }

    var i = ret.compIndex ;
    var j = ret.elemIndex ;

    // 2) switch action...
    switch (action) 
    {
        case 'write': creator_callstack_newWrite(i, j, addr, type);
                      break;
        case 'read':  creator_callstack_newRead(i, j, addr, type);
                      break;
        default:      crex_show_notification(" Unknown action '" + action + "' at ...sing_convention_memory.\n", 'danger') ;
                      break;
    }
}


/*
 *  CREATOR instruction description API:
 *  Draw stack
 */

function capi_drawstack_begin ( addr )
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

function capi_drawstack_end ()
{
    // track leave
    var ret = track_stack_leave() ;

    // 2) If everything is ok, just return 
    if (ret.ok) {
        return;
    }

    // User notification
    crex_show_notification(ret.msg, 'warning') ;
}


/*
 *  CREATOR instruction description API:
 *  Representation
 */

function capi_split_double ( reg, index )
{
    var value = bin2hex(double2bin(reg));
    console_log(value);
    if(index == 0){
        return value.substring(0,8);
    }
    if(index == 1) {
        return value.substring(8,16);
    }
}

function capi_uint2float32 ( value )
{
    return uint_to_float32(value) ;
}

function capi_float322uint ( value )
{
    return float32_to_uint(value) ;
}

function capi_int2uint ( value )
{
    return (value >>> 0) ;
}

function capi_uint2int ( value )
{
    return (value >> 0) ;
}

function capi_uint2float64 ( value0, value1 )
{
    return uint_to_float64(value0, value1) ;
}

function capi_float642uint ( value )
{
    return float64_to_uint(value) ;
}

function capi_check_ieee ( s, e, m )
{
    return checkTypeIEEE(s, e, m) ;
}

function capi_float2bin ( f )
{
    return float2bin(f) ;
}

