import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import {
    setupSimulator,
    executeN,
    cleanupSimulator,
    assertSimulatorState,
} from "../simulator-test-utils.mts";

Deno.test("MIPS Recursive Factorial", async () => {
    const testAssembly = `

#
# ARCOS.INF.UC3M.ES
# BY-NC-SA (https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es)
#


.text

     main: 
           # v1 = factorial(5)
           li $a0, 5
           jal factorial

           # print_int(v1)
           move $a0, $v0
           li $v0, 1
           syscall

           # exit
           li $v0, 10
           syscall


factorial:
           # crear "stack frame" para $ra, $fp y una variable local
           subu $sp, $sp, 12
           sw   $ra, 8($sp)
           sw   $fp, 4($sp)
           addu $fp, $sp, 4

           # if ($a < 2):
           #     return 1
           bge  $a0, 2, b_else
           li   $v0, 1 
           b   b_efs
           # else:
           #    return $a0 * factorial($a0 - 1)
   b_else: sw   $a0, -4($fp)
           addi $a0, $a0, -1
           jal  factorial
           lw   $t1, -4($fp)
           mul  $v0, $v0, $t1

           # finalizar "stack frame"
   b_efs:  lw   $ra, 8($sp)
           lw   $fp, 4($sp)
           addu $sp, $sp, 12

           # return $v0
           jr $ra

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
            PC: 0x1cn,
            r1: 0x1n, // at
            r2: 0xan, // v0
            r4: 0x78n, // a0
            r9: 0x5n, // t1
            r31: 0x8n, // ra
        },
        display: "120", // Should display '120'
        keyboard: "", // Keyboard buffer should be empty
    });

    cleanupSimulator();
});
