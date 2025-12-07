import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import {
    setupSimulator,
    executeN,
    cleanupSimulator,
    assertSimulatorState,
} from "../simulator-test-utils.mts";

Deno.test("MIPS Floating Point Operations", async () => {
    const testAssembly = `
#
# Creator (https://creatorsim.github.io/creator/)
#
 
.data
    a: .double 34.544
    b: .double 11.443
    c: .double 665.4
    
    d: .space 24
    
.text
main:
    la $t0, a
    la $t1, b
    la $t2, c
    la $t3, d
    
    l.d $f0, 0($t0)
    l.d $f2, 0($t1)
    l.d $f10, 0($t2)
    add.d $f0, $f0, $f0
    sub.d $f4, $f10, $f0
    div.d $f12, $f10, $f2

    s.d $f0, 0($t3)
    addi $t3, $t3, 8
    s.d $f4, 0($t3)
    addi $t3, $t3, 8
    s.d $f12, 0($t3)

    li $v0, 10
    syscall

    `;

    const MIPS_ARCH_PATH = "../../../architecture/MIPS32.yml";

    // Setup simulator with MIPS architecture
    await setupSimulator(testAssembly, MIPS_ARCH_PATH);

    // Execute the program
    const result = executeN(1000);
    assertEquals(result.error, false, "Execution should not error");
    // TODO: finish the conditions below
    // Assert all expected state using the wrapper function
    assertSimulatorState({
        registers: {
            r1: 0x200018n, // at
            r2: 0xan, // v0
            r8: 0x200000n, // t0
            r9: 0x200008n, // t1
            r10: 0x200010n, // t2
            r11: 0x200028n, // t3
        },
        display: "", // Display buffer should be empty
        keyboard: "", // Keyboard buffer should be empty
    });

    cleanupSimulator();
});
