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
"use strict";
import { app, architecture, word_size_bytes } from "../core.mjs";
import {
    main_memory_datatype_get_addresses,
    main_memory_get_addresses,
    main_memory_write_bydatatype,
    main_memory_write_tag,
    main_memory_zerofill,
} from "./memoryCore.mjs";
import { creator_memory_updateall } from "./memoryViewManager.mjs";
import { align } from "../compiler/compiler.mjs";
import { main_memory, main_memory_datatypes } from "./memoryCore.mjs";

/********************
 * Public API (1/3) *
 ********************/
// Type, size and address...

export function creator_memory_type2size(type) {
    var size = 4;

    switch (type) {
        case "b":
        case "bu":
        case "byte":
            size = 1;
            break;

        case "h":
        case "hu":
        case "half":
        case "half_word":
            size = word_size_bytes / 2;
            break;

        case "w":
        case "wu":
        case "word":
        case "float":
        case "integer":
        case "instruction":
            size = word_size_bytes;
            break;

        case "d":
        case "du":
        case "double":
        case "double_word":
            size = word_size_bytes * 2;
            break;
    }

    return BigInt(size);
}
export function creator_memory_value_by_type(val, type) {
    if (typeof val === "string" && !val.startsWith("0x")) {
        val = "0x" + val;
    }
    val = BigInt(val);
    switch (type) {
        case "b":
            val = BigInt.asIntN(8, val);
            break;

        case "bu":
            val = BigInt.asUintN(8, val);
            break;

        case "h":
            val = BigInt.asIntN(16, val);
            break;

        case "hu":
            val = BigInt.asUintN(16, val);
            break;

        case "w":
            val = BigInt.asIntN(32, val);
            break;

        case "wu":
            val = BigInt.asUintN(32, val);
            break;

        default:
            break;
    }

    return val;
}
export function creator_memory_alignelto(new_addr, new_size) {
    var ret = {
        new_addr: new_addr,
        new_size: new_size,
    };

    // get align address and size
    for (var i = 0; i < align; i++) {
        if ((new_addr + i) % align === 0) {
            ret.new_addr = new_addr + i;
        }
        if ((new_size + i) % align === 0) {
            ret.new_size = new_size + i;
        }
    }

    return ret;
} // set default content for main_memory and main_memory_datatype
export function creator_memory_prereset() {
    var i = 0;

    // prereset main memory
    var addrs = main_memory_get_addresses();
    for (i = 0; i < addrs.length; i++) {
        main_memory[addrs[i]].def_bin = main_memory[addrs[i]].bin;
    }

    // prereset datatypes
    addrs = main_memory_datatype_get_addresses();
    for (i = 0; i < addrs.length; i++) {
        main_memory_datatypes[addrs[i]].default = main_memory_datatypes[addrs[i]].value;
    }
}
// find address by tag
export function creator_memory_findaddress_bytag(tag) {
    var ret = {
        exit: 0,
        value: 0,
    };

    // find main memory by tag
    var addrs = main_memory_get_addresses();
    for (var i = 0; i < addrs.length; i++) {
        if (main_memory[addrs[i]].tag == tag) {
            ret.exit = 1;
            ret.value = parseInt(addrs[i]);
        }
    }

    return ret;
}
// memory zerofill and alloc ...
export function creator_memory_zerofill(new_addr, new_size) {
    // fill memory
    main_memory_zerofill(new_addr, new_size);

    // update view
    creator_memory_updateall();

    // return initial address used
    return new_addr;
}

export function creator_memory_alloc(new_size) {
    // get align address
    var new_addr = parseInt(architecture.memory_layout[3].value) + 1;
    var algn = creator_memory_alignelto(new_addr, new_size);

    // fill memory
    creator_memory_zerofill(algn.new_addr, algn.new_size);

    // new segment limit
    architecture.memory_layout[3].value = "0x" + (algn.new_addr + new_size).toString(16).padStart(8, "0").toUpperCase();
    if (typeof app !== "undefined") {
        app.architecture.memory_layout[3].value =
            "0x" + (algn.new_addr + new_size).toString(16).padStart(8, "0").toUpperCase();
    }

    return algn.new_addr;
}
export function main_memory_storedata(data_address, value, size, dataLabel, value_human, DefValue, type) {
    var algn = creator_memory_alignelto(data_address, size);

    main_memory_write_bydatatype(algn.new_addr, value, type, value_human);
    creator_memory_zerofill(algn.new_addr + size, algn.new_size - size);

    if (dataLabel != "") {
        main_memory_write_tag(algn.new_addr, dataLabel);
    }

    return parseInt(algn.new_addr) + parseInt(size);
}
// for debugging...
function creator_memory_consolelog() {
    var i = 0;

    // show main memory
    console.log(" ~~~ main memory ~~~~~~~~~~~~~~");
    var addrs = main_memory_get_addresses();
    for (i = 0; i < addrs.length; i++) {
        console.log(JSON.stringify(main_memory[addrs[i]]));
    }

    // show datatypes
    console.log(" ~~~ datatypes ~~~~~~~~~~~~~~");
    addrs = main_memory_datatype_get_addresses();
    for (i = 0; i < addrs.length; i++) {
        console.log(JSON.stringify(main_memory_datatypes[addrs[i]]));
    }
}
