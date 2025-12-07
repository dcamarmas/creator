
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
    
    add.d $FP10, $FP0, $FP0
    add.d $FP12, $FP2, $FP2
    add.d $FP14, $FP4, $FP4
    
    add.s $f16, $f6, $f6
    add.s $f17, $f7, $f7
    add.s $f18, $f8, $f8
    
    li $v0, 10
    syscall

