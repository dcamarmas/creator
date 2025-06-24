import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import {
    setupSimulator,
    executeN,
    getRegisterValue,
    cleanupSimulator,
} from "../simulator-test-utils.mts";
import * as creator from "@/core/core.mjs";

Deno.test(
    "Architecture-agnostic testing - RISC-V Branch and Jump Operations",
    // eslint-disable-next-line max-lines-per-function
    async () => {
        const testAssembly = `

#
# Creator (https://creatorsim.github.io/creator/)
#

.text
    main:

      li  t0, 4
      li  t1, 2
      li  t3, 5
      bge t3, t0, jump1
      
    jump2: 
      li t3, 34
      li a7, 10
      ecall

    jump1:
      li t4, 11
      li t5, 555
      beq x0, x0, jump2

      #return
      jr ra

    `;

        const RISCV_ARCH_PATH = "../../../architecture/RISCV/RV32IMFD.yml";

        // Setup simulator with RISC-V architecture
        await setupSimulator(testAssembly, RISCV_ARCH_PATH);

        // Execute the program
        const result = executeN(1000);
        assertEquals(result.error, false, "Execution should not error");

        // Check register values based on expected output from .out file
        // x5 (t0) should contain 0x4
        assertEquals(
            getRegisterValue("x5"),
            0x4n,
            "x5 (t0) should contain 0x4",
        );

        // x6 (t1) should contain 0x2
        assertEquals(
            getRegisterValue("x6"),
            0x2n,
            "x6 (t1) should contain 0x2",
        );

        // x17 (a7) should contain 0xa (syscall 10 - exit)
        assertEquals(
            getRegisterValue("x17"),
            0xan,
            "x17 (a7) should contain 0xa",
        );

        // x28 (t3) should contain 0x22 (34 in decimal)
        assertEquals(
            getRegisterValue("x28"),
            0x22n,
            "x28 (t3) should contain 0x22",
        );

        // x29 (t4) should contain 0xb (11 in decimal)
        assertEquals(
            getRegisterValue("x29"),
            0xbn,
            "x29 (t4) should contain 0xb",
        );

        // x30 (t5) should contain 0x22b (555 in decimal)
        assertEquals(
            getRegisterValue("x30"),
            0x22bn,
            "x30 (t5) should contain 0x22b",
        );

        assertEquals(
            creator.status.keyboard,
            "",
            "Keyboard buffer should be empty",
        );
        assertEquals(
            creator.status.display,
            "",
            "Display buffer should be empty",
        );

        cleanupSimulator();
    },
);
