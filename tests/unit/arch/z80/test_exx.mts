import {
    setupSimulator,
    executeN,
    cleanupSimulator,
    assertSimulatorState,
} from "../simulator-test-utils.mts";

const Z80_ARCH_PATH = "../../../architecture/Z80.yml";
const ASSEMBLER = "rasm";

// --- Tests for EXX ---

Deno.test("Z80 EXX - Swaps main and alternate register sets", async () => {
    const testAssembly = `
        ; Step 1: Load main registers
        ld bc, 0x1122
        ld de, 0x3344
        ld hl, 0x5566

        ; Step 2: Swap to alternate set and load it
        exx
        ld bc, 0xAABB
        ld de, 0xCCDD
        ld hl, 0xEEFF

        ; Step 3: Swap back to main set
        exx

        ; Step 4: Swap to alternate set again
        exx
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);

    // After Step 1 (3 instructions: ld, ld, ld)
    executeN(3);
    assertSimulatorState({
        registers: {
            B: 0x11n, C: 0x22n,
            D: 0x33n, E: 0x44n,
            H: 0x55n, L: 0x66n,
            // Alternate registers should be at their default (0)
            B_prime: 0n, C_prime: 0n,
            D_prime: 0n, E_prime: 0n,
            H_prime: 0n, L_prime: 0n,
        },
    });

    // After Step 2 (4 instructions: exx, ld, ld, ld)
    executeN(4);
    assertSimulatorState({
        registers: {
            // Main registers now hold the values loaded into the alternate set
            B: 0xAAn, C: 0xBBn,
            D: 0xCCn, E: 0xDDn,
            H: 0xEEn, L: 0xFFn,
            // Alternate registers now hold the original main set values
            B_prime: 0x11n, C_prime: 0x22n,
            D_prime: 0x33n, E_prime: 0x44n,
            H_prime: 0x55n, L_prime: 0x66n,
        },
    });

    // After Step 3 (1 instruction: exx)
    executeN(1);
    assertSimulatorState({
        registers: {
            // Main registers are restored to their original values
            B: 0x11n, C: 0x22n,
            D: 0x33n, E: 0x44n,
            H: 0x55n, L: 0x66n,
            // Alternate registers hold the second set of values
            B_prime: 0xAAn, C_prime: 0xBBn,
            D_prime: 0xCCn, E_prime: 0xDDn,
            H_prime: 0xEEn, L_prime: 0xFFn,
        },
    });

    // After Step 4 (1 instruction: exx)
    executeN(1);
    assertSimulatorState({
        registers: {
            // Main registers are swapped back to the alternate values
            B: 0xAAn, C: 0xBBn,
            D: 0xCCn, E: 0xDDn,
            H: 0xEEn, L: 0xFFn,
            // Alternate registers are back to the original values
            B_prime: 0x11n, C_prime: 0x22n,
            D_prime: 0x33n, E_prime: 0x44n,
            H_prime: 0x55n, L_prime: 0x66n,
        },
    });
    
    cleanupSimulator();
});

Deno.test("Z80 EXX - Flags are not affected", async () => {
    const testAssembly = `
        scf  ; Set Carry flag
        exx
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);

    // Initial state after scf
    executeN(1);
    assertSimulatorState({ registers: { F: 0x01n } }); // C_FLAG is bit 0

    // After exx
    executeN(1);
    // The Carry flag should be preserved
    assertSimulatorState({ registers: { F: 0x01n } });

    cleanupSimulator();
});