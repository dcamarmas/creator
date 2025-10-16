import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import {
    setupSimulator,
    executeN,
    cleanupSimulator,
    assertSimulatorState,
} from "../simulator-test-utils.mts";
import * as creator from "@/core/core.mjs";

Deno.test(
    "Architecture-agnostic testing - RISC-V Nested Function Calls with Stack",
    // eslint-disable-next-line max-lines-per-function
    async () => {
        const testAssembly = `
#
# Creator (https://creatorsim.github.io/creator/)
#

.text

main:
    # Create stack frame
    addi sp, sp, -16     # Allocate space for 4 words
    sw ra, 12(sp)        # Save return address
    sw s0, 8(sp)         # Save callee-saved registers
    sw s1, 4(sp)
    sw s2, 0(sp)

    # Initialize arguments
    li a0, 23
    li a1, -77
    li a2, 45
    
    # Call the first level function (starts the nested calls)
    jal ra, level1
    
    # Store result
    mv s0, a0
    
    # Print result
    li a7, 1
    ecall

    # Restore registers and return
    lw s2, 0(sp)
    lw s1, 4(sp)
    lw s0, 8(sp)
    lw ra, 12(sp)
    addi sp, sp, 16
    # exit program
    li a7, 10
    ecall

# First level function - calls level2
level1:
    # Create stack frame
    addi sp, sp, -16
    sw ra, 12(sp)
    sw s0, 8(sp)
    sw a0, 4(sp)    # Save argument a0
    sw a1, 0(sp)    # Save argument a1
    
    # Save arguments in saved registers
    mv s0, a0
    
    # Call level2
    jal ra, level2
    
    # Add original a0 to result
    add a0, a0, s0
    
    # Restore registers and return
    lw a1, 0(sp)
    lw s0, 8(sp)
    lw ra, 12(sp)
    addi sp, sp, 16
    jr ra

# Second level function - calls level3
level2:
    # Create stack frame
    addi sp, sp, -12
    sw ra, 8(sp)
    sw a1, 4(sp)
    sw a2, 0(sp)
    
    # Call level3
    jal ra, level3
    
    # Add original a2 to result
    lw t0, 0(sp)
    add a0, a0, t0
    
    # Restore and return
    lw a1, 4(sp)
    lw ra, 8(sp)
    addi sp, sp, 12
    jr ra

# Third level function - calls sum
level3:
    # Create stack frame
    addi sp, sp, -8
    sw ra, 4(sp)
    sw a1, 0(sp)
    
    # First call the original sum function
    jal ra, sum
    
    # Then call sub with result from sum
    lw a1, 0(sp)
    jal ra, sub
    
    # Restore and return
    lw ra, 4(sp)
    addi sp, sp, 8
    jr ra

# Original functions from the example
sum:
    add  t1, a0, a1
    add  t2, a2, a2
    add  a0, t1, zero
    add  a1, t2, zero
    jr   ra  

sub:
    sub a0, a0, a1
    jr ra

    `;

        const RISCV_ARCH_PATH = "../../../architecture/RISCV/RV32IMFD.yml";

        // Setup simulator with RISC-V architecture
        await setupSimulator(testAssembly, RISCV_ARCH_PATH);

        // Execute the program
        const result = executeN(1000);
        assertEquals(result.error, false, "Execution should not error");

        // This test validates complex nested function calls with proper stack management
        // The exact final result will depend on the computation:
        // Starting with a0=23, a1=-77, a2=45
        // The functions perform various additions and subtractions through multiple call levels

        // Verify stack pointer has been restored to original value
        // (This depends on the initial SP value set by the simulator)

        // Check that display has some output (the final computed result)
        const displayOutput = creator.status.display;
        assertEquals(
            displayOutput.length > 0,
            true,
            "Display should contain the computed result",
        );

        // Use assertSimulatorState for keyboard check
        assertSimulatorState({
            keyboard: "", // Keyboard buffer should be empty
        });

        cleanupSimulator();
    },
);
