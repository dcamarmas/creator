import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import {
    setupSimulator,
    executeN,
    cleanupSimulator,
    assertSimulatorState,
} from "../simulator-test-utils.mts";

Deno.test("MIPS Array Sum Loop", async () => {
    const testAssembly = `

#
# Creator (https://creatorsim.github.io/creator/)
#

.data
  w3: .word 1, 2, 3, 4, 5

.text
main:
  li  $t3,  1
  li  $t4,  4
  la  $t5,  w3
  li  $t7,  0

  # loop initialization
  li  $t1,  0
  li  $t2,  5

  # loop header
loop1: beq $t1, $t2, end1     #if($t1 == $t2) --> jump to fin1

  # loop body
  mul $t6, $t1, $t4             # $t1 * $t4 -> $t6
  lw  $t6, 0($t5)               # Memory[$t5] -> $t6
  add $t7, $t7, $t6             # $t6 + $t7 -> $t7

  # loop next...
  add $t1, $t1, $t3     # $t1 + $t3 -> $t1
  addi $t5, $t5, 4
  b loop1

  # loop end
end1: 
  li $v0, 10
  syscall



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
            PC: 0x44n,
            r1: 0x200000n, // at
            r2: 0xan, // v0
            r9: 0x5n, // t1
            r10: 0x5n, // t2
            r11: 0x1n, // t3
            r12: 0x4n, // t4
            r13: 0x200014n, // t5
            r14: 0x5n, // t6
            r15: 0xfn, // t7
        },
        display: "", // Display buffer should be empty
        keyboard: "", // Keyboard buffer should be empty
    });

    cleanupSimulator();
});
