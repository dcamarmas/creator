import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import {
    setupSimulator,
    executeN,
    cleanupSimulator,
    assertSimulatorState,
} from "../simulator-test-utils.mts";

Deno.test(
    "Architecture-agnostic testing - RISC-V Sum of First 10 Numbers",
    () => {
        const testAssembly = `

#
# Creator (https://creatorsim.github.io/creator/)
#

# Sum of the first 10 numbers from 0 to 9
.data
	max: .byte 10

.text
	main: 	    
		la   t0, max
		lb   t0, 0 (t0)
		li   t1, 0
		li   a0, 0
		
	while:	bge  t1, t0, end_while
		add  a0, a0, t1
		addi t1, t1, 1
		beq  zero, zero, while

    end_while: 	li a7, 1
		ecall # print_int

		#return
		jr ra

    `;

        const RISCV_ARCH_PATH = "../../../architecture/RISCV/RV32IMFD.yml";

        // Setup simulator with RISC-V architecture
        setupSimulator(testAssembly, RISCV_ARCH_PATH);

        // Execute the program
        const result = executeN(1000);
        assertEquals(result.error, false, "Execution should not error");

        // Assert all expected state using the wrapper function
        assertSimulatorState({
            registers: {
                x5: 0xan, // t0 should contain 0xa (10)
                x6: 0xan, // t1 should contain 0xa (10 - loop counter after completion)
                x10: 0x2dn, // a0 should contain 0x2d (45 - sum of 0+1+2+...+9)
                x17: 0x1n, // a7 should contain 0x1 (syscall number for print_int)
            },
            display: "45", // Display should show '45'
            keyboard: "", // Keyboard buffer should be empty
        });

        cleanupSimulator();
    },
);
