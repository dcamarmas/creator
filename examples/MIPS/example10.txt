
#
# Creator (https://creatorsim.github.io/creator/)
#

.data
	string1: .asciiz "Insert the string length (no more than 100 characters) "
    string2: .asciiz "Insert the string "
	space:	 .space 100
.text

main:
	la $a0, string1
    li $v0, 4
    syscall
    
    li $v0, 5
    syscall
    move $t0, $v0
    
    la $a0, string2
    li $v0, 4
    syscall
    
    la $a0, space
    move $a1, $t0
    li $v0, 8
    syscall
    
    li $v0, 4
    syscall