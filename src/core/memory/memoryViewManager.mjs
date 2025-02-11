/*
 *  Copyright 2018-2025 Felix Garcia Carballeira, Alejandro Calderon Mateos, Diego Camarmas Alonso
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
'use strict';
import { app, word_size_bytes } from '../core.mjs';
import { main_memory_read, main_memory_get_addresses } from './memoryCore.mjs';
import { hex2float, hex2char8 } from '../utils/utils.mjs';
import { main_memory_datatypes } from './memoryCore.mjs'


/************************
 * Public API (2/3): UI *
 ************************/
// update an app._data.main_memory row:
//  "000": { addr: 2003, addr_begin: "0x200", addr_end: "0x2003",
//           hex:[{byte: "1A", tag: "main"},...],
//           value: "1000", size: 4, eye: true, hex_packed: "1A000000" },
//  ...
export function creator_memory_updaterow(addr) {
  // skip if app.data does not exit...
  if ((typeof app == "undefined") || (typeof app._data.main_memory == "undefined")) {
    return;
  }

  // base address
  var addr_base = parseInt(addr);
  addr_base = addr_base - (addr_base % word_size_bytes); // get word aligned address


  // get_or_create...
  var elto = { addr: 0, addr_begin: '', addr_end: '', value: '', size: 0, hex: [], eye: true };
  if (typeof app._data.main_memory[addr_base] != "undefined") { // reuse the existing element...
    elto = app._data.main_memory[addr_base];
  }

  else { // set a new element, and set the initial values...
    Vue.set(app._data.main_memory, addr_base, elto);

    for (var i = 0; i < word_size_bytes; i++) {
      elto.hex[i] = { byte: "00", tag: null };
    }
  }

  // addr_begin
  elto.addr_begin = "0x" + addr_base.toString(16).padStart(word_size_bytes * 2, "0").toUpperCase();

  // addr_end
  var addr_end = addr_base + word_size_bytes - 1;
  elto.addr_end = "0x" + addr_end.toString(16).padStart(word_size_bytes * 2, "0").toUpperCase();

  // addr
  elto.addr = addr_end;

  // hex, hex_packed
  var v1 = {};
  elto.hex_packed = '';
  for (let i = 0; i < word_size_bytes; i++) {
    v1 = main_memory_read(addr_base + i);

    elto.hex[i].byte = v1.bin;
    elto.hex[i].tag = v1.tag;
    if (v1.tag == "") {
      elto.hex[i].tag = null;
    }

    elto.hex_packed += v1.bin;
  }

  // value, size and eye
  elto.value = '';
  elto.size = 0;
  for (let i = 0; i < word_size_bytes; i++) {
    if (typeof main_memory_datatypes[addr_base + i] == "undefined") {
      continue;
    }

    elto.size = elto.size + main_memory_datatypes[addr_base + i].size;
    if (main_memory_datatypes[addr_base + i].type != "space") {
      if (elto.value != '')
        elto.value += ', ';
      elto.value += main_memory_datatypes[addr_base + i].value;
    }
    else { // (main_memory_datatypes[addr_base+i].type == "space")
      elto.eye = true;
    }
  }
}

export function creator_memory_updateall() {
  // skip if app.data does not exit...
  if ((typeof app == "undefined") || (typeof app._data.main_memory == "undefined")) {
    return;
  }

  // update all rows in app._data.main_memory...
  var addrs = main_memory_get_addresses();

  var last_addr = -1;
  var curr_addr = -1;
  for (var i = 0; i < addrs.length; i++) {
    curr_addr = parseInt(addrs[i]);
    if (Math.abs(curr_addr - last_addr) > (word_size_bytes - 1)) // if (|curr - last| > 3)
    {
      creator_memory_updaterow(addrs[i]);
      last_addr = curr_addr;
    }
  }
}
export function creator_memory_clearall() {
  // skip if app.data does not exit...
  if ((typeof app == "undefined") || (typeof app._data.main_memory == "undefined")) {
    return;
  }

  // clear all
  app._data.main_memory = {};
}
function creator_memory_update_row_view(selected_view, segment_name, row_info) {
  if (typeof app._data.main_memory[row_info.addr] == "undefined") {
    return;
  }

  var hex_packed = app._data.main_memory[row_info.addr].hex_packed;
  var new_value = app._data.main_memory[row_info.addr].value;

  switch (selected_view) {
    case "sig_int":
      new_value = parseInt(hex_packed, 16) >> 0;
      break;
    case "unsig_int":
      new_value = parseInt(hex_packed, 16) >>> 0;
      break;
    case "float":
      new_value = hex2float("0x" + hex_packed);
      break;
    case "char":
      new_value = hex2char8(hex_packed);
      break;
  }

  app._data.main_memory[row_info.addr].value = new_value;
}
function creator_memory_update_space_view(selected_view, segment_name, row_info) {
  for (var i = 0; i < row_info.size; i++) {
    creator_memory_update_row_view(selected_view, segment_name, row_info);
    row_info.addr++;
  }
}
