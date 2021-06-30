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


/********************
 * Global variables *
 ********************/

var memory_hash     = ["data_memory", "instructions_memory", "stack_memory"];
var memory          = {data_memory: [], instructions_memory: [], stack_memory: []};
var word_size_bits  = 32; //TODO: load from architecture
var word_size_bytes = word_size / 8; //TODO: load from architecture




var main_memory = [];


//Read and write into/from memory (compilation)
function main_memory_read (addr) 
{
	if (typeof main_memory[addr] !== "undefined")
	{
		return main_memory[addr];
	}

	return {addr: addr, bin: "00", def_bin: "00", tag: null};
}

function main_memory_write (addr, value) 
{
	main_memory[addr] = value;
}





//Read and write value (byte) (execution)
function main_memory_read_value (addr) 
{
	return main_memory_read (addr).bin;
}

//Addr as integer; Value in hexadecimal (string)
function main_memory_write_value (addr, value) 
{
	var value = {addr: addr, bin: value, def_bin: "00", tag: null};
	main_memory_write (addr, value);
}





//Read and write a data type (byte, half, word, etc)
function main_memory_read_bytype (addr, type) 
{
	switch(type){
		case 'b':
			return main_memory_read_value(addr);
		case 'h':
			return main_memory_read_nbytes (addr, word_size_bytes/2);
		case 'w':
			return main_memory_read_nbytes (addr, word_size_bytes); 
		case 'd':
			return main_memory_read_nbytes (addr, word_size_bytes*2); 
	}
}

function main_memory_read_nbytes (addr, n)
{
	var value = "";
	for (var i = 0; i < n; i++) {
		value = value + main_memory_read_value(addr+i); //TODO: cast??
	}
	return value;
}


function main_memory_write_bytype (addr, value, type) 
{


	switch(type){
		case 'b':
			return main_memory_write_value(addr, value);
		case 'h':
			return main_memory_write_nbytes (addr, value, word_size_bytes/2);
		case 'w':
			return main_memory_write_nbytes (addr, value, word_size_bytes); 
		case 'd':
			return main_memory_write_nbytes (addr, value, word_size_bytes*2); 
	}
}

function main_memory_write_nbytes (addr, value, n)
{    
	var chunks = value.match(/.{1,${value.length\/n}}/g);

	for (var i = 0; i < chunks.length; i++) {
		main_memory_write_value(addr+i, chunks[i]); //TODO: cast??
	}
}