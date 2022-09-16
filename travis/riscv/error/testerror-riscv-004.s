
#
# Creator (https://creatorsim.github.io/creator/)
#

# Error4: illegal register x50

.data
    str: 	.string "Bad string"
    		.byte 2
	max: 	.byte 10

.text
main:
	la x50 max
    li x6 0
    li a0 0
while:
	bge x6 x5 end_while
    add a0 a0 x6
    addi x6 x6 1
    j while
end_while:
	li a7 1
	ecall	#print_int
