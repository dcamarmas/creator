
#
# Creator (https://creatorsim.github.io/creator/)
#

.text
main:

    li $t5, 547
    li $t6, -937
    li $t7, 12
    li $t8, 0x123515

	jal end

    sub $t9, $t5, $t6 
    sub $s1, $t7, $t9
    sub $s2, $t8, $s1 

end:
	li $a0, 10
	syscall