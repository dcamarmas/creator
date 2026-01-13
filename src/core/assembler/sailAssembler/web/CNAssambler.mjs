
/* For 32 bits architecture */
import as32Module from "./wasm/as-new.js"
import wasmUrl from "./wasm/as-new.wasm?url";
import ld32Module from "./wasm/ld-new.js"
import dump32Module from "./wasm/objdump.js"
import { /*entry_elf,*/ dumpdatainstructions32, dumptextinstructions32, dumplabels32, sectionasm32, inside_label32 } from "./wasm/objdump.js"
import { /*entry_elf,*/ dumpdatainstructions64, dumptextinstructions64, dumplabels64, sectionasm64, inside_label64 } from "./wasm/objdump64.js"
import { writeMultiByteValueAsWords, instructions, setInstructions, setAddress } from "../../assembler.mjs";
import as64Module from "./wasm/as-new64.js"
import ld64Module from "./wasm/ld-new64.js"
import dump64Module from "./wasm/objdump64.js"
import { vectorins, loadlinker} from "../CREATORNAssembler.mjs"
import { architecture, loadedLibrary, setPC } from "../../../core.mjs";
import { updateMainMemoryBackup, main_memory, WORDSIZE, BYTESIZE, backup_stack_address, backup_data_address } from "@/core/core.mjs";
import { show_notification } from "../../../../web/utils.mjs";
import { assembly_files } from "@/web/components/assembly/MultifileEditor.mjs";
// import { init } from "@/core/executor/executor.mjs";

let sailas, sailld, saildump = null;
export var libs_to_load = [];
var list_data_instructions = [];
var list_user_instructions = [];
var align = 1;
var stack_address = 0;
var ins_filter;
var extensions = [];
var filesToCompile = [];
export var outfile = null;
export var vectoren = false;
export var doubleen = false;

const locateFile = (path) => {
  // Cuando Emscripten pida el .wasm, dale la URL real
  if (path.endsWith('.wasm')) return wasmUrl;
  // Para cualquier otro asset (data, worker…), resuélvelo relativo a este JS
  return new URL(path, import.meta.url).href;
};

function identify_pseudo(instruction_assembly){
  const extensionid = ins_filter.findIndex(insn => instruction_assembly.includes(insn.opcode));
  if (extensionid !== -1) {
    if(extensions.findIndex(ext => (ins_filter[extensionid].type).includes(ext)) === -1)
      extensions.push(ins_filter[extensionid].type);
  }
  // console.log("architecture", architecture);
  if(instruction_assembly.search("li") != -1 && instruction_assembly.search("slli") === -1 && instruction_assembly.search("vsetvli") === -1 && !(instruction_assembly.includes(".section") || instruction_assembly.includes(".globl") || instruction_assembly.includes(".include") || instruction_assembly.includes(".init"))){
    list_user_instructions.push(instruction_assembly);
    let parts = instruction_assembly.split(',');
    if (!(-2048 >= parseInt(parts[1]?.trim(), 16)) && !(parseInt(parts[1]?.trim(), 16) <= 2047)){
      if (architecture.config.word_size !== 32) {
        list_user_instructions.push("");
      }
      list_user_instructions.push("");
    }else if(!(-2048 >= parseInt(parts[1]?.trim(), 10)) && !(parseInt(parts[1]?.trim(), 10) <= 2047)){
      if (architecture.config.word_size !== 32)
        list_user_instructions.push("");
      list_user_instructions.push("");
    }
  }
  else if (instruction_assembly.search("la") != -1 && !(instruction_assembly.includes(".section") || instruction_assembly.includes(".globl") || instruction_assembly.includes(".include") || instruction_assembly.includes(".init")))
    {
      list_user_instructions.push(instruction_assembly);
      list_user_instructions.push("");
    }
  else if (instruction_assembly.search("ecall") != -1 && !(instruction_assembly.includes(".section") || instruction_assembly.includes(".globl") || instruction_assembly.includes(".include") || instruction_assembly.includes(".init")))
    list_user_instructions.push(instruction_assembly);
  else if (instruction_assembly.search("call") != -1 && (/^call\t/.test(instruction_assembly)) && !(instruction_assembly.search("ecall") != -1) && !(instruction_assembly.includes(".section") || instruction_assembly.includes(".globl") || instruction_assembly.includes(".include") || instruction_assembly.includes(".init")))
  {
    list_user_instructions.push(instruction_assembly);
    if (architecture.config.word_size == 32)
      list_user_instructions.push("");
  }
  else if (instruction_assembly.search("lw") != -1 && !(instruction_assembly.includes(".section") || instruction_assembly.includes(".globl") || instruction_assembly.includes(".include") || instruction_assembly.includes(".init")))
    {
      list_user_instructions.push(instruction_assembly);
      let parts = instruction_assembly.split(',');
      if( isNaN(parts[1]?.trim()) && !(parts[1]?.trim()).includes("(") ){

        list_user_instructions.push("");
        return;
      }
    }
  else if(!(instruction_assembly.includes(".section") || instruction_assembly.includes(".globl") || instruction_assembly.includes(".include") || instruction_assembly.includes(".init")))
    list_user_instructions.push(instruction_assembly);

}

function process_data_to_store_memory32(){
  for (let i = 0; i < list_data_instructions.length; i++) {
    const dump_ins = dumpdatainstructions32.findIndex(insn => insn[4] === list_data_instructions[i].label)
    if (dumpdatainstructions32[dump_ins] !== undefined){
      dumpdatainstructions32[dump_ins].push(list_data_instructions[i].align);
      dumpdatainstructions32[dump_ins].push(list_data_instructions[i].type);

      if(list_data_instructions[i].type === "asciz" || list_data_instructions[i].type === "ascii"){
        if (dumpdatainstructions32[dump_ins][1].length % 2 !== 0) {
          console.warn("Dealineamiento de memoria en string.");
      }

      let bytes = dumpdatainstructions32[dump_ins][1].match(/.{1,2}/g);

      let reversedBytes = bytes.reverse().join('');


      if (reversedBytes.endsWith("00") && list_data_instructions[i].type === "ascii")
        reversedBytes = reversedBytes.slice(0, -2);

      dumpdatainstructions32[dump_ins][1] = reversedBytes.match(/.{1,2}/g)
          .map(byte => String.fromCharCode(parseInt(byte, 16)))
          .join('');
      }
      else if (list_data_instructions[i].type === "space" || list_data_instructions[i].type === "zero"){
        dumpdatainstructions32[dump_ins][1] = parseInt(list_data_instructions[i].value,10);
      }
    }
  }
}

function process_data_to_store_memory64(){
  for (let i = 0; i < list_data_instructions.length; i++) {
    const dump_ins = dumpdatainstructions64.findIndex(insn => insn[4] === list_data_instructions[i].label)
    if (dumpdatainstructions64[dump_ins] !== undefined){
      dumpdatainstructions64[dump_ins].push(list_data_instructions[i].align);
      dumpdatainstructions64[dump_ins].push(list_data_instructions[i].type);

      if(list_data_instructions[i].type === "asciz" || list_data_instructions[i].type === "ascii"){
        if (dumpdatainstructions64[dump_ins][1].length % 2 !== 0) {
          console.warn("Dealineamiento de memoria en string.");
      }

      let bytes = dumpdatainstructions64[dump_ins][1].match(/.{1,2}/g);

      let reversedBytes = bytes.reverse().join('');


      if (reversedBytes.endsWith("00") && list_data_instructions[i].type === "ascii")
        reversedBytes = reversedBytes.slice(0, -2);

      dumpdatainstructions64[dump_ins][1] = reversedBytes.match(/.{1,2}/g)
          .map(byte => String.fromCharCode(parseInt(byte, 16)))
          .join('');
      }
      else if (list_data_instructions[i].type === "space" || list_data_instructions[i].type === "zero"){
        dumpdatainstructions64[dump_ins][1] = parseInt(list_data_instructions[i].value,10);
      }
    }
  }
}

