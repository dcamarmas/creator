import { assertExecution } from "../simulator-test-utils.mts";

const testAssembly = `
#
# Creator (https://creatorsim.github.io/creator/)
#

.data

   byte:       .byte    12

   .align 1
   half:       .half    34

.text
   main:

      # print byte value
      la a0, byte
      lb a0, 0(a0)
      li a7, 1
      ecall

      # print half value
      la a0, half
      lh a0, 0(a0)
      li a7, 1
      ecall

      # exit program
      li a7, 10
      ecall
`;

Deno.test(
    "Architecture-agnostic testing - RISC-V Basic Data Types and Print Operations",
    assertExecution("RISCV/RV32IMFD.yml", testAssembly, {
        registers: {
            a0: 0x22n, // a0 should contain 34 (0x22)
        },
        display: "1234", // Should show '1234' (12 followed by 34)
        keyboard: "", // Keyboard buffer should be empty
    }),
);
