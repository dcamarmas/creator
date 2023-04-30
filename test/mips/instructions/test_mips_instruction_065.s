
#
# Creator (https://creatorsim.github.io/creator/)
#

    
.text
main:
    li.d $FP0, 256.0
  	li.d $FP2, -3481.0
    li.d $FP4, 5476.0
    
    li.s $f6, 9801.0
    li.s $f7, -8281.0
    li.s $f8, 9216.0
    
    cvt.d.s $FP10, $f6
    cvt.s.d $f12, $FP2
    
    li $v0, 10
    syscall

