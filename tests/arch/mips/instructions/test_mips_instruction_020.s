
#
# Creator (https://creatorsim.github.io/creator/)
#

.text
main:

    li $t0, 16
    li $t1, 256
    li $t2, -8192
    li $t3, 24

    div $t2, $t0
    mfhi $s0
    mflo $s1
    div $t1, $t0
    mfhi $s2
    mflo $s3
    div $t2, $t3
    mfhi $s4
    mflo $s5
    div $t3, $t2

    jr $ra
