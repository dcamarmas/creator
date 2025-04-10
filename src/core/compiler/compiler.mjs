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
"use strict"
import {
    architecture,
    architecture_hash,
    status,
    stats,
    stats_value,
    code_assembly,
    update_binary,
    backup_stack_address,
    backup_data_address,
    arch,
    dumpMemory,
    REGISTERS,
} from "../core.mjs";
import {
    creator_memory_prereset,
    creator_memory_zerofill,
} from "../memory/memoryManager.mjs";
import {
    creator_memory_clear,
    creator_insert_instruction,
    writeMemory,
    creator_memory_data_compiler,
    creator_memory_storestring,
} from "../memory/memoryOperations.mjs";
import { bi_intToBigInt } from "../utils/bigint.mjs";
import { creator_ga } from "../utils/creator_ga.mjs";
import { logger, console_log } from "../utils/creator_logger.mjs";
import { bin2hex, isDeno, isWeb } from "../utils/utils.mjs";

import { main_memory_zerofill } from "../memory/memoryCore.mjs";


// Conditional import for the WASM compiler based on the environment (web or Deno)
import {
    DataCategoryJS as DataCategoryJS_web,
} from "./web/creator_compiler.js"
import {
    DataCategoryJS as DataCategoryJS_deno,
} from "./deno/creator_compiler.js"

let DataCategoryJS
if (isDeno) {
    // Deno HAS to be imported like this, as it doesn't provide a default
    DataCategoryJS = DataCategoryJS_deno
} else if (isWeb) {
    DataCategoryJS = DataCategoryJS_web
} else {
    throw new Error(
        "Unsupported environment: neither Deno nor web browser detected",
    )
}


let textarea_assembly_editor;
const codemirrorHistory = null;

/*Compilation index*/
const tokenIndex = 0;
let nEnters = 0;
let pc = 4; //PRUEBA
export let align;

/*Instructions memory address*/
export let address;
/*Data memory address*/
let data_address;
/*Stack memory address*/
let stack_address;
/*Backup memory address*/

/*Pending instructions and pending tags*/
let pending_instructions = [];
let pending_tags = [];
/*Global functions*/
let extern = [];
/*Error code messages*/
const compileError = {
    m0: function (ret) {
        return String(ret.token);
    },
    m1: function (ret) {
        return String("Repeated tag: " + ret.token);
    },
    m2: function (ret) {
        return "Instruction '" + ret.token + "' not found"
    },
    m3: function (ret) {
        return "Incorrect instruction syntax for '" + ret.token + "'"
    },
    m4: function (ret) {
        return "Register '" + ret.token + "' not found"
    },
    m5: function (ret) {
        return "Immediate number '" + ret.token + "' is too big"
    },
    m6: function (ret) {
        return "Immediate number '" + ret.token + "' is not valid"
    },
    m7: function (ret) {
        return "Tag '" + ret.token + "' is not valid"
    },
    m8: function (ret) {
        return "Address '" + ret.token + "' is too big"
    },
    m9: function (ret) {
        return "Address '" + ret.token + "' is not valid"
    },
    m10: function (ret) {
        return (
            ".space value out of range (" +
            ret.token +
            " is greater than 50MiB)"
        );
    },
    m11: function (ret) {
        return "The space directive value should be positive and greater than zero"
    },
    m12: function (ret) {
        return String(
            "This field is too small to encode in binary '" + ret.token,
        );
    },
    m13: function (ret) {
        return String("Incorrect pseudoinstruction definition " + ret.token);
    },
    m14: function (ret) {
        return String("Invalid directive: " + ret.token);
    },
    m15: function (ret) {
        return "Invalid value '" + ret.token + "' as number."
    },
    m16: function (ret) {
        return String('The string of characters must start with "' + ret.token);
    },
    m17: function (ret) {
        return String('The string of characters must end with "' + ret.token);
    },
    m18: function (ret) {
        return "Number '" + ret.token + "' is too big"
    },
    m19: function (ret) {
        return "Number '" + ret.token + "' is empty"
    },
    //'m20': function(ret) { return "The text segment should start with '"       + ret.token + "'" },
    m21: function (ret) {
        return String("The data must be aligned" + ret.token);
    },
    m22: function (ret) {
        return "The number should be positive '" + ret.token + "'"
    },
    m23: function (ret) {
        return String("Empty directive" + ret.token);
    },
    m24: function (ret) {
        return String("After the comma you should go a blank --> " + ret.token);
    },
    //'m25': function(ret) { return "Incorrect syntax "                          + ret.token + "" },
    m26: function (ret) {
        return String("Syntax error near line: " + ret.token);
    },
    m27: function (ret) {
        return "Please check instruction syntax, inmediate ranges, register name, etc."
    },
}
/*Promise*/
let promise
/*Simulator*/
/*Displayed notifications*/
const notifications = [];
/*Available examples*/
export const example_set_available = [];
export const example_available = [];
/*Instructions memory*/
export let instructions = [];
let instructions_tag = [];
export let tag_instructions = {};
let instructions_binary = [];
/*Data memory*/
let data = [];
export let data_tag = [];
/*Binary*/

