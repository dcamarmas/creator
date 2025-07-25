import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import {
    setupSimulator,
    executeN,
    cleanupSimulator,
    assertSimulatorState,
} from "../simulator-test-utils.mts";

const Z80_ARCH_PATH = "../../../architecture/Z80.yml";
const ASSEMBLER = "rasm";

// --- Helper Assembly Snippets for setting flags ---
const SET_Z_FLAG = `
    xor a      ; A = 0, Z flag is set
`;
const CLEAR_Z_FLAG = `
    ld a, 1    ; A = 1, Z flag is reset
`;
const SET_C_FLAG = `
    scf        ; Set Carry Flag
`;
const CLEAR_C_FLAG = `
    or a       ; Clears Carry Flag (assuming A=0)
`;
const SET_PV_FLAG_PE = `
    ld a, 3    ; P/V flag is set (Parity Even)
`;
const CLEAR_PV_FLAG_PO = `
    ld a, 2    ; P/V flag is reset (Parity Odd)
`;
const SET_S_FLAG = `
    ld a, 0x80 ; Sign flag is set
`;
const CLEAR_S_FLAG = `
    ld a, 0x7F ; Sign flag is reset
`;


// --- Tests for DJNZ ---
Deno.test("Z80 DJNZ - Jump is taken (backward)", async () => {
    const testAssembly = `
        ld b, 3
    loop:
        nop
        djnz loop
    after_loop:
        nop
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(7); // ld b,3; nop; djnz; nop; djnz; nop; djnz (falls through)
    assertSimulatorState({ registers: { B: 0n, PC: 0x05n } });
    cleanupSimulator();
});

Deno.test("Z80 DJNZ - Fall through on first run", async () => {
    const testAssembly = `
        ld b, 1
        djnz fall_through
        nop ; This should be executed
    fall_through:
        nop
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(2); // ld b,1; djnz (falls through)
    assertSimulatorState({ registers: { B: 0n, PC: 0x04n } });
    cleanupSimulator();
});

// --- Tests for JR e (Unconditional Relative Jump) ---
Deno.test("Z80 JR - Forward jump", async () => {
    const testAssembly = `
        jr forward
        nop ; Should be skipped
        nop
    forward:
        nop
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(1);
    assertSimulatorState({ registers: { PC: 0x04n } });
    cleanupSimulator();
});

// --- Tests for JR cc, e (Conditional Relative Jump) ---
Deno.test("Z80 JR Z,e - Jump taken", async () => {
    const testAssembly = `
        ${SET_Z_FLAG}
        jr z, target
        nop
    target:
        nop
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(2);
    assertSimulatorState({ registers: { PC: 0x04n } });
    cleanupSimulator();
});

Deno.test("Z80 JR NZ,e - No jump taken", async () => {
    const testAssembly = `
        ${SET_Z_FLAG}
        jr nz, target
    after_jump:
        nop
    target:
        nop
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(2);
    assertSimulatorState({ registers: { PC: 0x04n } });
    cleanupSimulator();
});

Deno.test("Z80 JR C,e - Jump taken", async () => {
    const testAssembly = `
        ${SET_C_FLAG}
        jr c, target
        nop
    target:
        nop
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(2);
    assertSimulatorState({ registers: { PC: 0x04n } });
    cleanupSimulator();
});

Deno.test("Z80 JR NC,e - No jump taken", async () => {
    const testAssembly = `
        ${SET_C_FLAG}
        jr nc, target
    after_jump:
        nop
    target:
        nop
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(3);
    assertSimulatorState({ registers: { PC: 0x04n } });
    cleanupSimulator();
});

// --- Tests for JP nn (Unconditional Absolute Jump) ---
Deno.test("Z80 JP nn - Jumps to absolute address", async () => {
    const testAssembly = `
        jp 0x1234
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(1);
    assertSimulatorState({ registers: { PC: 0x1234n } });
    cleanupSimulator();
});

// --- Tests for JP cc, nn (Conditional Absolute Jump) ---
Deno.test("Z80 JP Z,nn - Jump taken", async () => {
    const testAssembly = `
        ${SET_Z_FLAG}
        jp z, 0xABCD
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(2);
    assertSimulatorState({ registers: { PC: 0xABCDn } });
    cleanupSimulator();
});

Deno.test("Z80 JP Z,nn - No jump taken", async () => {
    const testAssembly = `
        ${CLEAR_Z_FLAG}
        jp z, 0xABCD
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(2);
    assertSimulatorState({ registers: { PC: 0x04n } }); // 2 bytes for ld a,1 + 3 bytes for jp = 5, PC should be at 4
    cleanupSimulator();
});

Deno.test("Z80 JP M,nn - Jump taken (Sign/Minus)", async () => {
    const testAssembly = `
        ${SET_S_FLAG}
        jp m, 0x4321
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(2);
    assertSimulatorState({ registers: { PC: 0x4321n } });
    cleanupSimulator();
});

Deno.test("Z80 JP P,nn - No jump taken (Sign/Plus)", async () => {
    const testAssembly = `
        ${SET_S_FLAG}
        jp p, 0x4321
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(2);
    assertSimulatorState({ registers: { PC: 0x04n } });
    cleanupSimulator();
});

Deno.test("Z80 JP PE,nn - Jump taken (Parity Even)", async () => {
    const testAssembly = `
        ${SET_PV_FLAG_PE}
        jp pe, 0xBEEF
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(2);
    assertSimulatorState({ registers: { PC: 0xBEEFn } });
    cleanupSimulator();
});

Deno.test("Z80 JP PO,nn - No jump taken (Parity Odd)", async () => {
    const testAssembly = `
        ${SET_PV_FLAG_PE}
        jp po, 0xBEEF
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(2);
    assertSimulatorState({ registers: { PC: 0x04n } });
    cleanupSimulator();
});

// --- Tests for JP (HL) ---
Deno.test("Z80 JP (HL) - Jumps to address in HL", async () => {
    const testAssembly = `
        ld hl, 0xABCD
        jp (hl)
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(2);
    assertSimulatorState({ registers: { PC: 0xABCDn } });
    cleanupSimulator();
});