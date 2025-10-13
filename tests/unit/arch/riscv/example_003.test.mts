import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import {
    setupSimulator,
    executeN,
    cleanupSimulator,
    assertSimulatorState,
} from "../simulator-test-utils.mts";

Deno.test(
    "Architecture-agnostic testing - RISC-V Load and Store Operations",
    async () => {
        const testAssembly = `

#
# Creator (https://creatorsim.github.io/creator/)
#

.data
    w1:     .word 14
    b1:     .byte 120

    .align 1
    h1:     .half 22
    w2:     .zero 4
    b2:     .zero 1

    .align 1
    h2:     .zero 2

.text
main:
    
    la t0, w1         # w1 address -> t0
    lw t3,  0(t0)     # Memory[t0] -> t3

    la t1, b1         # b1 address -> t1
    lb t4,  0(t1)     # Memory[t1] -> t4
    
    la t2, h1         # h1 address -> t2
    lh t5, 0 (t2)     # Memory[t2] -> t5

    la t0, w2         # w2 address -> t0
    sw t3,  0(t0)     # t3 -> Memory[w2]

    la t0, b2         # b2 address -> t0
    sb t4, 0(t0)      # t4 -> Memory[b2]

    la t0, h2         # h2 address -> t0
    sh t5, 0(t0)      # t5 -> Memory[h2]
   
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
                x5: 0x20000en, // t0 - h2 address
                x6: 0x200004n, // t1 - b1 address
                x7: 0x200006n, // t2 - h1 address
                x28: 0xen, // t3 - loaded w1 value
                x29: 0x78n, // t4 - loaded b1 value (120)
                x30: 0x16n, // t5 - loaded h1 value
            },
            memory: {
                "0x200003": 0xen, // w1 = 14
                "0x200004": 0x78n, // b1 = 120
                "0x200007": 0x16n, // h1 = 22
                "0x20000b": 0xen, // w2 = copied from w1
                "0x20000c": 0x78n, // b2 = copied from b1
                "0x20000f": 0x16n, // h2 = copied from h1
            },
            display: "",
            keyboard: "",
        });

        cleanupSimulator();
    },
);
