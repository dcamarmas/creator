#
# Creator (https://creatorsim.github.io/creator/)
#

.text
main:
	# print int
	li $v0, 3
	li.d $FP12, 6673
	syscall

  	# print negative double
    li.d $FP12, -86.974
    syscall
    
    li.d $FP12, 1.1
    syscall
    