export function writeDataDumpMemory32(){
  for (let i = 0; i < dumpdatainstructions32.length; i++){

        switch(dumpdatainstructions32[i][6]){
        case "half":

          if(dumpdatainstructions32[i][1].length > 4){
              var init_add = parseInt(dumpdatainstructions32[i][0], 16);
              var elements = Math.floor(dumpdatainstructions32[i][1].length / 4);
              if(dumpdatainstructions32[i][1].length % 4 !== 0){
              elements = elements + 1;
              dumpdatainstructions32[i][1] = dumpdatainstructions32[i][1].padStart(elements*4,"0");
              }
              for (var j = 0; j < elements; j++){
              var element_to_insert = dumpdatainstructions32[i][1].slice(dumpdatainstructions32[i][1].length - (j * 2 + 2) * 2, dumpdatainstructions32[i][1].length - (4 * j));
              if (j === 0 )
                  main_memory.write(BigInt(init_add), Number("0x" + element_to_insert));
                  // creator_memory_data_compiler(init_add, element_to_insert, 2, dumpdatainstructions32[i][4], (parseInt(element_to_insert, 16) << 16) >> 16, dumpdatainstructions32[i][6],);
              else
                  main_memory.write(BigInt(init_add + j * 2), Number("0x" + element_to_insert));
                  // creator_memory_data_compiler(init_add + j*2, element_to_insert, 2, null, (parseInt(element_to_insert, 16) << 16) >> 16, dumpdatainstructions32[i][6],);

              }
          }else {
              main_memory.write(BigInt(parseInt(dumpdatainstructions32[i][0], 16)), Number("0x" + dumpdatainstructions32[i][1]));
              // creator_memory_data_compiler(parseInt(dumpdatainstructions32[i][0], 16), dumpdatainstructions32[i][1], 2, dumpdatainstructions32[i][4], parseInt(dumpdatainstructions32[i][1], 16) >> 0, dumpdatainstructions32[i][6],);
          }

          const halfTag = dumpdatainstructions32[i][4] ?? "";
          const halfType = "half";
          main_memory.addHint(BigInt(parseInt(dumpdatainstructions32[i][0], 16)), halfTag, halfType, 16);
        break;
        case "byte":
            main_memory.write(BigInt(parseInt(dumpdatainstructions32[i][0], 16)), Number("0x"+dumpdatainstructions32[i][1].substring(2)));
            const byteTag = dumpdatainstructions32[i][4] ?? "";
            const byteType = "byte";
            main_memory.addHint(BigInt(parseInt(dumpdatainstructions32[i][0], 16)), byteTag, byteType, 8);
        
            // if(dumpdatainstructions32[i][1].length > 2){
            // var init_add = parseInt(dumpdatainstructions32[i][0], 16);
            // var elements = Math.floor(dumpdatainstructions32[i][1].length / 2); // 4
            // if(dumpdatainstructions32[i][1].length % 2 !== 0){
            //     elements = elements + 1;
            // }
            // dumpdatainstructions32[i][1] = dumpdatainstructions32[i][1].padStart(elements * 2,"0");

            // for (var j = 0; j < elements;j++){
            //     var element_to_insert = dumpdatainstructions32[i][1].slice(dumpdatainstructions32[i][1].length - (j * 2 + 2), dumpdatainstructions32[i][1].length - (2 * j));
            //     console.log("Insert: ", element_to_insert);
            //     if (j === 0 )
            //       main_memory.write(BigInt(init_add + j * 1), Number(element_to_insert));
            //     // creator_memory_data_compiler(init_add + j*1, element_to_insert, 1, dumpdatainstructions32[i][4], (parseInt(element_to_insert, 16) << 24) >> 24, dumpdatainstructions32[i][6],);
            //     else
            //       main_memory.write(BigInt(init_add + j * 1), Number(element_to_insert));
            //     // creator_memory_data_compiler(init_add + j*1, element_to_insert, 1, null, (parseInt(element_to_insert,16) << 24 ) >> 24, dumpdatainstructions32[i][6],);

            // }
            // }else {
            //   main_memory.write(BigInt(parseInt(dumpdatainstructions32[i][0], 16)), Number("0x"+dumpdatainstructions32[i][1]));
            // // creator_memory_data_compiler(parseInt(dumpdatainstructions32[i][0], 16), dumpdatainstructions32[i][1], 1, dumpdatainstructions32[i][4], parseInt(dumpdatainstructions32[i][1], 16) >> 0, dumpdatainstructions32[i][6],);
            // }
            break;
        case "word":
        case "integer":
            if(dumpdatainstructions32[i][1].length > 8){
            var init_add = parseInt(dumpdatainstructions32[i][0], 16);
            var elements = Math.floor(dumpdatainstructions32[i][1].length / 8);
            if(dumpdatainstructions32[i][1].length % 8 !== 0){
                elements = elements + 1;
                dumpdatainstructions32[i][1] = dumpdatainstructions32[i][1].padStart(elements*8,"0");
            }
            for (var j = 0; j < elements; j++){

                var element_to_insert = dumpdatainstructions32[i][1].slice(dumpdatainstructions32[i][1].length - (j + 1) * 8, dumpdatainstructions32[i][1].length - (8 * j));
                // if (j === 0 )
                  main_memory.write(BigInt(init_add + j * 4), Number(element_to_insert));
                // creator_memory_data_compiler(init_add + j*4, element_to_insert, 4, dumpdatainstructions32[i][4], parseInt(element_to_insert, 16) >> 0, dumpdatainstructions32[i][6],);
                // else
                // creator_memory_data_compiler(init_add + j*4, element_to_insert, 4, null, parseInt(element_to_insert, 16) >> 0, dumpdatainstructions32[i][6],);

            }
            }else {
              const wordValue = BigInt("0x" + dumpdatainstructions32[i][1]);
              const wordBytes = new Uint8Array(4);
              for (let j = 0; j < 4; j++) {
                const shiftAmount = BigInt((4 - 1 - j) * 8);
                wordBytes[j] = Number((wordValue >> shiftAmount) & BigInt(
                  ( (1 << 8) - 1)
                ));
              }
              main_memory.writeWord(BigInt("0x"+dumpdatainstructions32[i][0]), wordBytes);
            // creator_memory_data_compiler(parseInt(dumpdatainstructions32[i][0], 16), dumpdatainstructions32[i][1], 8, dumpdatainstructions32[i][4], parseInt(dumpdatainstructions32[i][1], 16) >> 0, dumpdatainstructions32[i][6],);
            }
              // main_memory.write(BigInt(parseInt(dumpdatainstructions32[i][0], 16)), Number("0x"+dumpdatainstructions32[i][1]));
              // creator_memory_data_compiler(parseInt(dumpdatainstructions32[i][0], 16), dumpdatainstructions32[i][1], 4, dumpdatainstructions32[i][4], parseInt(dumpdatainstructions32[i][1], 16) >> 0, dumpdatainstructions32[i][6],);
            const wordTag = dumpdatainstructions32[i][4] ?? "";
            const wordType = "word";
            main_memory.addHint(BigInt(parseInt(dumpdatainstructions32[i][0], 16)), wordTag, wordType, 32);
            break;
        case "dword":
            if(dumpdatainstructions32[i][1].length > 16){
            var init_add = parseInt(dumpdatainstructions32[i][0], 16);
            var elements = Math.floor(dumpdatainstructions32[i][1].length / 16);
            if(dumpdatainstructions32[i][1].length % 16 !== 0){
                elements = elements + 1;
                dumpdatainstructions32[i][1] = dumpdatainstructions32[i][1].padStart(elements*16,"0");
            }
            for (var j = 0; j < elements; j++){
                var element_to_insert = dumpdatainstructions32[i][1].slice(dumpdatainstructions32[i][1].length - (j + 1) * 16, dumpdatainstructions32[i][1].length - (16 * j));
                main_memory.write(BigInt(init_add + j * 8), Number(element_to_insert));
                // if (j === 0 )
                // creator_memory_data_compiler(init_add + j*8, element_to_insert, 8, dumpdatainstructions32[i][4], element_to_insert >> 0, dumpdatainstructions32[i][6],);
                // else
                // creator_memory_data_compiler(init_add + j*8, element_to_insert, 8, null, element_to_insert >> 0, dumpdatainstructions32[i][6],);

            }
            }else {
              const dwordValue = BigInt("0x" + dumpdatainstructions32[i][1]);
              const wordBytes = new Uint8Array(4);
              const highWord = dwordValue >> BigInt(32);

              const lowWord = dwordValue & BigInt( (1n << BigInt(32)) - 1n);

              const highWordBytes = new Uint8Array(4);
              const lowWordBytes = new Uint8Array(4);

              for (let j = 0; j < 4; j++){
                const shiftAmount =  BigInt(
                  (4 - 1 - j) * 8);
                highWordBytes[j] = Number((highWord >> shiftAmount) & BigInt((1 << 8) - 1));
                lowWordBytes[j] = Number((lowWord >> shiftAmount) & BigInt((1 << 8) - 1));
              }
              main_memory.writeWord(BigInt("0x" + dumpdatainstructions32[i][0]), highWordBytes);
              main_memory.writeWord(BigInt("0x" + dumpdatainstructions32[i][0]) + BigInt(4), lowWordBytes);
            // creator_memory_data_compiler(parseInt(dumpdatainstructions32[i][0], 16), dumpdatainstructions32[i][1], 8, dumpdatainstructions32[i][4], parseInt(dumpdatainstructions32[i][1], 16) >> 0, dumpdatainstructions32[i][6],);
            }
            const dwordTag = dumpdatainstructions32[i][4] ?? "";
            const dwordType = "dword";
            main_memory.addHint(BigInt("0x" + dumpdatainstructions32[i][0]), dwordTag, dwordType, 64);
            break;

        case "float":
            align = 2;

            if(dumpdatainstructions32[i][1].length > 8){ // Caso de que sea un vector de floats
            var init_add = parseInt(dumpdatainstructions32[i][0], 16);
            var elements = Math.floor(dumpdatainstructions32[i][1].length / 8);
            if(dumpdatainstructions32[i][1].length % 8 !== 0){
                elements = elements + 1;
                dumpdatainstructions32[i][1] = dumpdatainstructions32[i][1].padStart(elements*8,"0");
            }
            for (var j = 0; j < elements; j++){
                // let buffer = new ArrayBuffer(4); // 4 bytes para float
                // let view = new DataView(buffer);

                var element_to_insert = dumpdatainstructions32[i][1].slice(dumpdatainstructions32[i][1].length - (j + 1) * 8, dumpdatainstructions32[i][1].length - (8 * j));
                const floatValue = Number("0x" + element_to_insert);
                const buffer = new ArrayBuffer(4);
                const view = new DataView(buffer);

                view.setFloat32(0, floatValue, false);
                const floatBytes = new Uint8Array(4);
                for (let k = 0; k < 4; k++) {
                  floatBytes[k]= view.getUint8(k);
                }
                writeMultiByteValueAsWords(BigInt(init_add + (j *4)), floatBytes, 4);
                // main_memory.write(BigInt(init_add + j * 4), Number(element_to_insert));
                // if (j === 0 )
                // creator_memory_data_compiler(init_add + j*4, element_to_insert, 4, dumpdatainstructions32[i][4], view.getFloat32(0, false), dumpdatainstructions32[i][6],);
                // else
                // creator_memory_data_compiler(init_add + j*4, element_to_insert, 4, null, view.getFloat32(0, false), dumpdatainstructions32[i][6],);

            }
              const floatTag = dumpdatainstructions32[i][4] ?? "";
              const floatType = "float";
              main_memory.addHint(BigInt(init_add), floatTag, floatType, (elements * 32));

            }else {
            const floatValue = Number("0x" + dumpdatainstructions32[i][1]);
            const buffer = new ArrayBuffer(4); // 4 bytes para float
            const view = new DataView(buffer);

            view.setFloat32(0, floatValue, false);
            const floatBytes =  new Uint8Array(4);
            for(let j = 0; j < 4; j++) {
              floatBytes[j] = view.getUint8(j);
            }
            writeMultiByteValueAsWords(BigInt(parseInt(dumpdatainstructions32[i][0], 16)), floatBytes, 4);
            const floatTag = dumpdatainstructions32[i][4] ?? "";
            const floatType = "float";
            main_memory.addHint(BigInt(parseInt(dumpdatainstructions32[i][0], 16)), floatTag, floatType, 32);


            // Convertir hexadecimal a entero
            // let intVal = parseInt(dumpdatainstructions32[i][1], 16);

            // Escribir el entero en el buffer como float
            // view.setUint32(0, intVal, false);
            // main_memory.write(BigInt(parseInt(dumpdatainstructions32[i][0], 16)), Number("0x" + dumpdatainstructions32[i][1]));
            // creator_memory_data_compiler(parseInt(dumpdatainstructions32[i][0], 16), dumpdatainstructions32[i][1], 4, dumpdatainstructions32[i][4],view.getFloat32(0, false), dumpdatainstructions32[i][6],);
            }

            break;
        case "double":
            if (dumpdatainstructions32[i][5] === 0){
              align = 2;
            } else {
              align = dumpdatainstructions32[i][5];
            }
            if(dumpdatainstructions32[i][1].length > 16){
              var init_add = parseInt(dumpdatainstructions32[i][0], 16);
              var elements = Math.floor(dumpdatainstructions32[i][1].length / 16);
              if(dumpdatainstructions32[i][1].length % 16 !== 0){
                  elements = elements + 1;
                  dumpdatainstructions32[i][1] = dumpdatainstructions32[i][1].padStart(elements*16,"0");
              }
              for (var j = 0; j < elements; j++){

                  const doubleValue = dumpdatainstructions32[i][1].slice(dumpdatainstructions32[i][1].length - (j + 1) * 16, dumpdatainstructions32[i][1].length - (16 * j));

                  let bufferd = new ArrayBuffer(8); // 8 bytes para double
                  let viewd = new DataView(bufferd);
                  for (let j = 0; j < 8; j++){
                    viewd.setUint8(7 - j, parseInt(doubleValue.slice(j * 2, j * 2 + 2), 16));

                  }
                  const doubleBytes = new Uint8Array(8);
                  for (let j = 0; j < 8; j++) {
                    doubleBytes[j] = viewd.getUint8(7 - j);
                  }
                  

                  writeMultiByteValueAsWords(BigInt(init_add + j *8), doubleBytes, 4);

              }

              const doubleTag = dumpdatainstructions32[i][4] ?? "";
              const doubleType = "float64";
              main_memory.addHint(BigInt(parseInt(dumpdatainstructions32[i][0], 16)), doubleTag, doubleType, 64 * elements);
            }else {
              const doubleValue = dumpdatainstructions32[i][1];
              // console.log(doubleValue);
              let bufferd = new ArrayBuffer(8); // 8 bytes para double
              let viewd = new DataView(bufferd);
              for (let j = 0; j < 8; j++){
                viewd.setUint8(7 - j, parseInt(doubleValue.slice(j * 2, j * 2 + 2), 16));

              }
              const doubleBytes = new Uint8Array(8);
              for (let j = 0; j < 8; j++) {
                doubleBytes[j] = viewd.getUint8(7 - j);
              }
              

              writeMultiByteValueAsWords(BigInt(parseInt(dumpdatainstructions32[i][0], 16)), doubleBytes, 4);

              const doubleTag = dumpdatainstructions32[i][4] ?? "";
              const doubleType = "float64";
              main_memory.addHint(BigInt(parseInt(dumpdatainstructions32[i][0], 16)), doubleTag, doubleType, 64);
              // Convertir hexadecimal a entero
              // let high = parseInt(dumpdatainstructions32[i][1].slice(0, 8), 16); // Parte alta
              // let low = parseInt(dumpdatainstructions32[i][1].slice(8, 16), 16); // Parte baja

              // // Escribir los valores en el buffer
              // viewd.setUint32(0, high, false); // Parte alta
              // viewd.setUint32(4, low, false);  // Parte baja

              // // Leer como double de 64 bits
              // main_memory.write(BigInt(parseInt(dumpdatainstructions32[i][0], 16)), Number("0x" + dumpdatainstructions32[i][1]));
              // creator_memory_data_compiler(parseInt(dumpdatainstructions32[i][0], 16), dumpdatainstructions32[i][1], 8, dumpdatainstructions32[i][4], viewd.getFloat64(0, false), dumpdatainstructions32[i][6],);
            }
            align = 1;
            break;

        case "asciz":
        case "ascii":
            const encoder = new TextEncoder();
            let curraddr = BigInt(parseInt(dumpdatainstructions32[i][0], 16));
            const startAddr = BigInt(parseInt(dumpdatainstructions32[i][0], 16));
            for (const ch_h of dumpdatainstructions32[i][1]) {
              const bytes = new Uint8Array(4);
              const n = encoder.encodeInto(ch_h, bytes).written;
              for (let j = 0; j < n; j++) {
                main_memory.write(curraddr, bytes[j]);
                curraddr++;
              }
            }
            const stringLength = Number(curraddr - startAddr);
            const stringTag = dumpdatainstructions32[i][4] ?? "";
            const stringType = "string";
            main_memory.addHint(startAddr, stringTag, stringType, stringLength * 8);
            // creator_memory_data_compiler(parseInt(dumpdatainstructions32[i][0], 16), dumpdatainstructions32[i][1], 2, dumpdatainstructions32[i][4], parseInt(dumpdatainstructions32[i][1], 16) >> 0, dumpdatainstructions32[i][6],);
            // creator_memory_storestring(dumpdatainstructions32[i][1], (dumpdatainstructions32[i][1].length / 2), parseInt(dumpdatainstructions32[i][0], 16), dumpdatainstructions32[i][4], dumpdatainstructions32[i][6], dumpdatainstructions32[i][5]);
            break;

            // creator_memory_storestring(dumpdatainstructions32[i][1], (dumpdatainstructions32[i][1].length / 2), parseInt(dumpdatainstructions32[i][0], 16), dumpdatainstructions32[i][4], dumpdatainstructions32[i][6], dumpdatainstructions32[i][5]);
            break;

        case "space":
        case "zero":
          let space_addr = BigInt(parseInt(dumpdatainstructions32[i][0], 16));
          const size = BigInt(dumpdatainstructions32[i][1]);
          if (size < 0n) {
            throw new Error("The space directives value should be positive and greater than zero");
          }
          for (let j = 0n; j < size; j++) {
            main_memory.write(space_addr + j, 0);
          }

          const spaceTag = dumpdatainstructions32[i][4] ?? "";
          const spaceType = "space";
          main_memory.addHint(space_addr, spaceTag, spaceType, Number(size) * 8);
          // creator_memory_storestring(dumpdatainstructions32[i][1], dumpdatainstructions32[i][1], parseInt(dumpdatainstructions32[i][0], 16), dumpdatainstructions32[i][4], dumpdatainstructions32[i][6], dumpdatainstructions32[i][5]);
          break;
        }
    }

    // creator_memory_prereset();
    // creator_memory_reset();

    // Initialize stack
    stack_address = parseInt(architecture.memory_layout.stack.start);

    main_memory.writeWord(BigInt(stack_address), [0x0, 0x0, 0x0, 0x0]); // writeMemory("00", parseInt(stack_address), "word") ;
    if (architecture.config.word_size == 32) {
        architecture.components[1].elements[2].value = 
        BigInt(parseInt(stack_address) >>> 0, 10);
        
        // bi_intToBigInt(
        // stack_address,
        // 10,
        // );
        architecture.components[1].elements[2].default_value = 
          BigInt(parseInt(stack_address) >>> 0, 10);   
        // bi_intToBigInt(
        // stack_address,
        // 10,
        // );
    }else {
        architecture.components[1].elements[2].value = stack_address;
        architecture.components[1].elements[2].default_value = stack_address;
    }
}

