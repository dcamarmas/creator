import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import {
    setupSimulator,
    executeN,
    getRegisterValue,
    cleanupSimulator,
} from "../simulator-test-utils.mts";
import * as creator from "@/core/core.mjs";

Deno.test(
    "Architecture-agnostic testing - RISC-V Recursive Factorial Function",
    // eslint-disable-next-line max-lines-per-function
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
           jr ra


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

        // Check register values based on expected output from .out file
        // x5 (t0) should contain 0x2 (comparison value)
        assertEquals(
            getRegisterValue("x5"),
            0x2n,
            "x5 (t0) should contain 0x2",
        );

        // x6 (t1) should contain 0x5 (last factorial parameter)
        assertEquals(
            getRegisterValue("x6"),
            0x5n,
            "x6 (t1) should contain 0x5",
        );

        // x10 (a0) should contain 0x78 (120 - factorial of 5)
        assertEquals(
            getRegisterValue("x10"),
            0x78n,
            "x10 (a0) should contain 0x78",
        );

        // x17 (a7) should contain 0x1 (syscall for print_int)
        assertEquals(
            getRegisterValue("x17"),
            0x1n,
            "x17 (a7) should contain 0x1",
        );

        // Check that display shows the computed factorial
        assertEquals(
            creator.status.display,
            "120",
            "Display should show '120' (5! = 120)",
        );

        assertEquals(
            creator.status.keyboard,
            "",
            "Keyboard buffer should be empty",
        );

        cleanupSimulator();
    },
);
