import { architecture } from "../../core.mjs";
import sail32sim from "./wasm/riscv_sim_RV32.js"
import sail64sim from "./wasm/riscv_sim_RV64.js"
import sail32vdsim from "./wasm/riscv_sim_RV32vd.js"
import { vectoren, doubleen } from "../../assembler/sailAssembler/web/CNAssambler.mjs";
export var sailexec;
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
    console.log(flags);
    
    sailexec.run([binary, ...flags]);

} 