#
# Creator (https://creatorsim.github.io/creator/)
#

.text
main:
	# print int
	li $v0, 2
	li.s $f12, 6673
	syscall

  	# print negative float
    li.s $f12, -86.974
    syscall
    
    li.s $f12, 1.1
    syscall
    