export function writeDataDumpMemory64(){
  for (let i = 0; i < dumpdatainstructions64.length; i++){

        switch(dumpdatainstructions64[i][6]){
        case "half":

          if(dumpdatainstructions64[i][1].length > 4){
              var init_add = parseInt(dumpdatainstructions64[i][0], 16);
              var elements = Math.floor(dumpdatainstructions64[i][1].length / 4);
              if(dumpdatainstructions64[i][1].length % 4 !== 0){
              elements = elements + 1;
              dumpdatainstructions64[i][1] = dumpdatainstructions64[i][1].padStart(elements*4,"0");
              }
              for (var j = 0; j < elements; j++){
              var element_to_insert = dumpdatainstructions64[i][1].slice(dumpdatainstructions64[i][1].length - (j * 2 + 2) * 2, dumpdatainstructions64[i][1].length - (4 * j));
              if (j === 0 )
                  main_memory.write(BigInt(init_add), Number("0x" + element_to_insert));
                  // creator_memory_data_compiler(init_add, element_to_insert, 2, dumpdatainstructions64[i][4], (parseInt(element_to_insert, 16) << 16) >> 16, dumpdatainstructions64[i][6],);
              else
                  main_memory.write(BigInt(init_add + j * 2), Number("0x" + element_to_insert));
                  // creator_memory_data_compiler(init_add + j*2, element_to_insert, 2, null, (parseInt(element_to_insert, 16) << 16) >> 16, dumpdatainstructions64[i][6],);

              }
          }else {
              main_memory.write(BigInt(parseInt(dumpdatainstructions64[i][0], 16)), Number("0x" + dumpdatainstructions64[i][1]));
              // creator_memory_data_compiler(parseInt(dumpdatainstructions64[i][0], 16), dumpdatainstructions64[i][1], 2, dumpdatainstructions64[i][4], parseInt(dumpdatainstructions64[i][1], 16) >> 0, dumpdatainstructions64[i][6],);
          }

          const halfTag = dumpdatainstructions64[i][4] ?? "";
          const halfType = "half";
          main_memory.addHint(BigInt(parseInt(dumpdatainstructions64[i][0], 16)), halfTag, halfType, 16);
        break;
        case "byte":
            main_memory.write(BigInt(parseInt(dumpdatainstructions64[i][0], 16)), Number("0x"+dumpdatainstructions64[i][1].substring(2)));
            const byteTag = dumpdatainstructions64[i][4] ?? "";
            const byteType = "byte";
            main_memory.addHint(BigInt(parseInt(dumpdatainstructions64[i][0], 16)), byteTag, byteType, 8);
        
            // if(dumpdatainstructions64[i][1].length > 2){
            // var init_add = parseInt(dumpdatainstructions64[i][0], 16);
            // var elements = Math.floor(dumpdatainstructions64[i][1].length / 2); // 4
            // if(dumpdatainstructions64[i][1].length % 2 !== 0){
            //     elements = elements + 1;
            // }
            // dumpdatainstructions64[i][1] = dumpdatainstructions64[i][1].padStart(elements * 2,"0");

            // for (var j = 0; j < elements;j++){
            //     var element_to_insert = dumpdatainstructions64[i][1].slice(dumpdatainstructions64[i][1].length - (j * 2 + 2), dumpdatainstructions64[i][1].length - (2 * j));
            //     console.log("Insert: ", element_to_insert);
            //     if (j === 0 )
            //       main_memory.write(BigInt(init_add + j * 1), Number(element_to_insert));
            //     // creator_memory_data_compiler(init_add + j*1, element_to_insert, 1, dumpdatainstructions64[i][4], (parseInt(element_to_insert, 16) << 24) >> 24, dumpdatainstructions64[i][6],);
            //     else
            //       main_memory.write(BigInt(init_add + j * 1), Number(element_to_insert));
            //     // creator_memory_data_compiler(init_add + j*1, element_to_insert, 1, null, (parseInt(element_to_insert,16) << 24 ) >> 24, dumpdatainstructions64[i][6],);

            // }
            // }else {
            //   main_memory.write(BigInt(parseInt(dumpdatainstructions64[i][0], 16)), Number("0x"+dumpdatainstructions64[i][1]));
            // // creator_memory_data_compiler(parseInt(dumpdatainstructions64[i][0], 16), dumpdatainstructions64[i][1], 1, dumpdatainstructions64[i][4], parseInt(dumpdatainstructions64[i][1], 16) >> 0, dumpdatainstructions64[i][6],);
            // }
            break;
        case "word":
        case "integer":
            if(dumpdatainstructions64[i][1].length > 8){
            var init_add = parseInt(dumpdatainstructions64[i][0], 16);
            var elements = Math.floor(dumpdatainstructions64[i][1].length / 8);
            if(dumpdatainstructions64[i][1].length % 8 !== 0){
                elements = elements + 1;
                dumpdatainstructions64[i][1] = dumpdatainstructions64[i][1].padStart(elements*8,"0");
            }
            for (var j = 0; j < elements; j++){

                var element_to_insert = dumpdatainstructions64[i][1].slice(dumpdatainstructions64[i][1].length - (j + 1) * 8, dumpdatainstructions64[i][1].length - (8 * j));
                // if (j === 0 )
                  main_memory.write(BigInt(init_add + j * 4), Number(element_to_insert));
                // creator_memory_data_compiler(init_add + j*4, element_to_insert, 4, dumpdatainstructions64[i][4], parseInt(element_to_insert, 16) >> 0, dumpdatainstructions64[i][6],);
                // else
                // creator_memory_data_compiler(init_add + j*4, element_to_insert, 4, null, parseInt(element_to_insert, 16) >> 0, dumpdatainstructions64[i][6],);

            }
            }else {
              const wordValue = BigInt("0x" + dumpdatainstructions64[i][1]);
              const wordBytes = new Uint8Array(4);
              for (let j = 0; j < 4; j++) {
                const shiftAmount = BigInt((4 - 1 - j) * 8);
                wordBytes[j] = Number((wordValue >> shiftAmount) & BigInt(
                  ( (1 << 8) - 1)
                ));
              }
              main_memory.writeWord(BigInt("0x"+dumpdatainstructions64[i][0]), wordBytes);
            // creator_memory_data_compiler(parseInt(dumpdatainstructions64[i][0], 16), dumpdatainstructions64[i][1], 8, dumpdatainstructions64[i][4], parseInt(dumpdatainstructions64[i][1], 16) >> 0, dumpdatainstructions64[i][6],);
            }
              // main_memory.write(BigInt(parseInt(dumpdatainstructions64[i][0], 16)), Number("0x"+dumpdatainstructions64[i][1]));
              // creator_memory_data_compiler(parseInt(dumpdatainstructions64[i][0], 16), dumpdatainstructions64[i][1], 4, dumpdatainstructions64[i][4], parseInt(dumpdatainstructions64[i][1], 16) >> 0, dumpdatainstructions64[i][6],);
            const wordTag = dumpdatainstructions64[i][4] ?? "";
            const wordType = "word";
            main_memory.addHint(BigInt(parseInt(dumpdatainstructions64[i][0], 16)), wordTag, wordType, 32);
            break;
        case "dword":
            if(dumpdatainstructions64[i][1].length > 16){
            var init_add = parseInt(dumpdatainstructions64[i][0], 16);
            var elements = Math.floor(dumpdatainstructions64[i][1].length / 16);
            if(dumpdatainstructions64[i][1].length % 16 !== 0){
                elements = elements + 1;
                dumpdatainstructions64[i][1] = dumpdatainstructions64[i][1].padStart(elements*16,"0");
            }
            for (var j = 0; j < elements; j++){
                var element_to_insert = dumpdatainstructions64[i][1].slice(dumpdatainstructions64[i][1].length - (j + 1) * 16, dumpdatainstructions64[i][1].length - (16 * j));
                main_memory.write(BigInt(init_add + j * 8), Number(element_to_insert));
                // if (j === 0 )
                // creator_memory_data_compiler(init_add + j*8, element_to_insert, 8, dumpdatainstructions64[i][4], element_to_insert >> 0, dumpdatainstructions64[i][6],);
                // else
                // creator_memory_data_compiler(init_add + j*8, element_to_insert, 8, null, element_to_insert >> 0, dumpdatainstructions64[i][6],);

            }
            }else {
              const dwordValue = BigInt("0x" + dumpdatainstructions64[i][1]);
              const wordBytes = new Uint8Array(4);
              const highWord = dwordValue >> BigInt(32);

              const lowWord = dwordValue & BigInt( (1n << BigInt(32)) - 1n);

              const highWordBytes = new Uint8Array(4);
              const lowWordBytes = new Uint8Array(4);

              for (let j = 0; j < 4; j++){
                const shiftAmount =  BigInt(
                  (4 - 1 - j) * 8);
                highWordBytes[j] = Number((highWord >> shiftAmount) & BigInt((1 << 8) - 1));
                lowWordBytes[j] = Number((lowWord >> shiftAmount) & BigInt((1 << 8) - 1));
              }
              main_memory.writeWord(BigInt("0x" + dumpdatainstructions64[i][0]), highWordBytes);
              main_memory.writeWord(BigInt("0x" + dumpdatainstructions64[i][0]) + BigInt(4), lowWordBytes);
            // creator_memory_data_compiler(parseInt(dumpdatainstructions64[i][0], 16), dumpdatainstructions64[i][1], 8, dumpdatainstructions64[i][4], parseInt(dumpdatainstructions64[i][1], 16) >> 0, dumpdatainstructions64[i][6],);
            }
            const dwordTag = dumpdatainstructions64[i][4] ?? "";
            const dwordType = "dword";
            main_memory.addHint(BigInt("0x" + dumpdatainstructions64[i][0]), dwordTag, dwordType, 64);
            break;

        case "float":
            align = 2;

            if(dumpdatainstructions64[i][1].length > 8){ // Caso de que sea un vector de floats
            var init_add = parseInt(dumpdatainstructions64[i][0], 16);
            var elements = Math.floor(dumpdatainstructions64[i][1].length / 8);
            if(dumpdatainstructions64[i][1].length % 8 !== 0){
                elements = elements + 1;
                dumpdatainstructions64[i][1] = dumpdatainstructions64[i][1].padStart(elements*8,"0");
            }
            for (var j = 0; j < elements; j++){
                // let buffer = new ArrayBuffer(4); // 4 bytes para float
                // let view = new DataView(buffer);

                var element_to_insert = dumpdatainstructions64[i][1].slice(dumpdatainstructions64[i][1].length - (j + 1) * 8, dumpdatainstructions64[i][1].length - (8 * j));
                const floatValue = Number("0x" + element_to_insert);
                const buffer = new ArrayBuffer(4);
                const view = new DataView(buffer);

                view.setFloat32(0, floatValue, false);
                const floatBytes = new Uint8Array(4);
                for (let k = 0; k < 4; k++) {
                  floatBytes[k]= view.getUint8(k);
                }
                writeMultiByteValueAsWords(BigInt(init_add + (j *4)), floatBytes, 4);
                // main_memory.write(BigInt(init_add + j * 4), Number(element_to_insert));
                // if (j === 0 )
                // creator_memory_data_compiler(init_add + j*4, element_to_insert, 4, dumpdatainstructions64[i][4], view.getFloat32(0, false), dumpdatainstructions64[i][6],);
                // else
                // creator_memory_data_compiler(init_add + j*4, element_to_insert, 4, null, view.getFloat32(0, false), dumpdatainstructions64[i][6],);

            }
              const floatTag = dumpdatainstructions64[i][4] ?? "";
              const floatType = "float";
              main_memory.addHint(BigInt(init_add), floatTag, floatType, (elements * 32));

            }else {
            const floatValue = Number("0x" + dumpdatainstructions64[i][1]);
            const buffer = new ArrayBuffer(4); // 4 bytes para float
            const view = new DataView(buffer);

            view.setFloat32(0, floatValue, false);
            const floatBytes =  new Uint8Array(4);
            for(let j = 0; j < 4; j++) {
              floatBytes[j] = view.getUint8(j);
            }
            writeMultiByteValueAsWords(BigInt(parseInt(dumpdatainstructions64[i][0], 16)), floatBytes, 4);
            const floatTag = dumpdatainstructions64[i][4] ?? "";
            const floatType = "float";
            main_memory.addHint(BigInt(parseInt(dumpdatainstructions64[i][0], 16)), floatTag, floatType, 32);


            // Convertir hexadecimal a entero
            // let intVal = parseInt(dumpdatainstructions64[i][1], 16);

            // Escribir el entero en el buffer como float
            // view.setUint32(0, intVal, false);
            // main_memory.write(BigInt(parseInt(dumpdatainstructions64[i][0], 16)), Number("0x" + dumpdatainstructions64[i][1]));
            // creator_memory_data_compiler(parseInt(dumpdatainstructions64[i][0], 16), dumpdatainstructions64[i][1], 4, dumpdatainstructions64[i][4],view.getFloat32(0, false), dumpdatainstructions64[i][6],);
            }

            break;
        case "double":
            if (dumpdatainstructions64[i][5] === 0){
            align = 2;
            } else {
            align = dumpdatainstructions64[i][5];
            }
            if(dumpdatainstructions64[i][1].length > 16){
            var init_add = parseInt(dumpdatainstructions64[i][0], 16);
            var elements = Math.floor(dumpdatainstructions64[i][1].length / 16);
            if(dumpdatainstructions64[i][1].length % 16 !== 0){
                elements = elements + 1;
                dumpdatainstructions64[i][1] = dumpdatainstructions64[i][1].padStart(elements*16,"0");
            }
            for (var j = 0; j < elements; j++){


              const doubleValue = dumpdatainstructions64[i][1].slice(dumpdatainstructions64[i][1].length - (j + 1) * 16, dumpdatainstructions64[i][1].length - (16 * j));
              // console.log(doubleValue);
              let bufferd = new ArrayBuffer(8); // 8 bytes para double
              let viewd = new DataView(bufferd);
              for (let j = 0; j < 8; j++){
                viewd.setUint8(7 - j, parseInt(doubleValue.slice(j * 2, j * 2 + 2), 16));

              }
              const doubleBytes = new Uint8Array(8);
              for (let j = 0; j < 8; j++) {
                doubleBytes[j] = viewd.getUint8(7 - j);
              }
              

              writeMultiByteValueAsWords(BigInt(init_add + j *8), doubleBytes, 4);

            }

              const doubleTag = dumpdatainstructions64[i][4] ?? "";
              const doubleType = "float64";
              main_memory.addHint(BigInt(parseInt(dumpdatainstructions64[i][0], 16)), doubleTag, doubleType, 64 * elements);

            }else {
              const doubleValue = dumpdatainstructions64[i][1];
              // console.log(doubleValue);
              let bufferd = new ArrayBuffer(8); // 8 bytes para double
              let viewd = new DataView(bufferd);
              for (let j = 0; j < 8; j++){
                viewd.setUint8(7 - j, parseInt(doubleValue.slice(j * 2, j * 2 + 2), 16));

              }
              const doubleBytes = new Uint8Array(8);
              for (let j = 0; j < 8; j++) {
                doubleBytes[j] = viewd.getUint8(7 - j);
              }
              

              writeMultiByteValueAsWords(BigInt(parseInt(dumpdatainstructions64[i][0], 16)), doubleBytes, 4);

              const doubleTag = dumpdatainstructions64[i][4] ?? "";
              const doubleType = "float64";
              main_memory.addHint(BigInt(parseInt(dumpdatainstructions64[i][0], 16)), doubleTag, doubleType, 64)
              // Convertir hexadecimal a entero
              // let high = parseInt(dumpdatainstructions64[i][1].slice(0, 8), 16); // Parte alta
              // let low = parseInt(dumpdatainstructions64[i][1].slice(8, 16), 16); // Parte baja

              // // Escribir los valores en el buffer
              // viewd.setUint32(0, high, false); // Parte alta
              // viewd.setUint32(4, low, false);  // Parte baja

              // // Leer como double de 64 bits
              // main_memory.write(BigInt(parseInt(dumpdatainstructions64[i][0], 16)), Number("0x" + dumpdatainstructions64[i][1]));
              // creator_memory_data_compiler(parseInt(dumpdatainstructions64[i][0], 16), dumpdatainstructions64[i][1], 8, dumpdatainstructions64[i][4], viewd.getFloat64(0, false), dumpdatainstructions64[i][6],);
            }
            align = 1;
            break;

        case "asciz":
        case "ascii":
            const encoder = new TextEncoder();
            let curraddr = BigInt(parseInt(dumpdatainstructions64[i][0], 16));
            const startAddr = BigInt(parseInt(dumpdatainstructions64[i][0], 16));
            for (const ch_h of dumpdatainstructions64[i][1]) {
              const bytes = new Uint8Array(4);
              const n = encoder.encodeInto(ch_h, bytes).written;
              for (let j = 0; j < n; j++) {
                main_memory.write(curraddr, bytes[j]);
                curraddr++;
              }
            }
            const stringLength = Number(curraddr - startAddr);
            const stringTag = dumpdatainstructions64[i][4] ?? "";
            const stringType = "string";
            main_memory.addHint(startAddr, stringTag, stringType, stringLength * 8);
            // creator_memory_data_compiler(parseInt(dumpdatainstructions64[i][0], 16), dumpdatainstructions64[i][1], 2, dumpdatainstructions64[i][4], parseInt(dumpdatainstructions64[i][1], 16) >> 0, dumpdatainstructions64[i][6],);
            // creator_memory_storestring(dumpdatainstructions64[i][1], (dumpdatainstructions64[i][1].length / 2), parseInt(dumpdatainstructions64[i][0], 16), dumpdatainstructions64[i][4], dumpdatainstructions64[i][6], dumpdatainstructions64[i][5]);
            break;

            // creator_memory_storestring(dumpdatainstructions64[i][1], (dumpdatainstructions64[i][1].length / 2), parseInt(dumpdatainstructions64[i][0], 16), dumpdatainstructions64[i][4], dumpdatainstructions64[i][6], dumpdatainstructions64[i][5]);
            break;

        case "space":
        case "zero":
          let space_addr = BigInt(parseInt(dumpdatainstructions64[i][0], 16));
          const size = BigInt(dumpdatainstructions64[i][1]);
          if (size < 0n) {
            throw new Error("The space directives value should be positive and greater than zero");
          }
          for (let j = 0n; j < size; j++) {
            main_memory.write(space_addr + j, 0);
          }

          const spaceTag = dumpdatainstructions64[i][4] ?? "";
          const spaceType = "space";
          main_memory.addHint(space_addr, spaceTag, spaceType, Number(size) * 8);
          // creator_memory_storestring(dumpdatainstructions64[i][1], dumpdatainstructions64[i][1], parseInt(dumpdatainstructions64[i][0], 16), dumpdatainstructions64[i][4], dumpdatainstructions64[i][6], dumpdatainstructions64[i][5]);
          break;
        }
    }

    // creator_memory_prereset();
    // creator_memory_reset();

    // Initialize stack
    stack_address = parseInt(architecture.memory_layout.stack.start);

    main_memory.writeWord(BigInt(stack_address), [0x0, 0x0, 0x0, 0x0]); // writeMemory("00", parseInt(stack_address), "word") ;
    if (architecture.config.word_size == 32) {
        architecture.components[1].elements[2].value = 
        BigInt(parseInt(stack_address) >>> 0, 10);
        
        // bi_intToBigInt(
        // stack_address,
        // 10,
        // );
        architecture.components[1].elements[2].default_value = 
          BigInt(parseInt(stack_address) >>> 0, 10);   
        // bi_intToBigInt(
        // stack_address,
        // 10,
        // );
    }else {
        architecture.components[1].elements[2].value = stack_address;
        architecture.components[1].elements[2].default_value = stack_address;
    }
}
export async function as(files){
    /* Initialize the assembler compiler */
    let depsLeft = Infinity;
    // if (sailas !== null) sailas = null;
    if (architecture.config.name === "SRV32") {
      sailas = await as32Module({
          locateFile,
          noInitialRun: true,
          print: (t) => console.log('[as32]', t),
          printErr: (t) => console.error('[as32:err]', t),
          onAbort: (r) => console.error('[as32:abort]', r),

          // Ver qué dependencia está pendiente (wasm, data, worker…)
          monitorRunDependencies(left) {
              depsLeft = left;
          console.log('[as32] deps pendientes:', left);
          },
      });
    } else {
      sailas = await as64Module({
          // locateFile,
          noInitialRun: true,
          print: (t) => console.log('[as64]', t),
          printErr: (t) => console.error('[as64:err]', t),
          onAbort: (r) => console.error('[as64:abort]', r),

          // Ver qué dependencia está pendiente (wasm, data, worker…)
          monitorRunDependencies(left) {
              depsLeft = left;
          console.log('[as64] deps pendientes:', left);
          },
      });
    }
      // Esperar a que depsLeft llegue a 0
    await new Promise((resolve) => {
        const check = () => {
        if (depsLeft === 0) resolve();
        else setTimeout(check, 10); // chequea cada 10 ms
        };
        check();
    });
    // sailas = await as32Module();
    //     {
    //     print: (text) => {

    //     },
    //     printErr: (text) => {
    //     }
    // }
    // console.log("Codigo: ", code);


    /* Now we have to check which extensions are enabled during the process */
    var march = "-march=rv";
    var mabi = "-mabi=ilp";
    if (architecture.config.name === "SRV32") {
      march = march + "32i";
      mabi = mabi + "32";
      for(const ext of extensions ?? []){
        switch(ext){
          case "M":
            march = march + "m";
          break;
          case "I":
            march = march + "";
          break;
          case "F":
            march = march + "f";
            if(!mabi.includes("d"))
              mabi = "-mabi=ilp32f";
          break;
          case "D":
            march = march + "d";
            mabi = "-mabi=ilp32d";
            doubleen = true;
          break;
          case "V":
            march = march + "v";
            mabi = "-mabi=ilp32d";
            vectoren = true;
          break;
        }
      }
      for (const vext of vectorins ?? []) {
        for (let j = 0; j < files.length; j++){
          var code = files[j].code;
          if (code.includes(vext) && !vectoren){
            march = march + "v";
            mabi = "-mabi=ilp32d";
            vectoren = !vectoren;
          }
        }
      }
      // if (vectoren && doubleen)
      //   show_notification("Using double data type with vectors may generate and inconsistent execution result, try on 64 bits architecture", "warning");
    } else {
      march = march + "64i";
      mabi = "-mabi=lp64";
      for(const ext of extensions ?? []){
        switch(ext){
          case "M":
            march = march + "m";
          break;
          case "I":
            march = march + "";
          break;
          case "F":
            march = march + "f";
            if(!mabi.includes("d"))
              mabi = "-mabi=lp64f";
          break;
          case "D":
            march = march + "d";
            mabi = "-mabi=lp64d";
          break;
          case "V":
            march = march + "v";
            mabi = "-mabi=lp64d";
          break;
        }
      }
      for (const vext of vectorins ?? []) {
        for (let j = 0; j < files.length; j++){
          var code = files[j].code;
          if (code.includes(vext) && !vectoren){
            march = march + "v";
            mabi = "-mabi=lp64d";
            vectoren = !vectoren;
          }
        }
      }
    }

    if (!document.app.$data.c_kernel) // Custom kernel case
      march = march + "_zicsr";

    let asargs = [march, mabi, files];
    console.log(asargs);
    let outfile = null;
    /* Once it is initialized we proceed to assemble code */
    /* Set arguments: extensions, input files, output name */
    // sailas.shouldRunNow = true;
    outfile = await sailas.run(asargs);
    // outfile = ofile;
    // console.log(outfile);
    // sailas.callMain(["-o","out.o","-march=rv32imfdv", "-mabi=ilp32d","code.s"]);
    return outfile/* REturn objfile to next step*/;
}

