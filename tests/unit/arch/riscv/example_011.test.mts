import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import {
    setupSimulator,
    executeN,
    cleanupSimulator,
    assertSimulatorState,
} from "../simulator-test-utils.mts";

Deno.test(
    "Architecture-agnostic testing - RISC-V Function Calls and Stack Operations",
    async () => {
        const testAssembly = `

#
# Creator (https://creatorsim.github.io/creator/)
#

.text

main:
    addi sp, sp, -4
    sw ra, 0(sp)

    li   a0, 23
    li   a1, -77
    li   a2, 45
    jal  x1, sum
    jal  x1, sub
    li   a7, 1
    ecall

    lw ra, 0(sp)
    addi sp, sp, 4
    # exit program
    li a7, 10
    ecall

sum:
    add  t1, a0, a1
    add  t2, a2, a2
    add  a0, t1, zero
    add  a1, t2, zero
    jr   ra  

sub:
    sub a0, a0, a1
    jr ra

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
                x6: 0xffffffcan, // t1 should contain 0xffffffca (-54 in 2's complement)
                x7: 0x5an, // t2 should contain 0x5a (90 in decimal)
                x10: 0xffffff70n, // a0 should contain 0xffffff70 (-144 in 2's complement)
                x11: 0x5an, // a1 should contain 0x5a (90 in decimal)
                x12: 0x2dn, // a2 should contain 0x2d (45 in decimal)
            },
            display: "-144", // Display should show '-144'
            keyboard: "", // Keyboard buffer should be empty
        });

        cleanupSimulator();
    },
);
