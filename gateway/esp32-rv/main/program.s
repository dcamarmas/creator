.text
.type main, @function
.globl main

#
# Creator (https://creatorsim.github.io/creator/)
#

# Sum of the first 10 numbers from 0 to 9
.data
	max: .byte 10

.text
	main: 	    la   t0, max
				lb   t0, 0 (t0)
		   		li   t1, 0
		   		li   a0, 0
	while:	   	bge  t1, t0, end_while
		   		add  a0, a0, t1
		   		addi t1, t1, 1
		   		beq  x0, x0, while

	end_while: 	li a7, 1
#### ecall ####
addi sp, sp, -8
sw ra, 0(sp)
jal _myecall
lw ra, 0(sp)
addi sp, sp, 8
###############
