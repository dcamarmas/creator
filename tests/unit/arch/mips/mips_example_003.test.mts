import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import {
    setupSimulator,
    executeN,
    cleanupSimulator,
    assertSimulatorState,
} from "../simulator-test-utils.mts";

Deno.test("MIPS Data Types and Memory Operations", async () => {
    const testAssembly = `

#
# Creator (https://creatorsim.github.io/creator/)
#

.data
	w1:		.word 14
    b1:		.byte 120

    .align 1
    h1:		.half 22
    w2:		.space 4
    b2:		.space 1

    .align 1
    h2:		.space 2

.text
main:
	
    la $t0, w1		#w1 address -> $t0
    la $t1, b1		#b1 address -> $t1
    la $t2, h1		#h1 address -> $t2
    
    lw $t3, 0($t0)	#Memory[$t0] -> $t3
    lw $t4, w1		#Memory[w1]  -> $t4
    
    lb $t5, 0($t1)	#Memory[$t1] -> $t5
    lb $t6, b1		#Memory[b1]  -> $t6
    
    lh $t7, 0($t2)	#Memory[$t2] -> $t7
    lh $t8, h1		#Memory[h1]  -> $t8
    
    sw $t3, w2		#$t3 -> Memory[w2]
    sb $t5, b2		#$t5 -> Memory[b2]
    sh $t7, h2		#$t7 -> Memory[h2]

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
            r1: 0x20000en, // at
            r8: 0x200000n, // t0
            r9: 0x200004n, // t1
            r10: 0x200006n, // t2
            r11: 0xen, // t3
            r12: 0xen, // t4
            r13: 0x78n, // t5
            r14: 0x78n, // t6
            r15: 0x16n, // t7
            r24: 0x16n, // t8
        },
        memory: {
            "0x20000f": 0x16n,
            "0x20000c": 0x78n,
            "0x20000b": 0xen,
        },
        display: "", // Display buffer should be empty
        keyboard: "", // Keyboard buffer should be empty
    });

    cleanupSimulator();
});
