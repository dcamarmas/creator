
#
# Creator (https://creatorsim.github.io/creator/)
#

    
.text
main:
    li $t0, 123566
    li $t1, -2345574
    li $t2, 0x23467FF
    
    li $t3, -5656673
    li $t4, 7899
    li $t5, 5678
    
    cvt.d.w $FP0, $t0
    cvt.d.w $FP2, $t1
    cvt.d.w $FP4, $t2
    
    cvt.s.w $f6, $t3
    cvt.s.w $f7, $t4
    cvt.s.w $f8, $t5
    
    li $v0, 10
    syscall

