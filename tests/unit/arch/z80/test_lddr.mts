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

// --- Tests for LDDR ---

Deno.test("Z80 LDDR - Copies a block of memory backwards", async () => {
    const SRC_END_ADDR = 0x4002;
    const DEST_END_ADDR = 0x5002;
    const BYTE_COUNT = 3;

    const testAssembly = `
        ; --- Test Setup ---
        ; 1. Load the source memory area with data
        ld hl, ${SRC_END_ADDR - 2} ; Start at 0x4000
        ld a, 0xAA
        ld (hl), a          ; mem[0x4000] = 0xAA
        inc hl              ; hl = 0x4001
        ld a, 0xBB
        ld (hl), a          ; mem[0x4001] = 0xBB
        inc hl              ; hl = 0x4002
        ld a, 0xCC
        ld (hl), a          ; mem[0x4002] = 0xCC

        ; 2. Set up the registers for the LDDR instruction
        ; HL is already at the correct source end address (0x4002)
        ld de, ${DEST_END_ADDR}
        ld bc, ${BYTE_COUNT}

        ; --- Instruction Under Test ---
        lddr
    `;
    // Total instructions to execute: 9 (memory setup) + 2 (reg setup) + 1 (lddr) = 12
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(14);

    // Verify final register states
    assertSimulatorState({
        registers: {
            // BC should be 0 after copying 3 bytes
            B: 0x00n, C: 0x00n,
            // HL should be decremented by 3 from its starting value of 0x4002
            H: 0x3Fn, L: 0xFFn, // 0x4002 - 3 = 0x3FFF
            // DE should be decremented by 3 from its starting value of 0x5002
            D: 0x4Fn, E: 0xFFn, // 0x5002 - 3 = 0x4FFF
            // P/V flag (bit 2) is cleared because BC is 0. H and N are also cleared.
            F: 0x00n,
        },
    });

    // Verify that the memory was copied correctly to the destination
    assertEquals(getByteAtAddress(BigInt(DEST_END_ADDR - 2)), 0xAAn, "Byte at 0x5000 should be 0xAA");
    assertEquals(getByteAtAddress(BigInt(DEST_END_ADDR - 1)), 0xBBn, "Byte at 0x5001 should be 0xBB");
    assertEquals(getByteAtAddress(BigInt(DEST_END_ADDR)), 0xCCn, "Byte at 0x5002 should be 0xCC");

    cleanupSimulator();
});

Deno.test("Z80 LDDR - Preserves S, Z, C flags", async () => {
    // This test sets the Z and C flags, then runs LDDR.
    // LDDR should not affect Z and C, but should reset P/V, H, and N.
    const SRC_ADDR = 0x4050;
    const DEST_ADDR = 0x5050;

    const testAssembly = `
        ; --- Test Setup ---
        ; 1. Set up flags: Z=1, C=1
        xor a       ; Sets Z=1, P/V=1, A=0. Clears C,H,N,S. F becomes 0x44
        scf         ; Sets C=1. Does not affect Z. F becomes 0x45

        ; 2. Set up memory and registers for LDDR
        ld hl, ${SRC_ADDR}
        ld a, 0x12  ; Put a byte in source memory
        ld (hl), a
        ld de, ${DEST_ADDR}
        ld bc, 1

        ; --- Instruction Under Test ---
        lddr
    `;

    // Total instructions: 2 (flag setup) + 5 (reg/mem setup) + 1 (lddr) = 8
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(8);

    // Expected final flag state:
    // S is preserved (was 0)
    // Z is preserved (was 1 from XOR A) -> Bit 6 set
    // F5 is preserved (was 0)
    // H is reset -> Bit 4 clear
    // F3 is preserved (was 0)
    // P/V is reset (BC became 0) -> Bit 2 clear
    // N is reset -> Bit 1 clear
    // C is preserved (was 1 from SCF) -> Bit 0 set
    // Final F = 0b01000001 = 0x41
    assertSimulatorState({
        registers: {
            B: 0x00n, C: 0x00n,
            F: 0x41n,
        },
    });
    
    // Verify memory was copied
    assertEquals(getByteAtAddress(BigInt(DEST_ADDR)), 0x12n);
    
    cleanupSimulator();
});