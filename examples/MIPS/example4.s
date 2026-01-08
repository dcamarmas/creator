#
# Creator (https://creatorsim.github.io/creator/)
#
 
.data
    a: .double 34.544
    b: .double 11.443
    c: .double 665.4
    
    d: .space 24
    
.text
main:
    la $t0, a
    la $t1, b
    la $t2, c
    la $t3, d
    
    l.d $FP0, 0 ($t0)
    l.d $FP2, 0 ($t1)
    l.d $FP10, 0 ($t2)
    add.d $FP0, $FP0, $FP0
    sub.d $FP4, $FP10, $FP0
    div.d $FP12, $FP10, $FP2
    
    s.d $FP0, 0 ($t3)
    addi $t3, $t3, 8
    s.d $FP4, 0  ($t3)
    addi $t3, $t3, 8
    s.d $FP12, 0 ($t3)

    # exit
    li $v0, 10
    syscall
