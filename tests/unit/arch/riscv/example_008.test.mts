import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import {
    setupSimulator,
    executeN,
    cleanupSimulator,
    assertSimulatorState,
} from "../simulator-test-utils.mts";

Deno.test(
    "Architecture-agnostic testing - RISC-V Matrix Copy with Floating Point",

    async () => {
        const testAssembly = `

#
# Creator (https://creatorsim.github.io/creator/)
#

.data
.align 4
matrixA:  .word 0x34000000, 0x34000000, 0x34000000, 0x34000000
          .word 0x23450000, 0x00432210, 0x77512120, 0x14141414
          .word 0x00000214, 0x44551122, 0xAABFF012, 0x77D00000
          .word 0x0000FF23, 0x12345678, 0x87654321, 0x33441124

.align 4
matrixB:  .word 0x0, 0x0, 0x0, 0x0
          .word 0x0, 0x0, 0x0, 0x0
          .word 0x0, 0x0, 0x0, 0x0
          .word 0x0, 0x0, 0x0, 0x0

.text
main:
        la   t0, matrixA
        la   t1, matrixB
        li   t2, 4
        li   t3, 4
        add  t4, zero, zero
        add  t5, zero, zero
    
loop1:  beq  t2, t4, end1
loop2:  beq  t3, t5, end2
        flw  f0, 0(t0)
        fsw  f0, 0(t1)
        addi t0, t0, 4
        addi t1, t1, 4
        addi t5, t5, 1
        beq  x0, x0, loop2
end2:   addi t4, t4, 1
        add  t5, zero, zero
        beq  x0, x0, loop1
end1:   
        # exit program
        li a7, 10
        ecall


    `;
        const RISCV_ARCH_PATH = "../../../architecture/RISCV/RV32IMFD.yml";
        // Setup simulator with RISC-V architecture
        await setupSimulator(testAssembly, RISCV_ARCH_PATH);

        // Execute the program
        const result = executeN(1000);
        assertEquals(result.error, 0, "Execution should not error");

        // Assert all expected state using the wrapper function
        assertSimulatorState({
            registers: {
                x5: 0x200040n,
                x6: 0x200080n,
                x7: 0x4n,
                x28: 0x4n,
                x29: 0x4n,
                f0: 0xffffffff33441124n,
            },
            memory: {
                "0x20007f": 0x24n,
                "0x20007e": 0x11n,
                "0x20007d": 0x44n,
                "0x20007c": 0x33n,
                "0x200040": 0x34n,
                "0x200044": 0x34n,
                "0x200048": 0x34n,
                "0x20004c": 0x34n,
            },
        });

        cleanupSimulator();
    },
);
