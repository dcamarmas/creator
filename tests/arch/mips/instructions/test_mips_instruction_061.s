
#
# Creator (https://creatorsim.github.io/creator/)
#

    
.text
main:
    li.d $FP0, 256.0
  	li.d $FP2, -3481.0
    li.d $FP4, 5476.0
    
    li.s $f6, -9801.0
    li.s $f7, 8281.0
    li.s $f8, -9216.0
    
    abs.d $FP10, $FP0
    abs.d $FP12, $FP2
    abs.d $FP14, $FP4
    
    abs.s $f16, $f6
    abs.s $f17, $f7
    abs.s $f18, $f8
    
    li $v0, 10
    syscall

