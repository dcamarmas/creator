
#
# Creator (https://creatorsim.github.io/creator/)
#

.text
main:

    li $t0, 0x22346
    li $t1, 4567
    li $t2, -9486

    nor $t3, $t0, $t1
    nor $t4, $t1, $t2
  	nor $t5, $t2, $t0
    
