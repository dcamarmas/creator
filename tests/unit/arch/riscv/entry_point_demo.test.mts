import { assertExecution } from "../simulator-test-utils.mts";

const testAssembly = `
#
# Creator (https://creatorsim.github.io/creator/)
#
.text
  foo:
    # Not executed
    addi t0, x0, 1
    addi t1, x0, 2
    addi t2, x0, 3
    addi t3, x0, 4
    addi t4, x0, 5
  main:
    # Start of the program
    addi t0, t0, 5
    addi t1, t1, 5
    addi t2, t2, 5
    addi t3, t3, 5
    addi t4, t4, 5

    # exit program
    li a7, 10
    ecall
`;

Deno.test(
    "Architecture-agnostic testing - RISC-V Execution entry point",
    assertExecution("RISCV/RV32IMFD.yml", testAssembly, {
        registers: {
            t0: 5n,
            t1: 5n,
            t2: 5n,
            t3: 5n,
            t4: 5n,
        },
        display: "",
        keyboard: "",
    }),
);
