
#
# Creator (https://creatorsim.github.io/creator/)
#

# Error10: data no aligned

.data
        str: .asciiz "Good string"
    .byte 2
	max: .word 1

.text
	main: 		la $t2 max
			li $t1 0
			move $a0 $zero
	while:		bge $t1 $t0 end_while
			add $a0 $a0 $t1
			add $t1 $t1 1
			b while
	end_while: 	li $v0 1
		        syscall	#print_int

			
		
