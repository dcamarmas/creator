
#
# Creator (https://creatorsim.github.io/creator/)
#

.data
    msg:  .string "Please, insert the first number."
    msg2: .string "Please, insert the second number."
    msg3: .string "The result is: "

.text
main:
    la a0 msg
    li a7 4
    ecall
    
    li a7 5
    ecall
    add t0 a7 zero
    
    la a0 msg2
    li a7 4
    ecall
    
    li a7 5
    ecall
    add t1 a7 zero
    
    add t2 t0 t1
    
    la a0 msg3
    li a7 4
    ecall

    add a0 t2 zero
    li a7 1
    ecall
    
    li a7 10
    ecall

