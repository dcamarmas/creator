
#
# Creator (https://creatorsim.github.io/creator/)
#

.data
    .align 2
    string1: .string "First String"
    string2: .string  "Second String"
    string3: .string "a"
    
.text

main:
    li a7, 4
    la a0, string1
    ecall
    
    la a0, string2
    ecall
    
    la a0, string3
    ecall

    li a0, '\n'
    li a7, 11
    ecall

