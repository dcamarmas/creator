
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
    div $t1, $t0
    div $t2, $t3
    div $t3, $t2
