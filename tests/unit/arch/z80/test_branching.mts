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

// --- Tests for PUSH ---

Deno.test("Z80 PUSH BC - Pushes BC onto stack", async () => {
    const testAssembly = `
        ld sp, 0x5000
        ld bc, 0x1234
        push bc
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(3);
    assertSimulatorState({ registers: { SP: 0x4FFEn } });
    assertEquals(getByteAtAddress(0x4FFFn), 0x12n, "SP-1 should hold B");
    assertEquals(getByteAtAddress(0x4FFEn), 0x34n, "SP-2 should hold C");
    cleanupSimulator();
});

Deno.test("Z80 PUSH DE - Pushes DE onto stack", async () => {
    const testAssembly = `
        ld sp, 0x5000
        ld de, 0x5678
        push de
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(3);
    assertSimulatorState({ registers: { SP: 0x4FFEn } });
    assertEquals(getByteAtAddress(0x4FFFn), 0x56n, "SP-1 should hold D");
    assertEquals(getByteAtAddress(0x4FFEn), 0x78n, "SP-2 should hold E");
    cleanupSimulator();
});

Deno.test("Z80 PUSH HL - Pushes HL onto stack", async () => {
    const testAssembly = `
        ld sp, 0x5000
        ld hl, 0x9ABC
        push hl
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(3);
    assertSimulatorState({ registers: { SP: 0x4FFEn } });
    assertEquals(getByteAtAddress(0x4FFFn), 0x9An, "SP-1 should hold H");
    assertEquals(getByteAtAddress(0x4FFEn), 0xBCn, "SP-2 should hold L");
    cleanupSimulator();
});

Deno.test("Z80 PUSH AF - Pushes AF onto stack", async () => {
    const testAssembly = `
        ld sp, 0x5000
        ld a, 0xDE
        scf ; Set carry, F will be 0x01
        push af
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(4);
    assertSimulatorState({ registers: { SP: 0x4FFEn } });
    assertEquals(getByteAtAddress(0x4FFFn), 0xDEn, "SP-1 should hold A");
    assertEquals(getByteAtAddress(0x4FFEn), 0x01n, "SP-2 should hold F");
    cleanupSimulator();
});


// --- Tests for POP ---

Deno.test("Z80 POP BC - Pops from stack into BC", async () => {
    const testAssembly = `
        ld sp, 0x4FFE
        ld hl, 0x1234
        ld (0x4FFE), hl ; Manual push: low byte at low addr
        pop bc
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(4); // ld sp, ld hl, pop bc
    assertSimulatorState({ registers: { B: 0x12n, C: 0x34n, SP: 0x5000n } });
    cleanupSimulator();
});

Deno.test("Z80 POP DE - Pops from stack into DE", async () => {
    const testAssembly = `
        ld sp, 0x4FFE
        ld hl, 0x5678
        ld (0x4FFE), hl ; Manual push
        pop de
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(4);
    assertSimulatorState({ registers: { D: 0x56n, E: 0x78n, SP: 0x5000n } });
    cleanupSimulator();
});

Deno.test("Z80 POP HL - Pops from stack into HL", async () => {
    const testAssembly = `
        ld sp, 0x5000      ; Start SP at the top of the stack
        ld bc, 0x9ABC      ; Load the value we want to push
        push bc            ; Push it onto the stack. SP is now 0x4FFE
        pop hl             ; Pop it back into HL. SP is now 0x5000
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(4);
    assertSimulatorState({ registers: { H: 0x9An, L: 0xBCn, SP: 0x5000n } });
    cleanupSimulator();
});
Deno.test("Z80 POP AF - Pops from stack into AF", async () => {
    const testAssembly = `
        ld sp, 0x5000      ; Start SP at the top
        ld hl, 0xDE81      ; Load desired A (DE) and F (81) values into HL
        push hl            ; Push HL onto the stack. SP is now 0x4FFE
        pop af             ; Pop the value into AF. SP is now 0x5000
    `;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(4);
    assertSimulatorState({ registers: { A: 0xDEn, F: 0x81n, SP: 0x5000n } });
    cleanupSimulator();
});

// --- Tests for CALL and RET ---

Deno.test("Z80 CALL/RET - Unconditional call and return", async () => {
    const testAssembly = `
        ld sp, 0x8000
        call subroutine
    after_call:
        nop
    subroutine:
        nop
        ret
    `;
    const initialPC = 0x06n; // Address after CALL instruction
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(4); // ld sp, call, nop, ret
    assertSimulatorState({ registers: { PC: initialPC, SP: 0x8000n } });
    cleanupSimulator();
});

Deno.test("Z80 CALL cc/RET cc - Conditional call taken, conditional return taken", async () => {
    const testAssembly = `
        ld sp, 0x8000
        ${SET_Z_FLAG}
        call z, subroutine
    after_call:
        nop
    subroutine:
        ${SET_C_FLAG}
        ret c
    `;
    const initialPC = 0x05n; // Address after CALL instruction
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(5); // ld sp, xor a, call z, scf, ret c
    assertSimulatorState({ registers: { PC: initialPC, SP: 0x8000n } });
    cleanupSimulator();
});

Deno.test("Z80 CALL cc/RET cc - Conditional call not taken", async () => {
    const testAssembly = `
        ld sp, 0x8000
        ${CLEAR_Z_FLAG}
        call z, subroutine
    after_call:
        nop
    subroutine:
        nop
        ret
    `;
    const initialPC = 0x05n; // Address after CALL instruction
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(3); // ld sp, ld a, call z (not taken)
    assertSimulatorState({ registers: { PC: initialPC, SP: 0x8000n } });
    cleanupSimulator();
});

Deno.test("Z80 CALL cc/RET cc - Conditional return not taken", async () => {
    const testAssembly = `
        ld sp, 0x8000
        call subroutine
    after_call:
        nop
    subroutine:
        ${CLEAR_C_FLAG}
        ret c
        nop ; Should execute this
        ret ; Unconditional return
    `;
    const initialPC = 0x06n;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(6); // ld sp, call, or a, ret c(not taken), nop, ret
    assertSimulatorState({ registers: { PC: initialPC, SP: 0x8000n } });
    cleanupSimulator();
});


// --- Tests for RST ---

Deno.test("Z80 RST 18h - Jumps to 0x0018 and pushes PC", async () => {
    const testAssembly = `
        ld sp, 0x9000
        rst 18h ; this instruction is at 0x0003
    `;
    const returnAddress = 0x0004n; // Address after RST instruction
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(2);
    assertSimulatorState({ registers: { PC: 0x0018n, SP: 0x8FFEn }, memory: { "0x8FFE": returnAddress } });

    cleanupSimulator();
});

Deno.test("Z80 RST 38h - Jumps to 0x0038 and pushes PC", async () => {
    const testAssembly = `
        ld sp, 0x9000
        rst 38h ; this instruction is at 0x0003
    `;
    const returnAddress = 0x0004n;
    await setupSimulator(testAssembly, Z80_ARCH_PATH, ASSEMBLER);
    executeN(2);
    assertSimulatorState({ registers: { PC: 0x0038n, SP: 0x8FFEn }, memory: { "0x8FFE": returnAddress } });
    cleanupSimulator();
});