const load_binary = false;
let token;

export function setInstructions(instructions_) {
    instructions = instructions_;
}

//
// Compiler
//
/*Compile assembly code*/
function packCompileError(err_code, err_token, err_ti, err_bgcolor) {
    const ret = {};

    ret.status = "error"
    ret.errorcode = err_code
    ret.token = err_token
    ret.type = err_ti
    ret.bgcolor = err_bgcolor
    ret.tokenIndex = tokenIndex
    ret.line = nEnters

    // generic error
    if (typeof err_token === "undefined") {
        err_code = "m27";
        ret.token = "";
    }

    ret.msg = compileError[err_code](ret)

    /*Google Analytics*/
    creator_ga("compile", "compile.error", "compile.error." + ret.msg);
    creator_ga(
        "compile",
        "compile.type_error",
        "compile.type_error." + err_code,
    );

    return ret
}

/*Compile assembly code*/
// eslint-disable-next-line max-lines-per-function
export function assembly_compiler(library, color) {

    /* Google Analytics */
    creator_ga("compile", "compile.assembly")

    instructions = [];
    tag_instructions = {};
    data_tag = [];
    creator_memory_clear();
    extern = [];
    data = [];
    status.execution_init = 1;

    let library_offset = 0;
    const library_instructions = update_binary.instructions_binary?.length ?? 0;
    for (var i = 0; i < library_instructions; i++) {
        const instruction = update_binary.instructions_binary[i];
        instruction.hide = !(i === 0 || instruction.globl === true);
        if (instruction.globl !== true) {
            instruction.Label = "";
        }
        instructions.push(instruction);
        library_offset =
            parseInt(instruction.Address, 16) +
            Math.ceil(instruction.loaded.length / 8);
    }

    // Convert the library labels to the format used by the compiler,
    // filtering out non-global labels
    const library_labels =
        update_binary.instructions_tag
            ?.filter(x => x.globl)
            .reduce((tbl, x) => {
                tbl[x.tag] = x.addr;
                return tbl;
            }, {}) ?? {};
    const labels_json = JSON.stringify(library_labels);

    /*Allocation of memory addresses*/
    architecture.memory_layout[4].value = backup_stack_address
    architecture.memory_layout[3].value = backup_data_address
    data_address = parseInt(architecture.memory_layout[2].value)
    stack_address = parseInt(architecture.memory_layout[4].value)

    for (var i = 0; i < REGISTERS.length; i++) {
        for (var j = 0; j < REGISTERS[i].elements.length; j++) {
            if (
                REGISTERS[i].elements[j].properties.includes("program_counter")
            ) {
                REGISTERS[i].elements[j].value = bi_intToBigInt(
                    library_offset,
                    10,
                );
                REGISTERS[i].elements[j].default_value = bi_intToBigInt(
                    library_offset,
                    10,
                );
            }
            if (REGISTERS[i].elements[j].properties.includes("stack_pointer")) {
                REGISTERS[i].elements[j].value = bi_intToBigInt(
                    stack_address,
                    10,
                );
                REGISTERS[i].elements[j].default_value = bi_intToBigInt(
                    stack_address,
                    10,
                );
            }
        }
    }

    /*REGISTERS[1].elements[29].value = bi_intToBigInt(stack_address,10) ;
        REGISTERS[0].elements[0].value  = bi_intToBigInt(address,10) ;
        REGISTERS[1].elements[29].default_value = bi_intToBigInt(stack_address,10) ;
        REGISTERS[0].elements[0].default_value  = bi_intToBigInt(address,10) ;*/

    /*Reset stats*/
    status.totalStats = 0;
    for (var i = 0; i < stats.length; i++) {
        stats[i].percentage = 0;
        stats[i].number_instructions = 0;
        stats_value[i] = 0;
    }

    // Compile code
    let label_table;
    try {
        // Verify an architecture has been loaded
        if (arch === undefined || arch === null) {
            return {
                errorcode: "100",
                token: "Please load an architecture before compiling",
                type: "warning",
                bgcolor: "danger",
                status: "error",
            };
        }
        // Compile assembly
        const compiled = arch.compile(
            code_assembly,
            library_offset,
            labels_json,
            library ?? false,
            color,
        );
        // Extract instructions
        instructions.push(
            ...compiled.instructions.map(x => ({
                Address: x.address,
                Label: x.labels[0] ?? "",
                loaded: x.loaded,
                binary: x.binary,
                user: x.user,
                _rowVariant: "",
                Break: null,
                hide: false,
                visible: true,
            })),
        );
        // Extract binary instructions for library
        instructions_binary = instructions.map((x, idx) => ({
            Address: x.Address,
            Label: x.Label,
            Break: null,
            _rowVariant: "",
            // Newly compiled instructions have their binary encoding in the
            // `binary` field, but instructions from the library store it in
            // the `loaded` field. Read the corresponding field depending on
            // where the instruction comes from, knowing that the first
            // `library_instructions` instructions come from the library
            loaded: idx < library_instructions ? x.loaded : x.binary,
            visible: false,
            user: null,
        }));
        // Extract label table for library
        label_table = compiled.label_table.reduce((tbl, x) => {
            tbl[x.name] = { address: x.address, global: x.global };
            return tbl;
        }, {});
        // Extract data elements and load them on memory
        const data_mem = compiled.data;
        for (var i = 0; i < data_mem.length; i++) {
            let data = compiled.data[i];
            const size = Number(data.size());
            const addr = Number(data.address());
            switch (data.data_category()) {
                case DataCategoryJS.Number:
                    creator_memory_data_compiler(
                        addr,
                        data.value(false),
                        size,
                        data.labels()[0],
                        data.value(true),
                        data.type(),
                        true,
                    );
                    break;
                case DataCategoryJS.String:
                    creator_memory_storestring(
                        data.value(false),
                        size,
                        addr,
                        data.labels()[0],
                        data.type(),
                        true,
                    );
                    break;
                case DataCategoryJS.Space:
                    creator_memory_storestring(
                        size,
                        size,
                        addr,
                        data.labels()[0],
                        data.type(),
                        true,
                    );
                    break;
                case DataCategoryJS.Padding:
                    main_memory_zerofill(addr, size);
                    break;
            }
        }
        // Catch any errors thrown by the compiler
    } catch (error) {
        return {
            errorcode: "101",
            type: "error",
            bgcolor: "danger",
            status: "error",
            msg: error,
        };
    }

    /* Enter the binary in the text segment */
    for (const instruction of update_binary.instructions_binary ?? []) {
        const hex = bin2hex(instruction.loaded);
        const auxAddr = parseInt(instruction.Address, 16);
        const label = instruction.Label;
        const hide = instruction.hide;

        creator_insert_instruction(
            auxAddr,
            "********",
            "********",
            hide,
            hex,
            "**",
            label,
            true,
        );
    }

    /* Enter the compilated instructions in the text segment */
    for (var i = library_instructions; i < instructions.length; i++) {
        const instruction = instructions[i];
        const hex = bin2hex(instruction.binary);
        const auxAddr = parseInt(instruction.Address, 16);
        const label = instruction.Label;
        creator_insert_instruction(
            auxAddr,
            instruction.loaded,
            instruction.loaded,
            false,
            hex,
            "00",
            label,
            true,
        );
    }

    /*Save binary*/
    for (const instruction of instructions_binary) {
        if (instruction.Label != "") {
            if (label_table[instruction.Label].global === true) {
                instruction.globl = true;
            } else {
                instruction.Label = "";
            }
        }
    }

    /*Save tags*/
    // Filter out non-global labels
    instructions_tag = Object.entries(label_table)
        .filter(x => x[1].global)
        .map(x => ({
            tag: x[0],
            addr: Number(x[1].address),
            globl: x[1].global,
        }));

    if (typeof document !== "undefined") document.app.$data.instructions = instructions

    /* Initialize stack */
    writeMemory("00", parseInt(stack_address), "word")

    address = parseInt(architecture.memory_layout[0].value)
    data_address = parseInt(architecture.memory_layout[2].value)
    stack_address = parseInt(architecture.memory_layout[4].value)

    // save current value as default values for reset()...
    creator_memory_prereset();
    return {
        errorcode: "",
        token: "",
        type: "",
        update: "",
        status: "ok",
    }
}