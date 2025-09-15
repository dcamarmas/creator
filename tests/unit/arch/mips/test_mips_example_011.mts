import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import {
    setupSimulator,
    executeN,
    cleanupSimulator,
    assertSimulatorState,
} from "../simulator-test-utils.mts";

Deno.test(
    "MIPS Function Calls",
    async () => {
        const testAssembly = `

#
# Creator (https://creatorsim.github.io/creator/)
#

.text

main:
    li $a0, 23
    li $a1, -77
    li $a2, 45
    jal sum
    move $a0, $v0
    move $a1, $v1
    jal sub
    move $a0, $v0
    li $v0, 1
    syscall
    li $v0, 10
    syscall
    
sum:
    add $t1, $a0, $a1
    add $t2, $a2, $a2
    move $v0, $t1
    move $v1, $t2
    jr $ra  

sub:
    sub $v0, $a0, $a1
    jr $ra
 

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
                PC: 0x38n,
                r1: 0xffffffb3n, // at
                r2: 0xan, // v0
                r3: 0x5an, // v1
                r4: 0xffffff70n, // a0
                r5: 0x5an, // a1
                r6: 0x2dn, // a2
                r9: 0xffffffcan, // t1
                r10: 0x5an, // t2
                r31: 0x24n, // ra
            },
            display: "-144", // Should display '-144'
            keyboard: "", // Keyboard buffer should be empty
        });

        cleanupSimulator();
    },
);
