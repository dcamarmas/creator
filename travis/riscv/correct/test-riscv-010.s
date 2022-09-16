
#
# Creator (https://creatorsim.github.io/creator/)
#

.data
    string1: .string "Insert the string length (no more than 100 characters) "
    string2: .string "Insert the string "
    space:   .zero 100

.text
main:
    la a0 string1
    li a7 4
    ecall
    
    li a7 5
    ecall
    add t0 a7 zero
    
    la a0 string2
    li a7 4
    ecall
    
    la a0 space
    add a1 t0 zero
    li a7 8
    ecall
    
    li a7 4
    ecall

