import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import {
    setupSimulator,
    executeN,
    getRegisterValue,
    cleanupSimulator,
} from "../simulator-test-utils.mts";
import * as creator from "@/core/core.mjs";

Deno.test(
    "Architecture-agnostic testing - RISC-V Function Calls and Stack Operations",
    // eslint-disable-next-line max-lines-per-function
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
    jr ra

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
        assertEquals(result.error, false, "Execution should not error");

        // Check register values based on expected output from .out file
        // x6 (t1) should contain 0xffffffca (-54 in 2's complement)
        assertEquals(
            getRegisterValue("x6"),
            BigInt.asIntN(32, 0xffffffcan),
            "x6 (t1) should contain 0xffffffca",
        );

        // x7 (t2) should contain 0x5a (90 in decimal)
        assertEquals(
            getRegisterValue("x7"),
            0x5an,
            "x7 (t2) should contain 0x5a",
        );

        // x10 (a0) should contain 0xffffff70 (-144 in 2's complement)
        assertEquals(
            getRegisterValue("x10"),
            BigInt.asUintN(32, 0xffffff70n),
            "x10 (a0) should contain 0xffffff70",
        );

        // x11 (a1) should contain 0x5a (90 in decimal)
        assertEquals(
            getRegisterValue("x11"),
            0x5an,
            "x11 (a1) should contain 0x5a",
        );

        // x12 (a2) should contain 0x2d (45 in decimal)
        assertEquals(
            getRegisterValue("x12"),
            0x2dn,
            "x12 (a2) should contain 0x2d",
        );

        // x17 (a7) should contain 0x1 (syscall for print_int)
        assertEquals(
            getRegisterValue("x17"),
            0x1n,
            "x17 (a7) should contain 0x1",
        );

        // Check that display shows the computed result
        assertEquals(
            creator.status.display,
            "-144",
            "Display should show '-144'",
        );

        assertEquals(
            creator.status.keyboard,
            "",
            "Keyboard buffer should be empty",
        );

        cleanupSimulator();
    },
);
