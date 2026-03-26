
#
# Creator (https://creatorsim.github.io/creator/)
#


.text
main:

    li $t0, 10
    li $t1, 13
    li $t2, 45
    li $t3, -2

    multu $t0, $t1
    mfhi $s0
    mflo $s1
    multu $t1, $t2
    mfhi $s2
    mflo $s3
    multu $t2, $t3
    mfhi $s4
    mflo $s5
    multu $t3, $t4

    jr $ra
