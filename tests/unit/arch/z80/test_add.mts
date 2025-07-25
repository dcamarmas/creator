import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import {
    setupSimulator,
    executeN,
    cleanupSimulator,
    assertSimulatorState,
} from "../simulator-test-utils.mts";

Deno.test(
    "Demo Test - Z80 Increment Memory",
    async () => {
        const testAssembly = `

start:
    ld hl, 0x4000  ; Load HL with 0x4000
    inc (hl)       ; Increment the value at memory address 0x4000

    `;

        const Z80_ARCH_PATH = "../../../architecture/Z80.yml";

        // Setup simulator with Z80 architecture
        await setupSimulator(testAssembly, Z80_ARCH_PATH, "rasm");

        // Execute the program
        const result = executeN(1000);
        assertEquals(result.error, false, "Execution should not error");

        // Assert all expected state using the wrapper function
        assertSimulatorState({
            registers: {
                H: 0x40n, // H should contain 64 (0x40)
                L: 0x00n, // L should contain 0 (0x00)
            },
            display: "", // Display should be empty
            keyboard: "", // Keyboard buffer should be empty
        });

        cleanupSimulator();
    },
);
