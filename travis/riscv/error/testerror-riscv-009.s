
#
# Creator (https://creatorsim.github.io/creator/)
#

# Error9: invalid number --> hello

.data
    str: 	.string "Bad string"
	max: 	.word hello

.text
main:
	la x5 max
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
