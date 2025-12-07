import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import {
    setupSimulator,
    executeN,
    assertSimulatorState,
} from "../simulator-test-utils.mts";

const RISCV_ARCH_PATH = "../../../architecture/RISCV/RV32IMFD.yml";

const FLOATING_POINT_DEMO_ASSEMBLY = `
.data
    pi:         .float 3.14159265
    e:          .float 2.71828183
    radius:     .float 5.0
    
.text
main:
    # Load floating point constants
    la t0, pi
    flw f0, 0(t0)           # f0 = pi
    
    la t0, e
    flw f1, 0(t0)           # f1 = e
    
    la t0, radius
    flw f2, 0(t0)           # f2 = radius (5.0)
    
    # Mathematical operations
    fadd.s f3, f0, f1       # f3 = pi + e
    fmul.s f4, f0, f1       # f4 = pi * e
    
    # Circle area calculation: area = pi * radius^2
    fmul.s f5, f2, f2       # f5 = radius^2
    fmul.s f6, f0, f5       # f6 = pi * radius^2
    
    # exit program
    li a7, 10
    ecall
`;

Deno.test(
    "RISC-V Floating Point Operations Demo - Addition, Multiplication, and Conversion",
    async () => {
        // Setup simulator with RISC-V architecture that supports floating point
        await setupSimulator(FLOATING_POINT_DEMO_ASSEMBLY, RISCV_ARCH_PATH);

        // Execute the program
        const result = executeN(1000);
        assertEquals(result.error, false, "Execution should not error");

        // Single assertion for all floating point operations
        assertSimulatorState(
            {
                floatRegisters: {
                    f0: 3.14159265, // pi
                    f1: 2.71828183, // e
                    f2: 5.0, // radius
                    f3: 5.859874, // pi + e
                    f4: 8.53973422, // pi * e
                    f5: 25.0, // radius^2
                    f6: 78.539, // circle area (pi * r^2)
                },
            },
            {
                floatRegisterPrefix: "Floating point operations",
            },
            0.001,
        );
    },
);
