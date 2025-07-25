import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import {
    setupSimulator,
    executeN,
    cleanupSimulator,
    assertSimulatorState,
    getByteAtAddress,
} from "../simulator-test-utils.mts";

const Z80_ARCH_PATH = "../../../architecture/Z80.yml";
const ASSEMBLER = "rasm";

// Helper to set Carry flag to 1. Assumes F starts at 0.
const SET_CARRY_FLAG = `
    scf          ; Set Carry Flag (C=1)
`;

// --- Tests for INC B ---

Deno.test("Z80 INC B - Normal increment", async () => {
    const testAssembly = `
        ld b, 0x41
        inc b
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(2);
    // Result 0x42. F = 0000 0000 = 0x00
    assertSimulatorState({ registers: { B: 0x42n, F: 0x00n } });
    cleanupSimulator();
});

Deno.test("Z80 INC B - Increment to zero (Zero Flag)", async () => {
    const testAssembly = `
        ld b, 0xff
        inc b
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(2);
    // Result 0x00. S=0, Z=1, H=1, P/V=0, N=0. F = 0101 0000 = 0x50
    assertSimulatorState({ registers: { B: 0x00n, F: 0x50n } });
    cleanupSimulator();
});

Deno.test("Z80 INC B - Increment causing Half-Carry", async () => {
    const testAssembly = `
        ld b, 0x0f
        inc b
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(2);
    // Result 0x10. S=0, Z=0, H=1, P/V=0, N=0. F = 0001 0000 = 0x10
    assertSimulatorState({ registers: { B: 0x10n, F: 0x10n } });
    cleanupSimulator();
});

Deno.test("Z80 INC B - Increment causing Overflow (Sign Flag)", async () => {
    const testAssembly = `
        ld b, 0x7f
        inc b
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(2);
    // Result 0x80. S=1, Z=0, H=1, P/V=1, N=0. F = 1001 0100 = 0x94
    assertSimulatorState({ registers: { B: 0x80n, F: 0x94n } });
    cleanupSimulator();
});

Deno.test("Z80 INC B - Carry flag is preserved", async () => {
    const testAssembly = `
        ${SET_CARRY_FLAG}
        ld b, 0x33
        inc b
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(3);
    // After inc, B=0x34.

    // F should have only Carry flag set.
    // F = 0000 0001 = 0x01
    assertSimulatorState({ registers: { B: 0x34n, F: 0x01n } });
    cleanupSimulator();
});

// --- Tests for INC D and INC H ---

Deno.test("Z80 INC D - Normal Increment", async () => {
    const testAssembly = `
        ld d, 0x55
        inc d
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(2);
    // Result 0x56. F = 0000 0000 = 0x00
    assertSimulatorState({ registers: { D: 0x56n, F: 0x00n } });
    cleanupSimulator();
});

Deno.test("Z80 INC H - Overflow", async () => {
    const testAssembly = `
        ld h, 0x7f
        inc h
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(2);
    // Result 0x80. S=1, Z=0, H=1, P/V=1, N=0. F = 1001 0100 = 0x94
    assertSimulatorState({ registers: { H: 0x80n, F: 0x94n } });
    cleanupSimulator();
});

// --- Tests for INC (HL) ---

const MEM_ADDR_HL = 0x4000n;

Deno.test("Z80 INC (HL) - Normal increment of memory", async () => {
    const testAssembly = `
        ld hl, 0x${MEM_ADDR_HL.toString(16)}
        ld a, 0x41
        ld (hl), a
        inc (hl)
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(4);
    // Memory at 0x4000 is 0x42. F = 0000 0000 = 0x00
    assertSimulatorState({ registers: { H: 0x40n, L: 0x00n, F: 0x00n } });
    assertEquals(getByteAtAddress(MEM_ADDR_HL), 0x42n);
    cleanupSimulator();
});

