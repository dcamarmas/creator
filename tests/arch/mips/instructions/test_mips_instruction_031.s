
#
# Creator (https://creatorsim.github.io/creator/)
#

.data
    a: .double 34.544
    b: .double 11.443
    c: .double 0x7544FFB

    d: .space 24

.text
main:
    la $t0, a
    la $t1, b
    la $t2, c
    la $t3, d

    l.d   $FP0,  0($t0)
    l.d   $FP2,  0($t1)
    l.d   $FP4,  0($t2)

    s.d  $FP0,  0($t3)
    addi $t3, $t3, 8
    s.d  $FP2,  0($t3)
    addi $t3, $t3, 8
    s.d  $FP4, 0($t3)

    li $v0, 10
    syscall
