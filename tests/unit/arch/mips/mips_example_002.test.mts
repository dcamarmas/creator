import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import {
    setupSimulator,
    executeN,
    cleanupSimulator,
    assertSimulatorState,
} from "../simulator-test-utils.mts";

Deno.test("MIPS Basic Arithmetic Operations", async () => {
    const testAssembly = `

#
# Creator (https://creatorsim.github.io/creator/)
#

.text
main:
	
    li $t0, 10
    li $t1, 13
    li $t2, 45
    li $t3, 33
    
    add $t4, $t0, $t1 # 10+13
    sub $t5, $t2, $t3 # 45-33
    mul $t6, $t3, $t3 # 33*33
    div $t7, $t6, $t1 # $t6/13

    `;

    const MIPS_ARCH_PATH = "../../../architecture/MIPS32.yml";

    // Setup simulator with MIPS architecture
    await setupSimulator(testAssembly, MIPS_ARCH_PATH);

    // Execute the program
    const result = executeN(1000);
    assertEquals(result.error, 0, "Execution should not error");

    // Assert all expected state using the wrapper function
    assertSimulatorState({
        registers: {
            r8: 0xan, // t0 = 10
            r9: 0xdn, // t1 = 13
            r10: 0x2dn, // t2 = 45
            r11: 0x21n, // t3 = 33
            r12: 0x17n, // t4 = 23
            r13: 0xcn, // t5 = 12
            r14: 0x441n, // t6 = 1089
            r15: 0x53n, // t7 = 83
        },
        display: "", // Display buffer should be empty
        keyboard: "", // Keyboard buffer should be empty
    });

    cleanupSimulator();
});
