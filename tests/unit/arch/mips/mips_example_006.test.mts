import { assertExecution } from "../simulator-test-utils.mts";

const testAssembly = `
#
# Creator (https://creatorsim.github.io/creator/)
#

.text
      main:
      li $t0, 4
      li $t1, 2
      ble $t0, 5, jump1

    jump2:
      li $t3, 34
      li $v0, 10
      syscall

    jump1:
      li $t9, 11
      li $t8, 555
      b jump2
`;

Deno.test(
    "MIPS Branching Instructions",
    assertExecution("MIPS32.yml", testAssembly, {
        registers: {
            "1": 0x1n, // at
            "2": 0xan, // v0
            "8": 0x4n, // t0
            "9": 0x2n, // t1
            "11": 0x22n, // t3
            "24": 0x22bn, // t8
            "25": 0xbn, // t9
        },
        display: "", // Display buffer should be empty
        keyboard: "", // Keyboard buffer should be empty
    }),
);
