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

import { initCAPI } from "./capi/initCAPI.mjs";

import {
    bi_BigIntTofloat,
    bi_BigIntTodouble,
    register_value_deserialize,
} from "./utils/bigint.mjs";
import { float2bin, double2bin, bin2hex, hex2double } from "./utils/utils.mjs";

import { logger } from "./utils/creator_logger.mjs";
import { assembly_compiler, instructions } from "./compiler/compiler.mjs";
import { executeProgramOneShot } from "./executor/executor.mjs";
import {
    main_memory_get_addresses,
    main_memory_read_value,
    main_memory_read_default_value,
    main_memory,
} from "./memory/memoryCore.mjs";
import * as wasm from "./compiler/deno/creator_compiler.js";

export let code_assembly = "";
export let update_binary = "";
export let backup_stack_address;
export let backup_data_address;

export let architecture_hash = [];
export let architecture = {
    arch_conf: [],
    memory_layout: [],
    components: [],
    instructions: [],
    directives: [],
};

export let app;
const word_size_bits = 32; // TODO: load from architecture
export const word_size_bytes = word_size_bits / 8; // TODO: load from architecture
export const register_size_bits = 32;

export const status = {
    execution_init: 1,
    totalStats: 0,
    run_program: 0,
    keyboard: "",
    display: "",
    execution_index: 0,
    virtual_PC: 0n, // This is the PC the instructions see.
    error: 0,
};

export const stats_value = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
export const stats = [
    {
        type: "Arithmetic floating point",
        number_instructions: 0,
        percentage: 0,
    },
    { type: "Arithmetic integer", number_instructions: 0, percentage: 0 },
    { type: "Comparison", number_instructions: 0, percentage: 0 },
    { type: "Conditional bifurcation", number_instructions: 0, percentage: 0 },
    { type: "Control", number_instructions: 0, percentage: 0 },
    { type: "Function call", number_instructions: 0, percentage: 0 },
    { type: "I/O", number_instructions: 0, percentage: 0 },
    {
        type: "Logic",
        number_instructions: 0,
        percentage: 0,
        abbreviation: "Log",
    },
    { type: "Memory access", number_instructions: 0, percentage: 0 },
    { type: "Other", number_instructions: 0, percentage: 0 },
    { type: "Syscall", number_instructions: 0, percentage: 0 },
    {
        type: "Transfer between registers",
        number_instructions: 0,
        percentage: 0,
    },
    {
        type: "Unconditional bifurcation",
        number_instructions: 0,
        percentage: 0,
    },
];

export let arch;

// TODO: Make sure these variables are all needed
// let architecture_available = []
// let load_architectures_available = []
// let load_architectures = []
// let back_card = []
// let memory_hash = ['data_memory', 'instructions_memory', 'stack_memory']
// let execution_mode = 0 // 0: instruction by instruction, 1: run program
// let instructions_packed = 100
// let architecture_json = ''

let code_binary = "";

const CAPI = initCAPI();
let creator_debug = false;

export function set_debug(enable_debug) {
    creator_debug = enable_debug;
    if (creator_debug) {
        logger.enable();
        logger.setLevel("DEBUG");
    } else {
        logger.disable();
    }
}

// load components
export function load_arch_select(cfg) {
    const ret = {
        errorcode: "",
        token: "",
        type: "",
        update: "",
        status: "ok",
    };

    const auxArchitecture = cfg;
    architecture = register_value_deserialize(auxArchitecture);

    architecture_hash = [];
    for (let i = 0; i < architecture.components.length; i++) {
        architecture_hash.push({
            name: architecture.components[i].name,
            index: i,
        });
    }

    backup_stack_address = architecture.memory_layout[4].value;
    backup_data_address = architecture.memory_layout[3].value;

    ret.token = "The selected architecture has been loaded correctly";
    ret.type = "success";
    return ret;
}

export function load_architecture(arch_str) {
    arch = wasm.ArchitectureJS.from_json(arch_str);
    const arch_obj = JSON.parse(arch_str);
    const ret = load_arch_select(arch_obj);

    return ret;
}

export function load_library(lib_str) {
    const ret = {
        status: "ok",
        msg: "",
    };

    code_binary = lib_str;
    update_binary = JSON.parse(code_binary);

    return ret;
}

// compilation

