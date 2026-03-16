import { assertExecution } from "../simulator-test-utils.mts";

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

Deno.test(
    "MIPS Floating Point Operations",
    assertExecution("MIPS32.yml", testAssembly, {
        // TODO: finish the conditions below
        registers: {
            "1": 0x200018n, // at
            "2": 0xan, // v0
            "8": 0x200000n, // t0
            "9": 0x200008n, // t1
            "10": 0x200010n, // t2
            "11": 0x200028n, // t3
        },
        display: "", // Display buffer should be empty
        keyboard: "", // Keyboard buffer should be empty
    }),
);
