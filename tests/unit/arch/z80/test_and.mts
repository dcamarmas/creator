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

// --- Tests for AND r ---

Deno.test("Z80 AND B - Basic logical AND", async () => {
    const testAssembly = `
        ld a, 0b11001100 ; 0xCC
        ld b, 0b10101010 ; 0xAA
        and b
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(3);
    // Result: 0xCC & 0xAA = 0x88 (10001000b)
    // S=1, Z=0, H=1, P/V=1 (even parity), N=0, C=0
    // F = S Z X H X P/V N C = 1 0 0 1 0 1 0 0 = 0x94
    assertSimulatorState({ registers: { A: 0x88n, B: 0xAAn, F: 0x94n } });
    cleanupSimulator();
});

Deno.test("Z80 AND C - Result is zero", async () => {
    const testAssembly = `
        ld a, 0b11001100 ; 0xCC
        ld c, 0b00110011 ; 0x33
        and c
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(3);
    // Result: 0xCC & 0x33 = 0x00
    // S=0, Z=1, H=1, P/V=1 (even parity), N=0, C=0
    // F = 01010100b = 0x54
    assertSimulatorState({ registers: { A: 0x00n, C: 0x33n, F: 0x54n } });
    cleanupSimulator();
});

Deno.test("Z80 AND A - Self AND (no change)", async () => {
    const testAssembly = `
        ld a, 0b10110101 ; 0xB5
        and a
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(2);
    // Result: 0xB5 & 0xB5 = 0xB5 (10110101b)
    // S=1, Z=0, H=1, P/V=0 (odd parity), N=0, C=0
    // F = 10010000b = 0x90
    assertSimulatorState({ registers: { A: 0xB5n, F: 0x90n } });
    cleanupSimulator();
});


// --- Tests for AND (HL) ---

const MEM_ADDR_HL_AND = 0x4100n;

Deno.test("Z80 AND (HL) - Logical AND with memory", async () => {
    const testAssembly = `
        ld hl, 0x${MEM_ADDR_HL_AND.toString(16)}
        ld a, 0b11100111  ; Load value 0xE7 into A
        ld (hl), a        ; Store it at the memory address
        ld a, 0b10111101  ; Load value 0xBD into A
        and (hl)
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(5);
    // A = 0xBD (10111101b), (HL) = 0xE7 (11100111b)
    // Result = 0xBD & 0xE7 = 0xA5 (10100101b)
    // S=1, Z=0, H=1, P/V=1 (even parity), N=0, C=0
    // F = 10010100b = 0x94
    assertSimulatorState({ registers: { A: 0xA5n, F: 0x94n } });
    assertEquals(getByteAtAddress(MEM_ADDR_HL_AND), 0xE7n);
    cleanupSimulator();
});

// --- Tests for AND n (immediate) ---

Deno.test("Z80 AND n - Logical AND with immediate value", async () => {
    const testAssembly = `
        ld a, 0b11111111
        and 0b00111100
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(2);
    // Result: 0xFF & 0x3C = 0x3C (00111100b)
    // S=0, Z=0, H=1, P/V=1 (even parity), N=0, C=0
    // F = 00010100b = 0x14
    assertSimulatorState({ registers: { A: 0x3Cn, F: 0x14n } });
    cleanupSimulator();
});

Deno.test("Z80 AND n - Masking lower nibble", async () => {
    const testAssembly = `
        ld a, 0xAB
        and 0xF0
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(2);
    // Result: 0xAB & 0xF0 = 0xA0 (10100000b)
    // S=1, Z=0, H=1, P/V=1 (even parity), N=0, C=0
    // F = 10010100b = 0x94
    assertSimulatorState({ registers: { A: 0xA0n, F: 0x94n } });
    cleanupSimulator();
});