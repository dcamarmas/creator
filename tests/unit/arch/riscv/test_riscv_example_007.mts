import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import {
    setupSimulator,
    executeN,
    getRegisterValue,
    cleanupSimulator,
} from "../simulator-test-utils.mts";
import * as creator from "@/core/core.mjs";

Deno.test(
    "Architecture-agnostic testing - RISC-V Array Sum Loop",
    // eslint-disable-next-line max-lines-per-function
    async () => {
        const testAssembly = `

#
# Creator (https://creatorsim.github.io/creator/)
#

.data
  w3: .word 1, 2, 3, 4, 5

.text
main:

  li  t3,  1
  li  t4,  4
  la  t5,  w3
  li  t0,  0

  # loop initialization
  li  t1,  0
  li  t2,  5

  # loop header
loop1: beq t1, t2, end1      # if(t1 == t2) --> jump to fin1

  # loop body
  mul t6, t1, t4             # t1 * t4 -> t6
  lw  t6, 0(t5)              # Memory[t5] -> t6
  add t0, t0, t6             # t6 + t0 -> t0

  # loop next...
  add  t1, t1, t3            # t1 + t3 -> t1
  addi t5, t5, 4
  beq  x0, x0, loop1

  # loop end
end1: 
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
        // x5 (t0) should contain 0xf (15 - sum of 1+2+3+4+5)
        assertEquals(
            getRegisterValue("x5"),
            0xfn,
            "x5 (t0) should contain 0xf",
        );

        // x6 (t1) should contain 0x5 (loop counter after completion)
        assertEquals(
            getRegisterValue("x6"),
            0x5n,
            "x6 (t1) should contain 0x5",
        );

        // x7 (t2) should contain 0x5 (loop limit)
        assertEquals(
            getRegisterValue("x7"),
            0x5n,
            "x7 (t2) should contain 0x5",
        );

        // x28 (t3) should contain 0x1 (increment value)
        assertEquals(
            getRegisterValue("x28"),
            0x1n,
            "x28 (t3) should contain 0x1",
        );

        // x29 (t4) should contain 0x4 (word size)
        assertEquals(
            getRegisterValue("x29"),
            0x4n,
            "x29 (t4) should contain 0x4",
        );

        // x30 (t5) should contain 0x200014 (final array pointer)
        assertEquals(
            getRegisterValue("x30"),
            0x200014n,
            "x30 (t5) should contain 0x200014",
        );

        // x31 (t6) should contain 0x5 (last loaded value)
        assertEquals(
            getRegisterValue("x31"),
            0x5n,
            "x31 (t6) should contain 0x5",
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
