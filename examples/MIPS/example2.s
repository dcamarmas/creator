
#
# Creator (https://creatorsim.github.io/creator/)
#

.text
main:
	
    li $t0, 10
    li $t1, 13
    li $t2, 45
    li $t3, 33
    
    add $t4, $t0, $t1 # 10+13
    sub $t5, $t2, $t3 # 45-33
    mul $t6, $t3, $t3 # 33*33
    div $t7, $t6, $t1 # $t6/13
