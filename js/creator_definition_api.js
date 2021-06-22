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

/*
 * Name:        capi_syscall - request system call
 * Sypnosis:    capi_syscall (action, value1 [, value2])
 * Description: request a system call
 */

var capi_sc_nargs = {
			"exit":         0,
			"print_char":   1,
			"print_int":    1,
			"print_float":  1,
			"print_double": 1,
			"print_string": 1,
			"read_char":    1,
			"read_int":     1,
			"read_float":   1,
			"read_double":  1,
			"read_string":  2,
			"sbrk":         2
		    } ;

function capi_syscall ( action, value1, value2 )
{
    var nargs = capi_sc_nargs[action] ;
    if (nargs == 0) value1 = "" ;
    if (nargs  < 2) value2 = "" ;

    var ret1 = crex_findReg(value1) ;
    if ( (value2 != "") && (ret1.match == 0) )
    {
        throw packExecute(true, "capi_syscall: register " + value1 + " not found", 'danger', null);
        return;
    }

    var ret2 = crex_findReg(value2) ;
    if ( (value2 != "") && (ret2.match == 0) )
    {
        throw packExecute(true, "capi_syscall: register " + value2 + " not found", 'danger', null);
        return;
    }

    // syscall(action, indexComp, indexElem, indexComp2, indexElem2, first_time)
    syscall(action, ret1.compIndex, ret1.elemIndex, ret2.compIndex, ret2.elemIndex, true);
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

/*
 * Name:        capi_split_double
 * Sypnosis:    capi_split_double (reg, index)
 * Description: split the double register in highter part and lower part
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

/*
 * Name:        capi_uint2float32
 * Sypnosis:    capi_uint2float32 ( value )
 * Description: convert from unsigned int to float32
 */

function capi_uint2float32 ( value )
{
    var buf = new ArrayBuffer(4) ;
    (new Uint32Array(buf))[0] = value ;
    return (new Float32Array(buf))[0] ;
}

/*
 * Name:        capi_float322uint
 * Sypnosis:    capi_float322uint ( value )
 * Description: convert from float32 to unsigned int
 */

function capi_float322uint ( value )
{
    var buf = new ArrayBuffer(4) ;
    (new Float32Array(buf))[0] = value ;
    return (new Uint32Array(buf))[0];
}

/*
 * Name:        capi_int2uint
 * Sypnosis:    capi_int2uint ( value )
 * Description: convert from signed int to unsigned int
 */

function capi_int2uint ( value )
{
    return (value >>> 0) ;
}

/*
 * Name:        capi_uint2int
 * Sypnosis:    capi_uint2int ( value )
 * Description: convert from unsigned int to signed int
 */

function capi_uint2int ( value )
{
    return (value >> 0) ;
}

function capi_uint2float64 ( value0, value1 )
{
    var buf = new ArrayBuffer(8) ;
    var arr = new Uint32Array(buf) ;
    arr[0] = value0 ;
    arr[1] = value1 ;
    return (new Float64Array(buf))[0] ;
}

function capi_float642uint ( value )
{
    var buf = new ArrayBuffer(8) ;
    (new Float64Array(buf))[0] = value ;
    return (new Uint32Array(buf)) ;
}

function capi_build_ieee32 ( s, e, m )
{
    return checkTypeIEEE(s, e, m) ;
}

function capi_float2bin ( f )
{
    return app.float2bin(f) ;
}

