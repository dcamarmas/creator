
#
# Creator (https://creatorsim.github.io/creator/)
#

.data
    b1:		.byte 127, -42

    .align 1
    h1:		.half 32767, -12345
    .align 2
    b2:		.space 2
    .align 1
    h2:		.space 4

.text
main:

    la $t0, b1
    la $t1, h1

    lbu $t2, 0($t0)
    lbu $s0, 1($t0)
    lhu $t3, 0($t1)
    lhu $s1, 2($t1)

    la $t4, b2
    sb $t2, 0($t4)
    sb $s0, 1($t4)

    la $t6, h2
    sh $t3, 0($t6)
    sh $s1, 2($t6)

    jr $ra
