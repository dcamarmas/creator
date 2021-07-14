
#
# Creator (https://creatorsim.github.io/creator/)
#

# Error4: illegal register t20

.data
        str: .asciiz "Good string"
	max: .byte 10

.text
	main: 		la $t20 max
			li $t1 0
			move $a0 $zero
	while:		bge $t1 $t0 end_while
			add $a0 $a0 $t1
			add $t1 $t1 1
			b while
	end_while: 	li $v0 1
		        syscall	#print_int

			
		
