import { architecture } from "../../core.mjs";
import sail32sim from "./wasm/riscv_sim_RV32.js"
import sail64sim from "./wasm/riscv_sim_RV64.js"
import sail32vdsim from "./wasm/riscv_sim_RV32vd.js"
import { vectoren, doubleen } from "../../assembler/sailAssembler/web/CNAssambler.mjs";
import { coreEvents } from "../../events.mts";

export var sailexec;
var programs = [];

async function cargarProgramas32(jsonPath) {

  const response = await fetch(jsonPath);
  const lista = await response.json();

  const programas = await Promise.all(
    lista.map(async entry => {

      const binResponse = await fetch(entry.url);
      const buffer = await binResponse.arrayBuffer();

      const programa = {
        name: entry.name,
        binary: new Uint8Array(buffer)
      };

      if ("doubleen" in entry) programa.doubleen = entry.doubleen;
      if ("vectoren" in entry) programa.vectoren = entry.vectoren;

      return programa;
    })
  );

  return programas;
}

async function cargarProgramas64(jsonPath){

  const response = await fetch(jsonPath);
  const lista = await response.json();

  const programas = await Promise.all(
    lista.map(async entry => {

      const binResponse = await fetch(entry.url);
      const buffer = await binResponse.arrayBuffer();

      const programa = {
        name: entry.name,
        binary: new Uint8Array(buffer)
      };

      return programa;
    })
  );

  return programas;
}

export async function SailTest32(){
    // Reset de las variables test
    document.app.$data.passed_test          = 0;
    document.app.$data.failed_test          = 0;
    document.app.$data.testing              = true;
    document.app.$data.c_kernel             = false;
    if (programs.length === 0)
        programs = await cargarProgramas32("examples/RISCV-32-Sail-Validation/list.json");
    
    for (let index = 0; index < programs.length; index++) {

        document.app.$data.execution_mode_run   = -1;
        const element = programs[index];
        let depsLeft = Infinity;
        if (element.vectoren && element.doubleen) {
            sailexec = await sail32vdsim({
                noInitialRun: true,
                // print: (t) => console.log('[sim32]', t),
                // printErr: (t) => console.warn('[sim32:err]', t),
                // onAbort: (t) => console.error("[sim32:abort]", t),
                monitorRunDependencies(left) {
                    depsLeft = left;
                    console.log("[sim32] deps pending:", left);
                },
            });
        } else {
            sailexec = await sail32sim({
                noInitialRun: true,
                // print: (t) => console.log('[sim32]', t),
                // printErr: (t) => console.warn('[sim32:err]', t),
                // onAbort: (t) => console.error("[sim32:abort]", t),
                monitorRunDependencies(left) {
                    depsLeft = left;
                    console.log("[sim32] deps pending:", left);
                },
            });
        }

        await new Promise((resolve) => {
            const check = () => {
                if (depsLeft === 0) resolve();
                else setTimeout(check, 100);
            };
            check();
        });
        document.app.$data.execution_mode_run = 0;
        sailexec.run([element.binary, "--entry-address", "0x80000000", "--cache-pol", "1", "-p", "output.elf"]);
        coreEvents.emit("update-validation");

        
    }

    document.app.$data.testing = false;

}
export async function SailTest64(){
    var filed_tests = [];
    document.app.$data.passed_test          = 0;
    document.app.$data.failed_test          = 0;
    document.app.$data.testing              = true;
    document.app.$data.c_kernel             = false;
    if (programs.length === 0)
        programs = await cargarProgramas64("examples/RISCV-64-Sail-Validation/list.json");

    for (let index = 0; index < programs.length; index++) {

        document.app.$data.execution_mode_run   = -1;
        const element = programs[index];
        let depsLeft = Infinity;
        sailexec = await sail64sim({
            noInitialRun: true,
            monitorRunDependencies(left) {
                depsLeft = left;
                console.log("[sim64] deps pending:", left);
            },
        });
        await new Promise((resolve) => {
            const check = () => {
                if (depsLeft === 0) resolve();
                else setTimeout(check, 100);
            };
            check();
        });
        document.app.$data.execution_mode_run = 0;
        sailexec.run([element.binary, "--entry-address", "0x80000000", "--cache-pol", "1", "-p", "output.elf"]);
        coreEvents.emit("update-validation");
    }

    document.app.$data.testing = false;
}
export async function SailExecute(binary, flags){
    let depsLeft = Infinity;
    if (architecture.config.name === "SRV32") {
        if (vectoren && doubleen) {
            sailexec = await sail32vdsim({
                noInitialRun: true,
                // print: (t) => console.log('[sim32]', t),
                // printErr: (t) => console.warn('[sim32:err]', t),
                // onAbort: (t) => console.error("[sim32:abort]", t),
                monitorRunDependencies(left) {
                    depsLeft = left;
                    console.log("[sim32] deps pending:", left);
                },
            });
        } else {
            sailexec = await sail32sim({
                noInitialRun: true,
                // print: (t) => console.log('[sim32]', t),
                // printErr: (t) => console.warn('[sim32:err]', t),
                // onAbort: (t) => console.error("[sim32:abort]", t),
                monitorRunDependencies(left) {
                    depsLeft = left;
                    console.log("[sim32] deps pending:", left);
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
    } else {
        sailexec = await sail64sim({
            noInitialRun: true,
            // print: (t) => console.log('[sim32]', t),
            // printErr: (t) => console.warn('[sim32:err]', t),
            // onAbort: (t) => console.error("[sim32:abort]", t),
            monitorRunDependencies(left) {
                depsLeft = left;
                console.log("[sim64] deps pending:", left);
            },
        });
        await new Promise((resolve) => {
            const check = () => {
                if (depsLeft === 0) resolve();
                else setTimeout(check, 10);
            };
            check();
        });
        architecture.memory_layout.stack.start = 140737488355324n ;
        architecture.memory_layout.stack.end = 140737488355327n;
    }


    // Once it is initialized, lets run the program

    // document.app.$data.execution_mode_run = 0;
    
    sailexec.run([binary, ...flags]);

} 