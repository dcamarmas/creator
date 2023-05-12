
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
    
    div.d $FP10, $FP0, $FP2
    div.d $FP12, $FP2, $FP4
    div.d $FP14, $FP0, $FP4
    
    div.s $f16, $f6, $f7
    div.s $f17, $f7, $f8
    div.s $f18, $f8, $f6
    
    li $v0, 10
    syscall

