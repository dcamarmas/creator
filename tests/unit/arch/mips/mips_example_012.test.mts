import { assertExecution } from "../simulator-test-utils.mts";

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

Deno.test(
    "MIPS Recursive Factorial",
    assertExecution("MIPS32.yml", testAssembly, {
        registers: {
            PC: 0x1cn,
            "1": 0x1n, // at
            "2": 0xan, // v0
            "4": 0x78n, // a0
            "9": 0x5n, // t1
            "31": 0x8n, // ra
        },
        display: "120", // Should display '120'
        keyboard: "", // Keyboard buffer should be empty
    }),
);
