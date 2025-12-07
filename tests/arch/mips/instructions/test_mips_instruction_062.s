
#
# Creator (https://creatorsim.github.io/creator/)
#

    
.text
main:
    li.d $FP0, 256.0
  	li.d $FP2, -4096.0
    li.d $FP4, 3.0
    
    li.s $f6, -300.0
    li.s $f7, 5.0
    li.s $f8, -512.0
    
    mul.d $FP10, $FP0, $FP2
    mul.d $FP12, $FP2, $FP4
    mul.d $FP14, $FP4, $FP0
    
    mul.s $f16, $f6, $f7
    mul.s $f17, $f7, $f8
    mul.s $f18, $f8, $f6
    
    li $v0, 10
    syscall

