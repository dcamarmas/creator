// Part of monaco editor to allow user create multiple file to edit in assembly
import { as } from "@/core/assembler/sailAssembler/web/CNAssambler.mjs";
import { ref } from "vue"; 
import dump64Module, { libtags64 } from "@/core/assembler/sailAssembler/web/wasm/objdump64.js"
import dump32Module, { libtags32 } from "@/core/assembler/sailAssembler/web/wasm/objdump.js"
import { architecture } from "@/core/core.mjs";

export var tabs = ref([]);
export var assembly_files = ref([]);
export var tabCounter = 0;
export var tabskey = -1;
export var currentTab = -1;
let libdump = null;

export function createFile(storecode = "", filename ="", newcode = "" ) {

    var filename_prompt;
    if (filename === "") {
        filename_prompt = prompt("Name of new File");
        if (filename_prompt  === "" || filename_prompt === null)
            return "";
    }
    else 
        filename_prompt = filename;
    filename_prompt = filename_prompt.replaceAll(" ", "");
    if (!filename_prompt.endsWith(".s"))
        filename_prompt = filename_prompt + ".s";
    let i = assembly_files.value.findIndex(file => file.filename === filename_prompt);
    // First "close" current file editing
    let j = assembly_files.value.findIndex(file => file.editing_now === true);
    if (j !== -1){

        assembly_files.value[j].code = storecode;
        assembly_files.value[j].editing_now = false;
    }
    if (i === -1) { // There is any file with this filename
        // Create new file
        let newFile = {
            filename: filename_prompt,
            code: (newcode === "") ? ".section .data\n\n# Declare your data to use here\n\n.section .bss\n.align 8\ntohost:\t.dword 0\n\n.section .text.init\n.globl _main\n\n# Complete your main function here\n_main:" : newcode,
            to_compile: true,
            editing_now: true,
            id: assembly_files.value.length
        };
        assembly_files.value.push(newFile);
        console.log(assembly_files.value);
        currentTab = assembly_files.value.length - 1; 
        // tabCounter++;
        return newFile.code;
    }else {
        assembly_files.value[i].editing_now = true;
        assembly_files.value[i].to_compile = true;
        currentTab = assembly_files.value[i].id;
        return assembly_files.value[i].code;
    }
}   

export function showFileEditor(filename, code) {
    let i = assembly_files.value.findIndex(file => file.editing_now === true);
    if (i !== -1) {
        assembly_files.value[i].code = code;
        assembly_files.value[i].editing_now = false;
    }
    let j = assembly_files.value.findIndex( file => file.filename === filename);
    assembly_files.value[j].editing_now = true;
    currentTab = assembly_files.value[j].id;
    return assembly_files.value[j].code;
}

export function switchApplyFile(filename) {
    let i = assembly_files.value.findIndex(file => file.filename === filename);
    assembly_files.value[i].to_compile = !assembly_files.value[i].to_compile;
}

export function DeleteFile(filename) {
    let i = assembly_files.value.findIndex(file => file.filename === filename);
    if (i !== -1) {
        // remove element from assembly_files
        assembly_files.value.splice(i, 1);

        // refresh assembly_files id
        for (let j = 0; j < assembly_files.value.length; j++){
            assembly_files.value[j].id = j;
        }

        // open an existent file
        if (assembly_files.value.length !== 0){
            currentTab = assembly_files.value[assembly_files.value.length - 1].id;
            assembly_files.value[assembly_files.value.length - 1].editing_now = true;
        } else 
            currentTab = -1;
    }
}

export async function disassemble_lib(lib) {
    let depsLeft = Infinity;
    if (architecture.config.name === "SRV32"){
        libdump = await dump32Module({
          monitorRunDependencies(left) {
           depsLeft = left;    
          console.log('[dump32] deps pendientes:', left);
          },
        });
    } else {
        libdump = await dump64Module({
          monitorRunDependencies(left) {
           depsLeft = left;    
          console.log('[dump32] deps pendientes:', left);
          },
        });
    }

    await new Promise((resolve) => {
        const check = () => {
        if (depsLeft === 0) resolve();
        else setTimeout(check, 10);
        };
        check();
    });


    libdump.run([lib.library_file, "-D", lib.name]);
    console.log(libtags64);
    console.log(libtags32);

}
