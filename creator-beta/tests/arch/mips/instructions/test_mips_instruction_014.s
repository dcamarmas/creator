
#
# Creator (https://creatorsim.github.io/creator/)
#

.data
    b1:		.byte 127

    .align 1
    h1:		.half 65535
    b2:		.space 1
    .align 1
    h2:		.space 2

.text
main:

    la $t0, b1
    la $t1, h1

    lbu $t2, 0($t0)
    lhu $t3, 0($t1)

    la $t4, b2
    sb $t5, 0($t4)

    la $t6, h2
    sh $t7, 0($t6)
