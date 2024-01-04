
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
 *  CREATOR instruction description API:
 *  Assert
 */

function capi_raise ( msg )
{
	if (typeof app !== "undefined"){
		app.exception(msg);
	}
	else
	{
		console.log(msg);
	}
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
	size = creator_memory_type2size(type) ;
	return (addr % size !== 0) ; // && (architecture.properties.memory_align == true) ; <- FUTURE-WORK
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

function capi_mem_write ( addr, value, type, reg_name )
{
	var size = 1 ;

	// 1) check address is aligned
	if (capi_bad_align(addr, type))
	{
		capi_raise("The memory must be align") ;
		creator_executor_exit( true );
	}

	// 2) check address is into text segment
	var addr_16 = parseInt(addr, 16);
	if((addr_16 >= parseInt(architecture.memory_layout[0].value)) && (addr_16 <= parseInt(architecture.memory_layout[1].value)))
    {
        capi_raise('Segmentation fault. You tried to write in the text segment');
        creator_executor_exit( true );
    }

	// 3) write into memory
	try {
		writeMemory(value, addr, type);
	} 
	catch(e) {
		capi_raise("Invalid memory access to address '0x" + addr.toString(16) + "'") ;
		creator_executor_exit( true );
	}

	// 4) Call convenction
	var ret = crex_findReg(reg_name) ;
	if (ret.match === 0) {
		return;
	}

	var i = ret.indexComp ;
	var j = ret.indexElem ;

	creator_callstack_newWrite(i, j, addr, type);
}

/*
 * Name:        mp_read - Read value from a memory address
 * Sypnosis:    mp_read (source_address, byte_or_half_or_word)
 * Description: read a value from an address
 */

function capi_mem_read ( addr, type, reg_name )
{
	var size = 1 ;
	var val  = 0x0 ;

	// 1) check address is aligned
	if (capi_bad_align(addr, type))
	{
		capi_raise("The memory must be align") ;
		creator_executor_exit( true );
	}

	// 2) check address is into text segment
	var addr_16 = parseInt(addr, 16);
	if((addr_16 >= parseInt(architecture.memory_layout[0].value)) && (addr_16 <= parseInt(architecture.memory_layout[1].value)))
    {
        capi_raise('Segmentation fault. You tried to read in the text segment');
        creator_executor_exit( true );
    }

	// 3) read from memory
	try {
		val = readMemory(addr, type);
	} 
	catch(e) {
	   capi_raise("Invalid memory access to address '0x" + addr.toString(16) + "'") ;
	   creator_executor_exit( true );
	}

	var ret = creator_memory_value_by_type(val, type) ;

	// 4) Call convenction
	var find_ret = crex_findReg(reg_name) ;
	if (find_ret.match === 0) {
		return ret;
	}

	var i = find_ret.indexComp ;
	var j = find_ret.indexElem ;
	
	creator_callstack_newRead(i, j, addr, type);

	// 5) return value
	return ret ;
}


/*
 *  CREATOR instruction description API:
 *  Syscall
 */

function capi_exit ( )
{
	/* Google Analytics */
	creator_ga('execute', 'execute.syscall', 'execute.syscall.exit');

	return creator_executor_exit( false ) ;
}

function capi_print_int ( value1 )
{
	/* Google Analytics */
	creator_ga('execute', 'execute.syscall', 'execute.syscall.print_int');

	/* Get register id */
	var ret1 = crex_findReg(value1) ;
	if (ret1.match === 0) {
		throw packExecute(true, "capi_syscall: register " + value1 + " not found", 'danger', null);
	}

	/* Print integer */
	var value   = readRegister(ret1.indexComp, ret1.indexElem);
	var val_int = parseInt(value.toString()) >> 0 ;


	var value = readRegister(ret1.indexComp, ret1.indexElem);
	var val_int = parseInt(value.toString()) >> 0 ;

	display_print(full_print(val_int, null, false));
}

function capi_print_float ( value1 )
{
	/* Google Analytics */
	creator_ga('execute', 'execute.syscall', 'execute.syscall.print_float');

	/* Get register id */
	var ret1 = crex_findReg(value1) ;
	if (ret1.match == 0) {
		throw packExecute(true, "capi_syscall: register " + value1 + " not found", 'danger', null);
	}

	/* Print float */
	var value = readRegister(ret1.indexComp, ret1.indexElem, "SFP-Reg");
	var bin = float2bin(value);

	display_print(full_print(value, bin, true));
}

function capi_print_double ( value1 )
{
	/* Google Analytics */
	creator_ga('execute', 'execute.syscall', 'execute.syscall.print_double');

	/* Get register id */
	var ret1 = crex_findReg(value1) ;
	if (ret1.match == 0) {
		throw packExecute(true, "capi_syscall: register " + value1 + " not found", 'danger', null);
	}

	/* Print double */
	var value = readRegister(ret1.indexComp, ret1.indexElem, "DFP-Reg");
	var bin = double2bin(value);

	display_print(full_print(value, bin, true));
}

function capi_print_char ( value1 )
{
	/* Google Analytics */
	creator_ga('execute', 'execute.syscall', 'execute.syscall.print_char');

	/* Get register id */
	var ret1 = crex_findReg(value1) ;
	if (ret1.match == 0) {
		throw packExecute(true, "capi_syscall: register " + value1 + " not found", 'danger', null);
	}

	/* Print char */
	var aux    = readRegister(ret1.indexComp, ret1.indexElem);
	var aux2   = aux.toString(16);
	var length = aux2.length;

	var value = aux2.substring(length-2, length) ;
	value = String.fromCharCode(parseInt(value, 16)) ;

	display_print(value) ;
}

function capi_print_string ( value1 )
{
	/* Google Analytics */
	creator_ga('execute', 'execute.syscall', 'execute.syscall.print_string');

	/* Get register id */
	var ret1 = crex_findReg(value1) ;
	if (ret1.match == 0) {
		throw packExecute(true, "capi_syscall: register " + value1 + " not found", 'danger', null);
	}

	/* Print string */
	var addr = readRegister(ret1.indexComp, ret1.indexElem);
    var msg  = readMemory(parseInt(addr), "string") ;
	display_print(msg) ;
}

function capi_read_int ( value1 )
{
	/* Google Analytics */
	creator_ga('execute', 'execute.syscall', 'execute.syscall.read_int');

	/* Get register id */
	var ret1 = crex_findReg(value1) ;
	if (ret1.match == 0) {
		throw packExecute(true, "capi_syscall: register " + value1 + " not found", 'danger', null);
	}

	/* Read integer */
        if (typeof document != "undefined") {
	    document.getElementById('enter_keyboard').scrollIntoView();
	}

	run_program = 3;
	return keyboard_read(kbd_read_int, ret1) ;
}

function capi_read_float ( value1 )
{
	/* Google Analytics */
	creator_ga('execute', 'execute.syscall', 'execute.syscall.read_float');

	/* Get register id */
	var ret1 = crex_findReg(value1) ;
	if (ret1.match == 0) {
		throw packExecute(true, "capi_syscall: register " + value1 + " not found", 'danger', null);
	}

        if (typeof document != "undefined") {
	    document.getElementById('enter_keyboard').scrollIntoView();
	}

	run_program = 3;
	return keyboard_read(kbd_read_float, ret1) ;
}

function capi_read_double ( value1 )
{
	/* Google Analytics */
	creator_ga('execute', 'execute.syscall', 'execute.syscall.read_double');

	/* Get register id */
	var ret1 = crex_findReg(value1) ;
	if (ret1.match == 0) {
		throw packExecute(true, "capi_syscall: register " + value1 + " not found", 'danger', null);
	}

        if (typeof document != "undefined") {
	    document.getElementById('enter_keyboard').scrollIntoView();
	}

	run_program = 3;
	return keyboard_read(kbd_read_double, ret1) ;
}

function capi_read_char ( value1 )
{
	/* Google Analytics */
	creator_ga('execute', 'execute.syscall', 'execute.syscall.read_char');

	/* Get register id */
	var ret1 = crex_findReg(value1) ;
	if (ret1.match == 0) {
		throw packExecute(true, "capi_syscall: register " + value1 + " not found", 'danger', null);
	}

        if (typeof document != "undefined") {
	    document.getElementById('enter_keyboard').scrollIntoView();
	}

	run_program = 3;
	return keyboard_read(kbd_read_char, ret1) ;
}

function capi_read_string ( value1, value2 )
{
	/* Google Analytics */
	creator_ga('execute', 'execute.syscall', 'execute.syscall.read_string');

	/* Get register id */
	var ret1 = crex_findReg(value1) ;
	if (ret1.match === 0) {
		throw packExecute(true, "capi_syscall: register " + value1 + " not found", 'danger', null);
	}

	var ret2 = crex_findReg(value2) ;
	if (ret2.match === 0) {
		throw packExecute(true, "capi_syscall: register " + value2 + " not found", 'danger', null);
	}

	/* Read string */
	if (typeof document != "undefined") {
	    document.getElementById('enter_keyboard').scrollIntoView();
	}

	ret1.indexComp2 = ret2.indexComp ;
	ret1.indexElem2 = ret2.indexElem ;

	run_program = 3;
	return keyboard_read(kbd_read_string, ret1) ;
}

function capi_sbrk ( value1, value2 )
{
	/* Google Analytics */
	creator_ga('execute', 'execute.syscall', 'execute.syscall.sbrk');

	/* Get register id */
	var ret1 = crex_findReg(value1) ;
	if (ret1.match === 0) {
		throw packExecute(true, "capi_syscall: register " + value1 + " not found", 'danger', null);
	}

	var ret2 = crex_findReg(value2) ;
	if (ret2.match === 0) {
		throw packExecute(true, "capi_syscall: register " + value2 + " not found", 'danger', null);
	}

	/* Request more memory */
	var new_size = parseInt(readRegister(ret1.indexComp, ret1.indexElem)) ;
	if (new_size < 0) {
		throw packExecute(true, "capi_syscall: negative size", 'danger', null) ;
	}

    var new_addr = creator_memory_alloc(new_size) ;
	writeRegister(new_addr, ret2.indexComp, ret2.indexElem);
}

function capi_get_clk_cycles ( )
{
	/* Google Analytics */
	creator_ga('execute', 'execute.syscall', 'execute.syscall.get_clk_cycles');

	return total_clk_cycles;
}


/*
 *  CREATOR instruction description API:
 *  Check stack
 */

function capi_callconv_begin ( addr )
{
	var function_name = "" ;

	// 1) Passing Convection enable?
	if (architecture.arch_conf[6].value === 0) {
		return;
	}

	// 2) get function name
	if (typeof architecture.components[0] !== "undefined")
	{
		if (typeof tag_instructions[addr] === "undefined")
			 function_name = "0x" + parseInt(addr).toString(16) ;
		else function_name = tag_instructions[addr] ;
	}

	// 3) callstack_enter
	creator_callstack_enter(function_name) ;
}

function capi_callconv_end ()
{
	// 1) Passing Convection enable?
	if (architecture.arch_conf[6].value === 0) {
		return;
	}

	// 2) Callstack_leave
	var ret = creator_callstack_leave();

	// 3) If everything is ok, just return 
	if (ret.ok) {
		return;
	}

	// 4) Othewise report some warning...
	// Google Analytics
	creator_ga('execute', 'execute.exception', 'execute.exception.protection_jrra' + ret.msg);

	// User notification
	crex_show_notification(ret.msg, 'danger') ;
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
	if(index === 0){
		return value.substring(0,8);
	}
	if(index === 1) {
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
