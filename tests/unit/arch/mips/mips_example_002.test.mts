import { assertExecution } from "../simulator-test-utils.mts";

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
    jr $ra
`;

Deno.test(
    "MIPS Basic Arithmetic Operations",
    assertExecution("MIPS32.yml", testAssembly, {
        registers: {
            "8": 0xan, // t0 = 10
            "9": 0xdn, // t1 = 13
            "10": 0x2dn, // t2 = 45
            "11": 0x21n, // t3 = 33
            "12": 0x17n, // t4 = 23
            "13": 0xcn, // t5 = 12
            "14": 0x441n, // t6 = 1089
            "15": 0x53n, // t7 = 83
        },
        display: "", // Display buffer should be empty
        keyboard: "", // Keyboard buffer should be empty
    }),
);
