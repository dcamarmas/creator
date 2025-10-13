import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import {
    setupSimulator,
    executeN,
    cleanupSimulator,
    assertSimulatorState,
} from "../simulator-test-utils.mts";

Deno.test("MIPS Matrix Copy with Floats", async () => {
    const testAssembly = `

#
# Creator (https://creatorsim.github.io/creator/)
#

.data

  matrixA:  .word 0x34000000, 0x34000000, 0x34000000, 0x34000000
            .word 0x23450000, 0x00432210, 0x77512120, 0x14141414
            .word 0x00000214, 0x44551122, 0xAABFF012, 0x77D00000
            .word 0x0000FF23, 0x12345678, 0x87654321, 0x33441124

  matrixB:  .float 0.0, 0.0, 0.0, 0.0
            .float 0.0, 0.0, 0.0, 0.0
            .float 0.0, 0.0, 0.0, 0.0
            .float 0.0, 0.0, 0.0, 0.0

.text
main:
        la $t0, matrixA
        la $t1, matrixB
        li $t2, 4
        li $t3, 4
        move $t4, $zero
        move $t5, $zero
    
loop1:  beq $t2, $t4, end1
loop2:  beq $t3, $t5, end2
        l.s $f0, 0($t0)
        s.s $f0, 0($t1)
        addi $t0, $t0, 4
        addi $t1, $t1, 4
        addi $t5, $t5, 1
        b loop2
end2:   addi $t4, $t4, 1
        move $t5, $zero
        b loop1
end1:   li $v0, 10
        syscall

    `;

    const MIPS_ARCH_PATH = "../../../architecture/MIPS32.yml";

    // Setup simulator with MIPS architecture
    await setupSimulator(testAssembly, MIPS_ARCH_PATH);

    // Execute the program
    const result = executeN(1000);
    assertEquals(result.error, 0, "Execution should not error");

    // Assert all expected state using the wrapper function
    assertSimulatorState({
        registers: {
            r1: 0x200040n, // at
            r2: 0xan, // v0
            r8: 0x200040n, // t0
            r9: 0x200080n, // t1
            r10: 0x4n, // t2
            r11: 0x4n, // t3
            r12: 0x4n, // t4
        },
        memory: {
            "0x20007f": 0x24n,
            "0x20007e": 0x11n,
            "0x20007d": 0x44n,
            "0x20007c": 0x33n,
            "0x20007b": 0x21n,
            "0x20007a": 0x43n,
            "0x200079": 0x65n,
            "0x200078": 0x87n,
            "0x200077": 0x78n,
            "0x200076": 0x56n,
            "0x200075": 0x34n,
            "0x200074": 0x12n,
            "0x200073": 0x23n,
            "0x200072": 0xffn,
            "0x20006d": 0xd0n,
            "0x20006c": 0x77n,
            "0x20006b": 0x12n,
            "0x20006a": 0xf0n,
            "0x200069": 0xbfn,
            "0x200068": 0xaan,
            "0x200067": 0x22n,
            "0x200066": 0x11n,
            "0x200065": 0x55n,
            "0x200064": 0x44n,
            "0x200063": 0x14n,
            "0x200062": 0x02n,
            "0x20005f": 0x14n,
            "0x20005e": 0x14n,
            "0x20005d": 0x14n,
            "0x20005c": 0x14n,
            "0x20005b": 0x20n,
            "0x20005a": 0x21n,
            "0x200059": 0x51n,
            "0x200058": 0x77n,
            "0x200057": 0x10n,
            "0x200056": 0x22n,
            "0x200055": 0x43n,
            "0x200051": 0x45n,
            "0x200050": 0x23n,
            "0x20004c": 0x34n,
            "0x200048": 0x34n,
            "0x200044": 0x34n,
            "0x200040": 0x34n,
        },
        display: "", // Display buffer should be empty
        keyboard: "", // Keyboard buffer should be empty
    });

    cleanupSimulator();
});
