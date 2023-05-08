
#
# Creator (https://creatorsim.github.io/creator/)
#

.data
    w1:		.word 14
    b1:		.byte 127

    .align 1
    h1:		.half 32767
    w2:		.space 4
    b2:		.space 1

    .align 1
    h2:		.space 2

.text
main:

    la $t0, w1
    la $t1, b1
    la $t2, h1

    lw $t3, 0($t0)
    lw $t4, w1

    lb $t5,  0($t1)
    lbu $t6, b1

    lh $t7,  0($t2)
    lhu $t8, h1

    la $t9, w2
    sw $t3, 0($t9)

    la $t9, b2
    sb $t5, 0($t9)

    la $t9, h2
    sh $t7, 0($t9)	
