
.section .text

.globl _start

_start:

        addi t0, zero, 0xbb 
        addi t1, zero, 0xbb
        addi t2, zero, 0xbb
        addi t3, zero, 0xbb
        addi t4, zero, 0xbb
        addi t5, zero, 0xbb
        1: j 1b # wait for termination
