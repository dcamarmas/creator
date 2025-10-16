import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import {
    setupSimulator,
    executeN,
    cleanupSimulator,
    assertSimulatorState,
} from "../simulator-test-utils.mts";

Deno.test("MIPS Branching Instructions", async () => {
    const testAssembly = `

#
# Creator (https://creatorsim.github.io/creator/)
#

.text
      main:
      li $t0, 4
      li $t1, 2
      ble $t0, 5, jump1
      
    jump2: 
      li $t3, 34
      li $v0, 10
      syscall

    jump1:
      li $t9, 11
      li $t8, 555
      b jump2

    `;

    const MIPS_ARCH_PATH = "../../../architecture/MIPS32.yml";

    // Setup simulator with MIPS architecture
    await setupSimulator(testAssembly, MIPS_ARCH_PATH);

    // Execute the program
    const result = executeN(1000);
    assertEquals(result.error, false, "Execution should not error");

    // Assert all expected state using the wrapper function
    assertSimulatorState({
        registers: {
            r1: 0x1n, // at
            r2: 0xan, // v0
            r8: 0x4n, // t0
            r9: 0x2n, // t1
            r11: 0x22n, // t3
            r24: 0x22bn, // t8
            r25: 0xbn, // t9
        },
        display: "", // Display buffer should be empty
        keyboard: "", // Keyboard buffer should be empty
    });

    cleanupSimulator();
});
