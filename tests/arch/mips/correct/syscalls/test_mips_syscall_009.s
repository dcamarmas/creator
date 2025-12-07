
#
# Creator (https://creatorsim.github.io/creator/)
#

.text
	main:
		li $t0, 10
		li $t1, 20
        
        li $v0, 9
        li $a0, 8
        syscall
        
        sw $t0, ($v0)
        sw $t1, 4($v0)