import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import {
    setupSimulator,
    executeN,
    cleanupSimulator,
    assertSimulatorState,
} from "../simulator-test-utils.mts";

Deno.test("Architecture-agnostic testing - RISC-V Array Sum Loop", async () => {
    const testAssembly = `

#
# Creator (https://creatorsim.github.io/creator/)
#

.data
  w3: .word 1, 2, 3, 4, 5

.text
main:

  li  t3,  1
  li  t4,  4
  la  t5,  w3
  li  t0,  0

  # loop initialization
  li  t1,  0
  li  t2,  5

  # loop header
loop1: beq t1, t2, end1      # if(t1 == t2) --> jump to fin1

  # loop body
  mul t6, t1, t4             # t1 * t4 -> t6
  lw  t6, 0(t5)              # Memory[t5] -> t6
  add t0, t0, t6             # t6 + t0 -> t0

  # loop next...
  add  t1, t1, t3            # t1 + t3 -> t1
  addi t5, t5, 4
  beq  x0, x0, loop1

  # loop end
end1: 
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
            x5: 0xfn, // t0 should contain 0xf (15 - sum of 1+2+3+4+5)
            x6: 0x5n, // t1 should contain 0x5 (loop counter after completion)
            x7: 0x5n, // t2 should contain 0x5 (loop limit)
            x28: 0x1n, // t3 should contain 0x1 (increment value)
            x29: 0x4n, // t4 should contain 0x4 (word size)
            x30: 0x200014n, // t5 should contain 0x200014 (final array pointer)
            x31: 0x5n, // t6 should contain 0x5 (last loaded value)
        },
        display: "", // Display buffer should be empty
        keyboard: "", // Keyboard buffer should be empty
    });

    cleanupSimulator();
});
