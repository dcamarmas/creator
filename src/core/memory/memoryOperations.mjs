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
import { architecture, word_size_bytes } from "../core.mjs";
import {
    main_memory_write_bydatatype,
    main_memory_read_bydatatype,
    main_memory_reset,
    main_memory_clear,
    main_memory_get_addresses,
} from "./memoryCore.mjs";
import { data_tag } from "../compiler/compiler.mjs";
import {
    creator_memory_updaterow,
    creator_memory_updateall,
    creator_memory_clearall,
} from "./memoryViewManager.mjs";
import {
    creator_memory_zerofill,
    main_memory_storedata,
} from "./memoryManager.mjs";
import { align } from "../compiler/compiler.mjs";

export function writeMemory(value, addr, type) {
    main_memory_write_bydatatype(addr, value, type, value);

    // update view
    creator_memory_updaterow(addr);
}

export function readMemory(addr, type) {
    return main_memory_read_bydatatype(addr, type);
}
export function creator_memory_reset() {
    main_memory_reset();

    // update view
    creator_memory_updateall();
}
export function creator_memory_clear() {
    main_memory_clear();
    creator_memory_clearall();
}
function creator_memory_is_address_inside_segment(segment_name, addr) {
    let elto_inside_segment = false;

    if (segment_name == "instructions_memory") {
        elto_inside_segment =
            addr >= parseInt(architecture.memory_layout[0].value) &&
            addr <= parseInt(architecture.memory_layout[1].value);
    }
    if (segment_name == "data_memory") {
        elto_inside_segment =
            addr >= parseInt(architecture.memory_layout[2].value) &&
            addr <= parseInt(architecture.memory_layout[3].value);
    }
    if (segment_name == "stack_memory") {
        elto_inside_segment =
            addr >= parseInt(architecture.memory_layout[3].value);
    }

    return elto_inside_segment;
}
function creator_memory_is_segment_empty(segment_name) {
    const addrs = main_memory_get_addresses();
    const insiders = addrs.filter(function (elto) {
        return creator_memory_is_address_inside_segment(segment_name, elto);
    });

    return insiders.length === 0;
}
export function creator_memory_data_compiler(
    data_address,
    value,
    size,
    dataLabel,
    DefValue,
    type,
) {
    const ret = {
        msg: "",
        data_address: 0,
    };

    // If align changes then zerofill first...
    if (data_address % align > 0) {
        const to_be_filled = align - (data_address % align);
        creator_memory_zerofill(data_address, to_be_filled);
        data_address += to_be_filled;
    }

    if (data_address % size !== 0 && data_address % word_size_bytes !== 0) {
        ret.msg = "m21";
        ret.data_address = data_address;
        return ret;
    }

    if (dataLabel != null) {
        data_tag.push({ tag: dataLabel, addr: data_address });
    }

    ret.msg = "";
    ret.data_address = main_memory_storedata(
        data_address,
        value,
        size,
        dataLabel,
        DefValue,
        DefValue,
        type,
    );

    return ret;
}
export function creator_insert_instruction(
    auxAddr,
    value,
    def_value,
    hide,
    hex,
    fill_hex,
    label,
) {
    const size = Math.ceil(hex.toString().length / 2);
    return main_memory_storedata(
        auxAddr,
        hex,
        size,
        label,
        def_value,
        def_value,
        "instruction",
    );
}
export function creator_memory_storestring(
    string,
    string_length,
    data_address,
    label,
    type,
    align,
) {
    if (label != null) {
        data_tag.push({ tag: label, addr: data_address });
    }

    return main_memory_storedata(
        data_address,
        string,
        string_length,
        label,
        string,
        string,
        type,
    );
}