export async function ld(objfile, libs) {
    let depsLeft = Infinity;
    if (architecture.config.name === "SRV32") {
      sailld = await ld32Module({
          noInitialRun: true,
          print: (t) => console.log('[ld32]', t),
          printErr: (t) => console.error('[ld32:err]', t),
          onAbort: (r) => console.error('[ld32:abort]', r),

          // Ver qué dependencia está pendiente (wasm, data, worker…)
          monitorRunDependencies(left) {
              depsLeft = left;
          console.log('[ld32] deps pendientes:', left);
          },
      });
    
    } else {
      sailld = await ld64Module({
          noInitialRun: true,
          print: (t) => console.log('[ld64]', t),
          printErr: (t) => console.error('[ld64:err]', t),
          onAbort: (r) => console.error('[ld64:abort]', r),

          // Ver qué dependencia está pendiente (wasm, data, worker…)
          monitorRunDependencies(left) {
              depsLeft = left;
          console.log('[ld64] deps pendientes:', left);
          },
      });

    }

    await new Promise((resolve) => {
        const check = () => {
        if (depsLeft === 0) resolve();
        else setTimeout(check, 10); // chequea cada 10 ms
        };
        check();
    });

    var linker;


    if (architecture.config.name === "SRV32") {
      linker = await loadlinker(true);
    }
    else {
      linker = await loadlinker(false);
    }

    console.log(linker);
    // ld32Module.FS.writeFile('linker.ld', linker);

    /* Load linker script to generate elffile */
    var elf;
    if (libs){
      libs_to_load.push({name: loadedLibrary.name, file: loadedLibrary.library_file});
      elf = sailld.run([linker, objfile, "-T", "linker.ld", "-o", "output.elf", "input.o", loadedLibrary.name]);
    } else {
      elf = sailld.run([linker, objfile, "-T", "linker.ld", "-o", "output.elf", "input.o"]);
    
    }
    /* Load files to wasm program */

    return elf/* Return elfile to dump it*/;
}

