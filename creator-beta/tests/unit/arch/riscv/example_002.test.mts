import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import {
    setupSimulator,
    executeN,
    cleanupSimulator,
    assertSimulatorState,
} from "../simulator-test-utils.mts";

Deno.test(
    "Architecture-agnostic testing - RISC-V Store Hello World without Data Segment",

    async () => {
        const testAssembly = `
#
# Creator (https://creatorsim.github.io/creator/)
# Example: Store "hello world" byte by byte without data segment
#

.text
   main:
      # Use a base memory address 
      li t1, 0x200000
      
      # Store "hello world" byte by byte
      # 'h' = 104
      li t0, 104
      sb t0, 0(t1)
      
      # 'e' = 101  
      li t0, 101
      sb t0, 1(t1)
      
      # 'l' = 108
      li t0, 108
      sb t0, 2(t1)
      
      # 'l' = 108
      li t0, 108
      sb t0, 3(t1)
      
      # 'o' = 111
      li t0, 111
      sb t0, 4(t1)
      
      # ' ' = 32 (space)
      li t0, 32
      sb t0, 5(t1)
      
      # 'w' = 119
      li t0, 119
      sb t0, 6(t1)
      
      # 'o' = 111
      li t0, 111
      sb t0, 7(t1)
      
      # 'r' = 114
      li t0, 114
      sb t0, 8(t1)
      
      # 'l' = 108
      li t0, 108
      sb t0, 9(t1)
      
      # 'd' = 100
      li t0, 100
      sb t0, 10(t1)
      
      # null terminator = 0
      li t0, 0
      sb t0, 11(t1)
      
      # Print the string (system call 4 - print string)
      mv a0, t1        # address of string
      li a7, 4         # system call for print string
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
                x5: 0x0n, // t0 - last value stored
                x6: 0x200000n, // t1 - base address
                x10: 0x200000n, // a0 - string address
            },
            memory: {
                "0x200000": 0x68n, // 'h' = 104
                "0x200001": 0x65n, // 'e' = 101
                "0x200002": 0x6cn, // 'l' = 108
                "0x200003": 0x6cn, // 'l' = 108
                "0x200004": 0x6fn, // 'o' = 111
                "0x200005": 0x20n, // ' ' = 32 (space)
                "0x200006": 0x77n, // 'w' = 119
                "0x200007": 0x6fn, // 'o' = 111
                "0x200008": 0x72n, // 'r' = 114
                "0x200009": 0x6cn, // 'l' = 108
                "0x20000a": 0x64n, // 'd' = 100
                "0x20000b": 0x0n, // null terminator
            },
            display: "hello world",
            keyboard: "",
        });

        cleanupSimulator();
    },
);
