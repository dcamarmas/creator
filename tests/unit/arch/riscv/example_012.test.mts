import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import {
    setupSimulator,
    executeN,
    cleanupSimulator,
    assertSimulatorState,
} from "../simulator-test-utils.mts";

Deno.test(
    "Architecture-agnostic testing - RISC-V Recursive Factorial Function",
     
    async () => {
        const testAssembly = `

#
# ARCOS.INF.UC3M.ES
# BY-NC-SA (https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es)
#


.text

     main: 
           addi sp, sp, -4
           sw ra, 0(sp)

           # t1 = factorial(5)
           li  a0, 5
           jal x1, factorial

           # print_int(t1)
           li  a7, 1
           ecall

           # return
           lw ra, 0(sp)
           addi sp, sp, 4
            # exit program
            li a7, 10
            ecall


factorial:
           # crear "stack frame" para $ra, $fp y una variable local
           addi sp, sp, -12
           sw   ra, 8(sp)
           sw   fp, 4(sp)
           addi fp, sp, 4

           # if (a0 < 2):
           #     return 1
           li   x5, 2
           bge  a0, t0, b_else
           li   a0, 1 
           beq  x0, x0, b_efs
           # else:
           #    return a0 * factorial(a0 - 1)
   b_else: sw   a0, -4(fp)
           addi a0, a0, -1
           jal  x1, factorial
           lw   t1, -4(fp)
           mul  a0, a0, t1

           # finalizar "stack frame"
   b_efs:  lw   ra, 8(sp)
           lw   fp, 4(sp)
           addi sp, sp, 12

           # return t0
           jr ra

    `;

        const RISCV_ARCH_PATH = "../../../architecture/RISCV/RV32IMFD.yml";

        // Setup simulator with RISC-V architecture
        await setupSimulator(testAssembly, RISCV_ARCH_PATH);

        // Execute the program
        const result = executeN(1000);
        assertEquals(result.error, false, "Execution should not error");

        // Assert all expected state using the wrapper function
        assertSimulatorState({
            registers: {
                x5: 0x2n, // t0 should contain 0x2 (comparison value)
                x6: 0x5n, // t1 should contain 0x5 (last factorial parameter)
                x10: 0x78n, // a0 should contain 0x78 (120 - factorial of 5)
            },
            display: "120", // Display should show '120' (5! = 120)
            keyboard: "", // Keyboard buffer should be empty
        });

        cleanupSimulator();
    },
);