export async function dump(file){
    let depsLeft = Infinity;

    if (architecture.config.name === "SRV32") {

      saildump = await dump32Module({
          noInitialRun: true,
          // print: (t) => console.log('[dump32]', t),
          // printErr: (t) => console.error('[dump32:err]', t),
          // onAbort: (r) => console.error('[dump32:abort]', r),

          // Ver qué dependencia está pendiente (wasm, data, worker…)
          monitorRunDependencies(left) {
              depsLeft = left;
          console.log('[dump32] deps pendientes:', left);
          },
      });
    }
    else {
      saildump = await dump64Module({
          noInitialRun: true,
          // print: (t) => console.log('[dump32]', t),
          // printErr: (t) => console.error('[dump32:err]', t),
          // onAbort: (r) => console.error('[dump32:abort]', r),

          // Ver qué dependencia está pendiente (wasm, data, worker…)
          monitorRunDependencies(left) {
              depsLeft = left;
          console.log('[dump64] deps pendientes:', left);
          },
      });
    }
    await new Promise((resolve) => {
        const check = () => {
        if (depsLeft === 0) resolve();
        else setTimeout(check, 10); // chequea cada 10 ms
        };
        check();
    });
    /* Load file into environment and executes dump*/
    saildump.run([file, "-D", "input.elf"]);
    if (architecture.config.name === "SRV32") {
      console.log("Instructions:", dumptextinstructions32);
      console.log("Data:", dumpdatainstructions32);

    align = 1;
    for (let i = 0; i < dumptextinstructions32.length; i++){
        // creator_insert_instruction(parseInt(dumptextinstructions32[i][0], 16), dumptextinstructions32[i][2], dumptextinstructions32[i][2], false, dumptextinstructions32[i][1], "00", dumptextinstructions32[i][4]);
        instructions.push({
        Break: null,
        Address: "0x" + dumptextinstructions32[i][0],
        Label: dumptextinstructions32[i][4],
        loaded: dumptextinstructions32[i][2],
        user : list_user_instructions[i],
        // L1_I: 0,
        // L1_D: 0,
        // L2_I: 0,
        // L2_D: 0,
        hex: dumptextinstructions32[i][1].replace(/^0x/i, "")
        .split("")                       
        .map(c => parseInt(c, 16)        
          .toString(2)                   
          .padStart(4, "0")              
        )
        .join(""),
        _rowVariant: "",
        visible: true,
        hide: false,
        });
        // console.log("entrada: ", entry_elf);
        if(architecture.config.word_size == 32){
        if (dumptextinstructions32[i][0] === document.app.$data.entry_elf || ("0x"+dumptextinstructions32[i][0]) === document.app.$data.entry_elf )
            instructions[i]._rowVariant = 'success';
        } else {
        if ((dumptextinstructions32[i][0]) === document.app.$data.entry_elf || ("0x"+dumptextinstructions32[i][0]) === document.app.$data.entry_elf)
            instructions[i]._rowVariant = 'success';
        }
    }
    // WORDSIZE = 32;
    // BYTESIZE = 8;
    // Split binary into words and write to memory
    for (const instruction of instructions ?? []){
      const auxAddr = parseInt(instruction.Address,16);
      for (let j = 0; j < instruction.hex.length; j += 32) {
          const wordBinary = instruction.hex.substr(j, 32);
          const wordBytes = [];

          // Split word into bytes
          for (let k = 0; k < wordBinary.length; k += 8) {
              const byte = parseInt(wordBinary.substr(k, 8), 2);
              wordBytes.push(byte);
          }

          main_memory.writeWord(BigInt(auxAddr + j / 8), wordBytes);
      }
    }




    process_data_to_store_memory32();

    writeDataDumpMemory32();
    updateMainMemoryBackup(main_memory.dump());


    } else {

      console.log("Instructions:", dumptextinstructions64);
      console.log("Data:", dumpdatainstructions64);

    align = 1;
    for (let i = 0; i < dumptextinstructions64.length; i++){
        // creator_insert_instruction(parseInt(dumptextinstructions64[i][0], 16), dumptextinstructions64[i][2], dumptextinstructions64[i][2], false, dumptextinstructions64[i][1], "00", dumptextinstructions64[i][4]);
        instructions.push({
        Break: null,
        Address: "0x" + dumptextinstructions64[i][0],
        Label: dumptextinstructions64[i][4],
        loaded: dumptextinstructions64[i][2],
        user : list_user_instructions[i],
        // L1_I: 0,
        // L1_D: 0,
        // L2_I: 0,
        // L2_D: 0,
        hex: dumptextinstructions64[i][1].replace(/^0x/i, "")
        .split("")                       
        .map(c => parseInt(c, 16)        
          .toString(2)                   
          .padStart(4, "0")              
        )
        .join(""),
        _rowVariant: "",
        visible: true,
        hide: false,
        });
        // console.log("entrada: ", entry_elf);
        if(architecture.config.word_size == 32){
        if (dumptextinstructions64[i][0] === document.app.$data.entry_elf || ("0x"+dumptextinstructions64[i][0]) === document.app.$data.entry_elf )
            instructions[i]._rowVariant = 'success';
        } else {
        if ((dumptextinstructions64[i][0]) === document.app.$data.entry_elf || ("0x"+dumptextinstructions64[i][0]) === document.app.$data.entry_elf)
            instructions[i]._rowVariant = 'success';
        }
    }
    // WORDSIZE = 32;
    // BYTESIZE = 8;
    // Split binary into words and write to memory
    for (const instruction of instructions ?? []){
      const auxAddr = parseInt(instruction.Address,16);
      for (let j = 0; j < instruction.hex.length; j += 32) {
          const wordBinary = instruction.hex.substr(j, 32);
          const wordBytes = [];

          // Split word into bytes
          for (let k = 0; k < wordBinary.length; k += 8) {
              const byte = parseInt(wordBinary.substr(k, 8), 2);
              wordBytes.push(byte);
          }

          main_memory.writeWord(BigInt(auxAddr + j / 8), wordBytes);
      }
    }




    process_data_to_store_memory64();

    writeDataDumpMemory64();
    updateMainMemoryBackup(main_memory.dump());

    }

    setInstructions(instructions);
    setAddress(architecture.memory_layout.text.start);
    if (document.app.$data.entry_elf !== undefined)
      setPC(BigInt(parseInt(document.app.$data.entry_elf, 16)));
    else { // Set first function to entry elf
      let ind = instructions.findIndex(insn => (insn.Label !== undefined && insn.Label !== ""));
      if (ind !== -1) {
        document.app.$data.entry_elf = instructions[ind].Address;
        setPC(BigInt(parseInt(document.app.$data.entry_elf, 16)));
      }
    }

    return {status: "ok", msg: ""}/* Return list of instructions and data to display in simulator view */;
}

