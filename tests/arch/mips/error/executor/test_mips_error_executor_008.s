
#
# Creator (https://creatorsim.github.io/creator/)
#

.data
	a: .space 4

.text
main:
	
	la $t0, a
    li $t1, 10
	lw $t1, 1($t0)