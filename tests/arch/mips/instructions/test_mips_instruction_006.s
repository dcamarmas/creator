
#
# Creator (https://creatorsim.github.io/creator/)
#

.text
main:

    li $t0, 547
    li $t1, -937
    li $t2, 12
    li $t3, 0x123515

	li $t8, 0x34
	jalr $t4, $t8

    sub $t5, $t1, $t2 
    sub $t6, $t2, $t3
    sub $t7, $t3, $t4 

end:
	li $a0, 10
	syscall