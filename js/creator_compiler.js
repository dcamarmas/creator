
/*
 *  Copyright 2018-2025 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos
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

/*Architecture editor*/

/*Available architectures*/
var architecture_available = [];
/*New architectures*/
var load_architectures_available = [];
var load_architectures = [];
/*Architectures card background*/
var back_card = [];
/*Load architecture*/
var architecture_hash = [];
var architecture = {arch_conf:[], memory_layout:[], components:[], instructions:[], directives:[]};
var architecture_json = ""






/*Compilator*/

/*Codemirror*/
var textarea_assembly_editor;
var codemirrorHistory = null;
/*Assembly code textarea*/
var code_assembly = '';
/*Text memory address*/
var address;
/*Data memory address*/
var data_address;
/*Stack memory address*/
var stack_address;
/*Backup memory address*/
var backup_stack_address;
var backup_data_address;
/*Global functions*/
var extern = [];
/*Promise*/
let promise;

// Architecture loaded
/** @type {import("../compiler-pkg/web/creator_compiler.d.ts").ArchitectureJS}*/
let arch;


/*Simulator*/

/*Displayed notifications*/
var notifications = [];
/*Available examples*/
var example_set_available = [];
var example_available = [];
/*Instructions memory*/
var instructions = [];
var instructions_tag = [];
var addr_label = {};
var instructions_binary = [];
/*Data memory*/
var data = [];
/*Binary*/
var code_binary = '';
var update_binary = '';
var load_binary = false;
const align = 1;
let color;

//
// Load architecture
//


// Load architecture

function load_arch_select ( cfg ) //TODO: repeated?
{
      var ret = {
                  errorcode: "",
                  token: "",
                  type: "",
                  update: "",
                  status: "ok"
                } ;

      var auxArchitecture = cfg;
      architecture = register_value_deserialize(auxArchitecture);

      architecture_hash = [];
      for (var i = 0; i < architecture.components.length; i++) {
           architecture_hash.push({name: architecture.components[i].name, index: i});
      }

      backup_stack_address = architecture.memory_layout[4].value;
      backup_data_address  = architecture.memory_layout[3].value;

      ret.token = "The selected architecture has been loaded correctly";
      ret.type  = "success";
      return ret;
}


//
// Compiler
//

