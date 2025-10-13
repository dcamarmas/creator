import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import {
    setupSimulator,
    executeN,
    cleanupSimulator,
    assertSimulatorState,
} from "../simulator-test-utils.mts";

Deno.test(
    "Architecture-agnostic testing - RISC-V Branch and Jump Operations",
    async () => {
        const testAssembly = `

#
# Creator (https://creatorsim.github.io/creator/)
#

.text
    main:

      li  t0, 4
      li  t1, 2
      li  t3, 5
      bge t3, t0, jump1
      
    jump2: 
      li t3, 34
      li a7, 10
      ecall

    jump1:
      li t4, 11
      li t5, 555
      beq x0, x0, jump2

      # exit program
      li a7, 10
      ecall

    `;

        const RISCV_ARCH_PATH = "../../../architecture/RISCV/RV32IMFD.yml";

        // Setup simulator with RISC-V architecture
        await setupSimulator(testAssembly, RISCV_ARCH_PATH);

        // Execute the program
        const result = executeN(1000);
        assertEquals(result.error, 0, "Execution should not error");

        // Assert all expected state using the wrapper function
        assertSimulatorState({
            registers: {
                x5: 0x4n, // t0 should contain 0x4
                x6: 0x2n, // t1 should contain 0x2
                x17: 0xan, // a7 should contain 0xa (syscall 10 - exit)
                x28: 0x22n, // t3 should contain 0x22 (34 in decimal)
                x29: 0xbn, // t4 should contain 0xb (11 in decimal)
                x30: 0x22bn, // t5 should contain 0x22b (555 in decimal)
            },
            display: "", // Display buffer should be empty
            keyboard: "", // Keyboard buffer should be empty
        });

        cleanupSimulator();
    },
);
