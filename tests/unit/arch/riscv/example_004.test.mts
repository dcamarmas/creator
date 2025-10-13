import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import {
    setupSimulator,
    executeN,
    cleanupSimulator,
    assertSimulatorState,
} from "../simulator-test-utils.mts";
// This test has been verified with SPIKE
Deno.test(
    "Architecture-agnostic testing - RISC-V Double Precision Floating Point Operations",
    // eslint-disable-next-line max-lines-per-function
    async () => {
        const testAssembly = `

#
# Creator (https://creatorsim.github.io/creator/)
#
 
.data
    a: .double 34.544
    b: .double 11.443
    c: .double 665.4
    
    d: .zero 24
    
.text
main:
  
    la x5, a
    la x6, b
    la x7, c
    la x8, d
    
    fld   f0,  0(x5)
    fld   f2,  0(x6)
    fld   f10, 0(x7)
    fadd.d f0,  f0,  f0
    fsub.d f4,  f10, f0
    fdiv.d f12, f10, f2
    
    fsd  f0,  0(x8)
    addi x8, x8, 8
    fsd  f4,  0(x8)
    addi x8, x8, 8
    fsd  f12, 0(x8)

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
                x5: 0x200000n, // should contain 0x200000
                x6: 0x200008n, // should contain 0x200008
                x7: 0x200010n, // should contain 0x200010
                x8: 0x200028n, // should contain 0x200028
                f0: 0x405145a1cac08312n, // should contain 0x405145A1CAC08312
                f2: 0x4026e2d0e5604189n, // should contain 0x4026E2D0E5604189
                f4: 0x4082a27ef9db22d1n, // should contain 0x4082A27EF9DB22D1
                f10: 0x4084cb3333333333n, // should contain 0x4084CB3333333333
                f12: 0x404d13154689c3e9n, // should contain 0x404D13154689C3E9
            },
            memory: {
                // Original double values in memory
                "0x200000": 0x40n,
                "0x200001": 0x41n,
                "0x200002": 0x45n,
                "0x200003": 0xa1n,
                "0x200004": 0xcan,
                "0x200005": 0xc0n,
                "0x200006": 0x83n,
                "0x200007": 0x12n, // a: 34.544
                "0x200008": 0x40n,
                "0x200009": 0x26n,
                "0x20000a": 0xe2n,
                "0x20000b": 0xd0n,
                "0x20000c": 0xe5n,
                "0x20000d": 0x60n,
                "0x20000e": 0x41n,
                "0x20000f": 0x89n, // b: 11.443
                "0x200010": 0x40n,
                "0x200011": 0x84n,
                "0x200012": 0xcbn,
                "0x200013": 0x33n,
                "0x200014": 0x33n,
                "0x200015": 0x33n,
                "0x200016": 0x33n,
                "0x200017": 0x33n, // c: 665.4
                // Results stored by the program
                "0x200018": 0x40n,
                "0x200019": 0x51n,
                "0x20001a": 0x45n,
                "0x20001b": 0xa1n,
                "0x20001c": 0xcan,
                "0x20001d": 0xc0n,
                "0x20001e": 0x83n,
                "0x20001f": 0x12n, // f0: fadd.d result
                "0x200020": 0x40n,
                "0x200021": 0x82n,
                "0x200022": 0xa2n,
                "0x200023": 0x7en,
                "0x200024": 0xf9n,
                "0x200025": 0xdbn,
                "0x200026": 0x22n,
                "0x200027": 0xd1n, // f4: fsub.d result
                "0x200028": 0x40n,
                "0x200029": 0x4dn,
                "0x20002a": 0x13n,
                "0x20002b": 0x15n,
                "0x20002c": 0x46n,
                "0x20002d": 0x89n,
                "0x20002e": 0xc3n,
                "0x20002f": 0xe9n, // f12: fdiv.d result
            },
            display: "", // Display buffer should be empty
            keyboard: "", // Keyboard buffer should be empty
        });

        cleanupSimulator();
    },
);
