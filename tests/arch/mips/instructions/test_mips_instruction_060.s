
#
# Creator (https://creatorsim.github.io/creator/)
#

    
.text
main:
    li.d $FP0, 256.0
  	li.d $FP2, 3481.0
    li.d $FP4, 5476.0
    
    li.s $f6, 9801.0
    li.s $f7, 8281.0
    li.s $f8, 9216.0
    
    sub.d $FP10, $FP0, $FP2
    sub.d $FP12, $FP2, $FP4
    sub.d $FP14, $FP4, $FP0
    
    sub.s $f16, $f6, $f7
    sub.s $f17, $f7, $f8
    sub.s $f18, $f8, $f6
    
    li $v0, 10
    syscall

