
#
# Creator (https://creatorsim.github.io/creator/)
#

.text
main:

    li $t0, 16
    li $t1, 256
    li $t2, -8192
    li $t3, 24

    divu $t4, $t2, $t0
    divu $t5, $t1, $t0
    divu $t6, $t2, $t3
    divu $t7, $t3, $t2
