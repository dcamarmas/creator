
#
# Creator (https://creatorsim.github.io/creator/)
#

# Sum of the first 10 numbers from 0 to 9
.data
	max: .byte 10
.text
	main: 		lb $t0, max
				li $t1, 0
				li $a0, 0
	while:		bge $t1, $t0, end_while
				add $a0, $a0, $t1
				add $t1, $t1, 1
				b while

	end_while: 	li $v0, 1
				syscall	#print_int

			
		