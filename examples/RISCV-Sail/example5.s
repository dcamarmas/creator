
#
# Creator (https://creatorsim.github.io/creator/)
#

# Sum of the first 10 numbers from 0 to 9

.section .data
	max: .byte 10

.section .bss
.align 8 
tohost: .dword 0

.section .text.init
.globl _main
	_main: 	    
		la   t0, max
		lb   t0, 0 (t0)
		li   t1, 0
		li   a0, 0
		
	while:	bge  t1, t0, end_while
		add  a0, a0, t1
		addi t1, t1, 1
		beq  zero, zero, while

    end_while: 	li a7, 1
		ecall # print_int

		#return
		# li a7, 10
		# ecall 
		jr ra