/** Compile assembly code
/* @param {?bool} library Whether to compile the code as a library */
function assembly_compiler(library)
{
        /* Google Analytics */
        creator_ga('compile', 'compile.assembly');
        
        instructions = [];
        creator_memory_clear() ;
        extern = [];
        data = [];
        execution_init = 1;

        // Convert the library labels to the format used by the compiler,
        // filtering out non-global labels
        const library_labels = update_binary.instructions_tag?.filter(x => x.globl).reduce(
            (tbl, x) => {
                tbl[x.tag] = x.addr;
                return tbl
            },
            {},
        ) ?? {};
        const labels_json = JSON.stringify(library_labels);


        const text_address = parseInt(architecture.memory_layout[0].value);
        let addr = text_address;
        const library_instructions = update_binary.instructions_binary?.length ?? 0;
        for(var i = 0; i < library_instructions; i++){
          const instruction = update_binary.instructions_binary[i];
          let label = instruction.Label;
          if (typeof(label) === "string") {
              label = label === ""? [] : [label];
          }
          // Remove non-global labels
          instruction.Label = label.filter(x => x in library_labels)
          instruction.hide = !(i === 0 || instruction.Label.length > 0);
          instructions.push(instruction);
          addr = parseInt(instruction.Address, 16) + Math.ceil(instruction.loaded.length / 8);
        }
        library_offset = addr - text_address;

        /*Allocation of memory addresses*/
        architecture.memory_layout[4].value = backup_stack_address;
        architecture.memory_layout[3].value = backup_data_address;
        data_address = parseInt(architecture.memory_layout[2].value);
        stack_address = parseInt(architecture.memory_layout[4].value);

        for (var i = 0; i < architecture.components.length; i++)
        {
          for (var j = 0; j < architecture.components[i].elements.length; j++)
          {
            if (architecture.components[i].elements[j].properties.includes("program_counter")) 
            {
              architecture.components[i].elements[j].value          = bi_intToBigInt(library_offset,10) ;
              architecture.components[i].elements[j].default_value  = bi_intToBigInt(library_offset,10) ;
            }
            if (architecture.components[i].elements[j].properties.includes("stack_pointer"))
            {
              architecture.components[i].elements[j].value         = bi_intToBigInt(stack_address,10) ;
              architecture.components[i].elements[j].default_value = bi_intToBigInt(stack_address,10) ;
            }
          }
        }

        /*architecture.components[1].elements[29].value = bi_intToBigInt(stack_address,10) ;
        architecture.components[0].elements[0].value  = bi_intToBigInt(address,10) ;
        architecture.components[1].elements[29].default_value = bi_intToBigInt(stack_address,10) ;
        architecture.components[0].elements[0].default_value  = bi_intToBigInt(address,10) ;*/

        /*Reset stats*/
        totalStats = 0;
        for (var i = 0; i < stats.length; i++){
          stats[i].percentage = 0;
          stats[i].number_instructions = 0;
          stats_value[i] = 0;
        }

        // Compile code
        let label_table = {};
        addr_label = {};
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
            const compiled = arch.compile(code_assembly, library_offset, labels_json, library ?? false, color)
            // Extract instructions
            instructions.push(...compiled.instructions.map(x => ({
                Address: x.address,
                Label: x.labels,
                loaded: x.loaded,
                binary: x.binary,
                user: x.user,
                _rowVariant: "",
                Break: null,
                hide: false,
                visible: true,
            })));
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
                loaded: idx < library_instructions? x.loaded : x.binary,
                visible: false,
                user: null,
            }));
            // Extract label table for library
            for (const label of compiled.label_table) {
                const name = label.name;
                const addr = label.address;
                const global = label.global;
                label_table[name] = { address: addr, global: global };
                addr_label[addr] ??= [];
                addr_label[addr].push(name);
            };
            // Extract data elements and load them on memory
            const data_mem = compiled.data;
            for (var i = 0; i < data_mem.length; i++) {
                let data = data_mem[i]
                const size = Number(data.size());
                const addr = Number(data.address());
                switch (data.data_category()) {
                    case wasm.DataCategoryJS.Number:
                        creator_memory_data_compiler(
                            addr,
                            data.value(false),
                            size,
                            data.labels(),
                            data.value(true),
                            data.type(),
                            true,
                        );
                        break;
                    case wasm.DataCategoryJS.String:
                        creator_memory_storestring(
                            data.value(false),
                            size, addr,
                            data.labels(),
                            data.type(),
                            true,
                        );
                        break;
                    case wasm.DataCategoryJS.Space:
                        creator_memory_storestring(
                            size, size, addr,
                            data.labels(),
                            data.type(),
                            true,
                        );
                        break;
                    case wasm.DataCategoryJS.Padding:
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
                msg: error
            };
        }

        /* Enter the binary in the text segment */
        for (const instruction of update_binary.instructions_binary ?? [])
        {
          const hex     = bin2hex(instruction.loaded);
          const auxAddr = parseInt(instruction.Address, 16);
          const label   = instruction.Label;
          const hide    = instruction.hide;
          creator_insert_instruction(auxAddr, "********", "********", hide, hex, "**", label, true);
        }

        /* Enter the compilated instructions in the text segment */
        for (var i = library_instructions; i < instructions.length; i++) {
          const instruction = instructions[i];
          const hex = bin2hex(instruction.binary);
          const auxAddr = parseInt(instruction.Address, 16);
          const label = instruction.Label;
          creator_insert_instruction(auxAddr, instruction.loaded, instruction.loaded, false, hex, "00", label, true);
        }

        /*Save binary*/
        for (const instruction of instructions_binary) {
            instruction.Label = instruction.Label.filter(x => label_table[x].global === true)
        }

        /*Save tags*/
        // Filter out non-global labels
        instructions_tag = Object.entries(label_table).filter(x => x[1].global).map(x => ({
            tag: x[0],
            addr: Number(x[1].address),
            globl: x[1].global,
        }))

        if (typeof app != "undefined")
            app._data.instructions = instructions;

        /* Initialize stack */
        writeMemory("00", parseInt(stack_address), "word") ;

        address = parseInt(architecture.memory_layout[0].value);
        data_address = parseInt(architecture.memory_layout[2].value);
        stack_address = parseInt(architecture.memory_layout[4].value);

  // save current value as default values for reset()...
        creator_memory_prereset() ;
        return {
            errorcode: "",
            token: "",
            type: "",
            update: "",
            status: "ok",
        };
}

function binaryStringToInt( b ) {
    return parseInt(b, 2);
}
