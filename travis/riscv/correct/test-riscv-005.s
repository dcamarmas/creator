
#
# Creator (https://creatorsim.github.io/creator/)
#

# Sum of the first 10 numbers from 0 to 9
.data
	max: .byte 10

.text
	main: 	    lb   t0 max
		   		li   t1 0
		   		li   a0 0
	while:	   	bge  t1 t0 end_while
		   		add  a0 a0 t1
		   		addi  t1 t1 1
		   		beq  x0 x0 while

	end_while: 	li a7 1
		   		ecall # print_int