Deno.test("Z80 INC (HL) - Increment memory to zero (Zero Flag)", async () => {
    const testAssembly = `
        ld hl, 0x${MEM_ADDR_HL.toString(16)}
        ld a, 0xff
        ld (hl), a
        inc (hl)
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(4);
    // Memory at 0x4000 is 0x00. F = 0101 0000 = 0x50
    assertSimulatorState({ registers: { H: 0x40n, L: 0x00n, F: 0x50n } });
    assertEquals(getByteAtAddress(MEM_ADDR_HL), 0x00n);
    cleanupSimulator();
});

Deno.test("Z80 INC (HL) - Carry flag is preserved", async () => {
    const testAssembly = `
        ${SET_CARRY_FLAG}
        ld hl, 0x${MEM_ADDR_HL.toString(16)}
        ld a, 0x33
        ld (hl), a
        inc (hl)
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(5);
    // Memory at 0x4000 is 0x34. F = 0000 0001 = 0x01
    assertSimulatorState({ registers: { H: 0x40n, L: 0x00n, F: 0x01n } });
    assertEquals(getByteAtAddress(MEM_ADDR_HL), 0x34n);
    cleanupSimulator();
});

// --- Tests for INC BC ---

Deno.test("Z80 INC BC - Normal increment", async () => {
    const testAssembly = `
        ld bc, 0x1234
        inc bc
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(2);
    assertSimulatorState({ registers: { B: 0x12n, C: 0x35n } });
    cleanupSimulator();
});

Deno.test("Z80 INC BC - Wraparound from 0xFFFF to 0x0000", async () => {
    const testAssembly = `
        ld bc, 0xFFFF
        inc bc
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(2);
    assertSimulatorState({ registers: { B: 0x00n, C: 0x00n } });
    cleanupSimulator();
});

Deno.test("Z80 INC BC - Flags are not affected", async () => {
    const testAssembly = `
        ${SET_CARRY_FLAG}
        ld bc, 0x1000
        inc bc
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(3);
    // F should have only Carry flag set.
    assertSimulatorState({ registers: { B: 0x10n, C: 0x01n, F: 0x01n } });
    cleanupSimulator();
});

// --- Tests for INC DE ---

Deno.test("Z80 INC DE - Normal increment", async () => {
    const testAssembly = `
        ld de, 0x5678
        inc de
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(2);
    assertSimulatorState({ registers: { D: 0x56n, E: 0x79n } });
    cleanupSimulator();
});

Deno.test("Z80 INC DE - Wraparound from 0xFFFF to 0x0000", async () => {
    const testAssembly = `
        ld de, 0xFFFF
        inc de
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(2);
    assertSimulatorState({ registers: { D: 0x00n, E: 0x00n } });
    cleanupSimulator();
});

// --- Tests for INC HL ---

Deno.test("Z80 INC HL - Normal increment", async () => {
    const testAssembly = `
        ld hl, 0x8899
        inc hl
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(2);
    assertSimulatorState({ registers: { H: 0x88n, L: 0x9An } });
    cleanupSimulator();
});

Deno.test("Z80 INC HL - Wraparound from 0xFFFF to 0x0000", async () => {
    const testAssembly = `
        ld hl, 0xFFFF
        inc hl
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(2);
    assertSimulatorState({ registers: { H: 0x00n, L: 0x00n } });
    cleanupSimulator();
});

// --- Tests for INC SP ---

Deno.test("Z80 INC SP - Normal increment", async () => {
    const testAssembly = `
        ld sp, 0xFFFE
        inc sp
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(2);
    assertSimulatorState({ registers: { SP: 0xFFFFn } });
    cleanupSimulator();
});

Deno.test("Z80 INC SP - Wraparound from 0xFFFF to 0x0000", async () => {
    const testAssembly = `
        ld sp, 0xFFFF
        inc sp
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(2);
    assertSimulatorState({ registers: { SP: 0x0000n } });
    cleanupSimulator();
});