export async function SailCompile(files, libs){

  // update the last state of code
  let a = assembly_files.value.findIndex(file => file.editing_now);
  assembly_files.value[a].code = files;


  vectoren = false;
  doubleen = false;
  extensions.length = 0;
  ins_filter = (ins_filter === undefined) ? architecture.instructions.map(insn => ({opcode: insn.name, type: insn.extension})) : ins_filter;
  // console.log("SAil assemble");
  libs_to_load.length = 0;
  
  dumptextinstructions64.length = 0;
  dumpdatainstructions64.length = 0;
  dumptextinstructions32.length = 0;
  dumpdatainstructions32.length = 0;
  list_data_instructions.length = 0;
  list_user_instructions.length = 0;
  filesToCompile.length = 0;
  // files now create a struct to store files to compile
  for (var j = 0; j < assembly_files.value.length; j++){
    if (assembly_files.value[j].to_compile){
      filesToCompile.push({name: assembly_files.value[j].filename, code: assembly_files.value[j].code});
    }
  }
  main_memory.zeroOut();
  main_memory.clearHints();
  instructions.length = 0;
  // creator_memory_clear();
  var explabel = /^(\w+):/;
  var expvalue = /\.(\w+)\s+(.+)/;
  var expalign = /^\.align\s+(\d+)/;
  var data_alignment = 0;
  var is_text = false;
  var is_data = false;
  var labeltext = "";
  var data_to_store = {
    align: 0,
    value: 0,
    label: "",
    type: ""
  }
  var ret = {
    errorcode: "",
    token: "",
    type: "",
    update: "",
    status: "ok"
  };
  for (let k = 0; k < filesToCompile.length; k++) {
    var code_assembly_array = filesToCompile[k].code.split('\n').map(line => line.split('#')[0].trim()).filter(line => line !== '');
    
    for (let i = 0; i < code_assembly_array.length; i++){
      if (code_assembly_array[i].search(".text") != -1){
        is_data = false;
        is_text = true;
      }
      else if(code_assembly_array[i].search(".data") != -1){
        is_data = true;
        is_text = false;
      }

      if (is_data){
        let matchlabel = code_assembly_array[i].match(explabel);
        let matchalign = code_assembly_array[i].match(expalign);
        let matchvalue = code_assembly_array[i].match(expvalue);
        // console.log("label:", matchlabel);
        // console.log("align:", matchalign);
        // console.log("value:", matchvalue);
        if (matchlabel){

          data_to_store.label = matchlabel[1];
        }
        if (matchalign){

          data_to_store.align = parseInt(matchalign[1], 10);
        }
        if (matchvalue && !(code_assembly_array[i].includes(".align") || code_assembly_array[i].includes("section") || code_assembly_array[i].includes("data") )){
          data_to_store.type = matchvalue[1];
          switch(data_to_store.type){
            case "half":
              if(matchvalue[2].includes(","))
                data_to_store.value = matchvalue[2].trim().split(",");
              else
                data_to_store.value = matchvalue[2];
              break;
            case "byte":
              if (matchvalue[2].includes(","))
                data_to_store.value = matchvalue[2].trim().split(",");
              else
                data_to_store.value = parseInt(matchvalue[2]).toString(16);
              break;
            case "word":
            case "dword":
            case "integer":
              if (matchvalue[2].includes(","))
                data_to_store.value = matchvalue[2].trim().split(",");
              else
                data_to_store.value = parseInt(matchvalue[2]).toString(16);
              break;

            case "float":
              if (matchvalue[2].includes(","))
                data_to_store.value = matchvalue[2].trim().split(",");
              else
                data_to_store.value = parseFloat(matchvalue[2]);
              if (extensions.findIndex(ext => "F".includes(ext)) === -1)
                extensions.push("F");
              break;
            case "double":
              if (matchvalue[2].includes(","))
                data_to_store.value = matchvalue[2].trim().split(",");
              else
                data_to_store.value = parseFloat(matchvalue[2]).toString(16);
              if (extensions.findIndex(ext => "D".includes(ext)) === -1)
                extensions.push("D");
              break;

            case "asciz":
              data_to_store.value = matchvalue[2];
              break;

            case "ascii":
              data_to_store.value = matchvalue[2];
              break;

            case "space":
            case "zero":
              data_to_store.value = matchvalue[2];
              break;
          }
          list_data_instructions.push(data_to_store);
          data_to_store = Object.assign({}, {
            align: 0,
            value: 0,
            label: "",
            type: ""
          });
        }
      }

      if (is_text && code_assembly_array[i].endsWith(':'))
        labeltext = code_assembly_array[i].slice(0, -1);
      else if (is_text && labeltext !== ""){
        identify_pseudo(code_assembly_array[i]);
      }
    }
    // filenames.push(assembly_files[j].filename);
    is_data = false;
    is_text = false;
    
  }




  if (sailas !== null || sailld !== null || saildump !== null)
  {   
    sailas = null;
    sailld = null;
    saildump = null;
    outfile = null;
  }

  outfile = await as(filesToCompile);//as(files);
  let elffile = await ld(outfile, libs);
  let outdump = await dump(elffile);
  document.app.$data.L1_I_num_lines  = 32;
  document.app.$data.L1_D_num_lines  = 32;
  document.app.$data.L1_num_lines  = 32;
  document.app.$data.L2_num_lines  = 32;
  document.app.$data.L2_I_num_lines  = 32;
  document.app.$data.L2_D_num_lines  = 32;
  document.app.$data.L1_size  = 32;
  document.app.$data.L1_I_size  = 32;
  document.app.$data.L1_D_size  = 32;
  document.app.$data.L1_size_block  = 32;
  document.app.$data.L1_I_size_block  = 32;
  document.app.$data.L1_D_size_block  = 32;
  document.app.$data.L2_size  = 32;
  document.app.$data.L2_I_size  = 32;
  document.app.$data.L2_D_size  = 32;
  document.app.$data.L2_size_block  = 32;
  document.app.$data.L2_I_size_block  = 32;
  document.app.$data.L2_D_size_block  = 32;
  document.app.$data.cache_type = 0;
  document.app.$data.isDirect = 0;
  document.app.$data.cache_location = "Associative";
  document.app.$data.cache_policy = "FIFO";
  document.app.$data.execution_mode_run = -1;
  document.app.$data.is_breakpoint = 0;
  document.app.$data.binary = elffile;
  // document.app.$data.c_kernel = true;
  document.app.$data.instructions = instructions;
  // setPC(BigInt(parseInt(document.app.$data.entry_elf, 16)));
  
  // console.log(ins_filter);
  // console.log(architecture.instructions);
  return outdump;
}