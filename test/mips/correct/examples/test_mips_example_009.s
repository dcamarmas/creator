
#
# Creator (https://creatorsim.github.io/creator/)
#

.data
    msg: .asciiz "Please, insert the first number."
    msg2: .asciiz "Please, insert the second number."
    msg3: .asciiz "The result is: "
.text
main:
    la $a0, msg
    li $v0, 4
    syscall
    
    li $v0, 5
    syscall
    move $t0, $v0
    
    la $a0, msg2
    li $v0, 4
    syscall
    
    li $v0, 5
    syscall
    move $t1, $v0
    
    add $t2, $t0, $t1
    
    la $a0, msg3
    li $v0, 4
    syscall

    move $a0, $t2
    li $v0, 1
    syscall
    
    li $v0, 10
    syscall
    
    
