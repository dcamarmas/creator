import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import {
    setupSimulator,
    executeN,
    cleanupSimulator,
    assertSimulatorState,
} from "../simulator-test-utils.mts";

Deno.test(
    "Architecture-agnostic testing - RISC-V Basic Data Types and Print Operations",
    async () => {
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

        const RISCV_ARCH_PATH = "../../../architecture/RISCV/RV32IMFD.yml";

        // Setup simulator with RISC-V architecture
        await setupSimulator(testAssembly, RISCV_ARCH_PATH);

        // Execute the program
        const result = executeN(1000);
        assertEquals(result.error, false, "Execution should not error");

        // Assert all expected state using the wrapper function
        assertSimulatorState({
            registers: {
                x10: 0x22n, // a0 should contain 34 (0x22)
            },
            display: "1234", // Should show '1234' (12 followed by 34)
            keyboard: "", // Keyboard buffer should be empty
        });

        cleanupSimulator();
    },
);