export function assembly_compile(code, enable_color) {
    let ret = {};

    code_assembly = code;
    let color = enable_color ? wasm.Color.ANSI : wasm.Color.NoColor;
    ret = assembly_compiler(false, color);
    switch (ret.status) {
        case "error":
            break;

        case "warning":
            ret.msg = "warning: " + ret.token;
            break;

        case "ok":
            ret.msg = "Compilation completed successfully";
            break;

        default:
            ret.msg = "Unknow assembly compiler code :-/";
            break;
    }

    return ret;
}

// execution

export function execute_program(limit_n_instructions) {
    let ret;
    ret = executeProgramOneShot(limit_n_instructions);
    if (ret.error === true) {
        ret.status = "ko";
        return ret;
    }

    ret.status = "ok";
    return ret;
}

// state management

// eslint-disable-next-line max-lines-per-function
export function get_state() {
    const ret = {
        status: "ok",
        msg: "",
    };

    let c_name;
    let e_name;
    let elto_value;
    let elto_dvalue;
    let elto_string;

    // dump registers
    for (let i = 0; i < architecture.components.length; i++) {
        c_name = architecture.components[i].name;
        if (typeof c_name === "undefined") {
            return ret;
        }
        c_name = c_name
            .split(" ")
            .map(i => i.charAt(0))
            .join("")
            .toLowerCase();

        for (let j = 0; j < architecture.components[i].elements.length; j++) {
            // get value
            e_name = architecture.components[i].elements[j].name;
            elto_value = architecture.components[i].elements[j].value;

            //get default value
            if (
                architecture.components[i].double_precision === true &&
                architecture.components[i].double_precision_type == "linked"
            ) {
                let aux_value;
                let aux_sim1;
                let aux_sim2;

                for (let a = 0; a < architecture_hash.length; a++) {
                    for (
                        let b = 0;
                        b < architecture.components[a].elements.length;
                        b++
                    ) {
                        if (
                            architecture.components[a].elements[b].name ==
                            architecture.components[i].elements[j].simple_reg[0]
                        ) {
                            aux_sim1 = bin2hex(
                                float2bin(
                                    bi_BigIntTofloat(
                                        architecture.components[a].elements[b]
                                            .default_value,
                                    ),
                                ),
                            );
                        }
                        if (
                            architecture.components[a].elements[b].name ==
                            architecture.components[i].elements[j].simple_reg[1]
                        ) {
                            aux_sim2 = bin2hex(
                                float2bin(
                                    bi_BigIntTofloat(
                                        architecture.components[a].elements[b]
                                            .default_value,
                                    ),
                                ),
                            );
                        }
                    }
                }

                aux_value = aux_sim1 + aux_sim2;
                elto_dvalue = hex2double("0x" + aux_value);
            } else {
                elto_dvalue =
                    architecture.components[i].elements[j].default_value;
            }

            // skip default results
            if (typeof elto_dvalue === "undefined") {
                continue;
            }
            if (elto_value == elto_dvalue) {
                continue;
            }

            // value != default value => dumpt it
            elto_string = "0x" + elto_value.toString(16);
            if (architecture.components[i].type == "fp_registers") {
                if (architecture.components[i].double_precision === false) {
                    elto_string =
                        "0x" + bin2hex(float2bin(bi_BigIntTofloat(elto_value)));
                }
                if (architecture.components[i].double_precision === true) {
                    elto_string =
                        "0x" +
                        bin2hex(double2bin(bi_BigIntTodouble(elto_value)));
                }
            }

            ret.msg =
                ret.msg + c_name + "[" + e_name + "]:" + elto_string + "; ";
        }
    }

    // dump memory
    const addrs = main_memory_get_addresses();
    for (let i = 0; i < addrs.length; i++) {
        if (addrs[i] >= parseInt(architecture.memory_layout[3].value)) {
            continue;
        }

        elto_value = main_memory_read_value(addrs[i]);
        elto_dvalue = main_memory_read_default_value(addrs[i]);

        if (elto_value != elto_dvalue) {
            const addr_string = "0x" + parseInt(addrs[i]).toString(16);
            elto_string = "0x" + elto_value;
            ret.msg =
                ret.msg +
                "memory[" +
                addr_string +
                "]" +
                ":" +
                elto_string +
                "; ";
        }
    }

    // dump keyboard
    ret.msg =
        ret.msg +
        "keyboard[0x0]" +
        ":'" +
        encodeURIComponent(status.keyboard) +
        "'; ";

    // dump display
    ret.msg =
        ret.msg +
        "display[0x0]" +
        ":'" +
        encodeURIComponent(status.display) +
        "'; ";

    return ret;
}

