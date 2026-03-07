import { assertExecution } from "../simulator-test-utils.mts";

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

Deno.test(
    "MIPS Function Calls",
    assertExecution("MIPS32.yml", testAssembly, {
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
    }),
);
