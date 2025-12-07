
#
# Creator (https://creatorsim.github.io/creator/)
#

    
.text
main:
    li.d $FP0, 256.0
  	li.d $FP2, -3481.0
    
    li.s $f6, 9801.0
    li.s $f7, -8281.0
    
    cvt.w.d $t0, $FP0
    cvt.w.d $t1, $FP2
    
    cvt.w.s $t2, $f6
    cvt.w.s $t3, $f7
    
    li $v0, 10
    syscall