export function compare_states(ref_state, alt_state) {
    const ret = {
        status: "ok",
        msg: "",
    };

    const ref_state_arr = ref_state
        .split("\n")
        .map(function (s) {
            return s.replace(/^\s*|\s*$/g, "");
        })
        .filter(function (x) {
            return x;
        });
    if (ref_state_arr.length > 0)
        ref_state = ref_state_arr[ref_state_arr.length - 1];
    else ref_state = "";

    const alt_state_arr = alt_state
        .split("\n")
        .map(function (s) {
            return s.replace(/^\s*|\s*$/g, "");
        })
        .filter(function (x) {
            return x;
        });
    if (alt_state_arr.length > 0)
        alt_state = alt_state_arr[alt_state_arr.length - 1];
    else alt_state = "";

    // 1) check equals
    if (ref_state == alt_state) {
        //ret.msg = "Equals" ;
        return ret;
    }

    // 2) check m_alt included within m_ref
    const m_ref = {};
    if (ref_state.includes(";")) {
        ref_state.split(";").map(function (i) {
            const parts = i.split(":");
            if (parts.length !== 2) {
                return;
            }

            m_ref[parts[0].trim()] = parts[1].trim();
        });
    }

    const m_alt = {};
    if (alt_state.includes(";")) {
        alt_state.split(";").map(function (i) {
            const parts = i.split(":");
            if (parts.length != 2) {
                return;
            }

            m_alt[parts[0].trim()] = parts[1].trim();
        });
    }

    ret.msg = "Different: ";
    for (const elto in m_ref) {
        if (m_alt[elto] != m_ref[elto]) {
            if (typeof m_alt[elto] === "undefined")
                ret.msg += elto + "=" + m_ref[elto] + " is not available. ";
            else
                ret.msg +=
                    elto + "=" + m_ref[elto] + " is =" + m_alt[elto] + ". ";

            ret.status = "ko";
        }
    }

    // last) is different...
    if (ret.status != "ko") {
        ret.msg = "";
    }

    return ret;
}

// help

export function help_instructions() {
    let o = "";
    let m;

    // describe instructions
    o += "name;\t\tsignature;\t\twords;\t\ttype\n";
    for (let i = 0; i < architecture.instructions.length; i++) {
        m = architecture.instructions[i];

        o += m.name + ";\t" + (m.name.length < 7 ? "\t" : "");
        o += m.signatureRaw + ";\t" + (m.signatureRaw.length < 15 ? "\t" : "");
        o += m.nwords + ";\t" + (m.nwords.length < 7 ? "\t" : "");
        o += m.type + "\n";
    }

    return o;
}

export function help_pseudoins() {
    let o = "";
    let m;

    // describe pseudoinstructions
    o += "name;\t\tsignature;\t\twords\n";
    for (let i = 0; i < architecture.pseudoinstructions.length; i++) {
        m = architecture.pseudoinstructions[i];

        o += m.name + ";\t" + (m.name.length < 7 ? "\t" : "");
        o += m.signatureRaw + ";\t" + (m.signatureRaw.length < 15 ? "\t" : "");
        o += m.nwords + "\n";
    }

    return o;
}

// memory dump for debugging
export function dumpMemory(startAddr, numBytes, bytesPerRow = 16) {
    startAddr = BigInt(startAddr);
    numBytes = BigInt(numBytes);
    bytesPerRow = BigInt(bytesPerRow);

    let output = "";
    let currentAddr = startAddr;
    const endAddr = startAddr + numBytes;

    // Create header
    output += "       ";
    for (let i = 0n; i < bytesPerRow; i++) {
        output += " " + i.toString(16).padStart(2, "0");
    }
    output += "  | ASCII\n";
    output +=
        "-------" +
        "-".repeat(Number(bytesPerRow) * 3) +
        "---" +
        "-".repeat(Number(bytesPerRow)) +
        "\n";

    // Create rows
    while (currentAddr < endAddr) {
        // Address column
        output += "0x" + currentAddr.toString(16).padStart(4, "0") + ": ";

        let hexValues = "";
        let asciiValues = "";

        // Process bytes for this row
        for (let i = 0n; i < bytesPerRow; i++) {
            if (currentAddr + i < endAddr) {
                const byteValue = main_memory_read_value(currentAddr + i);
                hexValues += byteValue + " ";

                // Try to convert to ASCII, use dot for non-printable chars
                const charCode = parseInt(byteValue, 16);
                if (charCode >= 32 && charCode <= 126) {
                    // Printable ASCII range
                    asciiValues += String.fromCharCode(charCode);
                } else {
                    asciiValues += ".";
                }
            } else {
                // Padding for incomplete row
                hexValues += "   ";
                asciiValues += " ";
            }
        }

        output += hexValues + "| " + asciiValues + "\n";
        currentAddr += bytesPerRow;
    }

    return output;
}

