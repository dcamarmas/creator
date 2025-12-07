
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
    
    rsqrt.d $FP10, $FP0
    rsqrt.d $FP12, $FP2
    rsqrt.d $FP14, $FP4
    
    rsqrt.s $f16, $f6
    rsqrt.s $f17, $f7
    rsqrt.s $f18, $f8
    
    li $v0, 10
    syscall

