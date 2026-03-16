import { assertExecution } from "../simulator-test-utils.mts";

const testAssembly = `
#
# Creator (https://creatorsim.github.io/creator/)
#

.data
	w1:		.word 14
    b1:		.byte 120

    .align 1
    h1:		.half 22
    w2:		.space 4
    b2:		.space 1

    .align 1
    h2:		.space 2

.text
main:

    la $t0, w1		#w1 address -> $t0
    la $t1, b1		#b1 address -> $t1
    la $t2, h1		#h1 address -> $t2

    lw $t3, 0($t0)	#Memory[$t0] -> $t3
    lw $t4, w1		#Memory[w1]  -> $t4

    lb $t5, 0($t1)	#Memory[$t1] -> $t5
    lb $t6, b1		#Memory[b1]  -> $t6

    lh $t7, 0($t2)	#Memory[$t2] -> $t7
    lh $t8, h1		#Memory[h1]  -> $t8

    sw $t3, w2		#$t3 -> Memory[w2]
    sb $t5, b2		#$t5 -> Memory[b2]
    sh $t7, h2		#$t7 -> Memory[h2]
    jr $ra
`;

Deno.test(
    "MIPS Data Types and Memory Operations",
    assertExecution("MIPS32.yml", testAssembly, {
        registers: {
            "1": 0x20000en, // at
            "8": 0x200000n, // t0
            "9": 0x200004n, // t1
            "10": 0x200006n, // t2
            "11": 0xen, // t3
            "12": 0xen, // t4
            "13": 0x78n, // t5
            "14": 0x78n, // t6
            "15": 0x16n, // t7
            "24": 0x16n, // t8
        },
        memory: {
            "0x20000f": 0x16n,
            "0x20000c": 0x78n,
            "0x20000b": 0xen,
        },
        display: "", // Display buffer should be empty
        keyboard: "", // Keyboard buffer should be empty
    }),
);