export function load_binary_file(bin_str) {
    const ret = {
        status: "ok",
        msg: "",
    };

    try {
        // Parse binary JSON
        const binary_data = JSON.parse(bin_str);

        // Load instructions_binary directly into instructions
        instructions.length = 0; // Clear existing instructions

        // Copy instructions from binary
        if (
            binary_data.instructions_binary &&
            Array.isArray(binary_data.instructions_binary)
        ) {
            for (let i = 0; i < binary_data.instructions_binary.length; i++) {
                instructions.push(binary_data.instructions_binary[i]);
            }
            logger.info(
                `Loaded ${instructions.length} instructions from binary`,
            );
        } else {
            logger.warning("No instructions found in binary file");
        }

        // Load instructions_tag if available
        if (
            binary_data.instructions_tag &&
            Array.isArray(binary_data.instructions_tag)
        ) {
            // Clear existing tags and create new ones from binary data
            // This would typically be handled by the compiler but we're bypassing it
            logger.info(
                `Loaded ${binary_data.instructions_tag.length} instruction tags`,
            );
        }

        // Load instructions into memory
        for (let i = 0; i < instructions.length; i++) {
            const instruction = instructions[i];
            const addr = BigInt(parseInt(instruction.Address, 16));

            // Convert binary instruction to hex bytes
            const binInstruction = instruction.loaded;
            const hexBytes = [];

            // Process 8 bits at a time to generate hex bytes
            for (let j = 0; j < binInstruction.length; j += 8) {
                const byte = binInstruction.substr(j, 8);
                const hexByte = parseInt(byte, 2).toString(16).padStart(2, "0");
                hexBytes.push(hexByte);
            }

            // Add instruction bytes to memory (little endian)
            for (let j = 0; j < hexBytes.length; j++) {
                const byteAddr = addr + BigInt(j);

                // Create memory entry for this byte
                main_memory[byteAddr] = {
                    addr: byteAddr,
                    bin: hexBytes[j],
                    break: false,
                    data_type: {
                        address: byteAddr,
                        value: "00",
                        default: "00",
                        type: "instruction",
                        size: 0,
                    },
                    def_bin: hexBytes[j],
                    reset: true,
                    tag: instruction.Label || "",
                };
            }
        }

        // Load data section into memory
        if (
            binary_data.data_section &&
            Array.isArray(binary_data.data_section)
        ) {
            for (let i = 0; i < binary_data.data_section.length; i++) {
                const data_item = binary_data.data_section[i];
                const base_addr = BigInt(parseInt(data_item.Address, 16));
                const size = data_item.Size;
                const hex_value = data_item.Value;

                // Split hex value into bytes
                for (let j = 0; j < hex_value.length; j += 2) {
                    if (j / 2 >= size) break;

                    const byteAddr = base_addr + BigInt(j / 2);
                    const hexByte = hex_value.substr(j, 2);

                    // Create memory entry for this byte
                    main_memory[byteAddr] = {
                        addr: byteAddr,
                        bin: hexByte,
                        break: false,
                        data_type: {
                            address: byteAddr,
                            value: "00",
                            default: "00",
                            type: data_item.Type || "unknown",
                            size: 0,
                        },
                        def_bin: hexByte,
                        reset: true,
                        tag: j === 0 ? data_item.Label || "" : "",
                    };
                }
            }
            logger.info(`Loaded ${binary_data.data_section.length} data items`);
        } else {
            logger.warning("No data section found in binary file");
        }

        ret.msg = "Binary file loaded successfully";
    } catch (e) {
        ret.status = "ko";
        ret.msg = "Error loading binary file: " + e.message;
        logger.error("Binary load error: " + e.message);
    }

    return ret;
}
