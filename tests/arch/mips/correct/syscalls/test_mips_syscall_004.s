
#
# Creator (https://creatorsim.github.io/creator/)
#

.data
    .align 2
    string1: .asciiz "First String"
    string2: .ascii  "Second String"
    string3: .asciiz "a"
    
.text

main:
    li $v0, 4
    la $a0, string1
    syscall
    
    la $a0, string2
    syscall
    
    la $a0, string3
    syscall

    li $a0, '\n'
    li $v0, 11
    syscall

