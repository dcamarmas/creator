.data
   .align 2
   word:       .word   0x12345678
   stringz:    .string  "This is a string"
   
.text
    main:

    addi t1, zero, 0x123
            
    # print word value 
    la a0, word
    lw a1, 0(a0)
    li a7, 1
    ecall

    # print string value
    la a0, stringz
    li a7, 4
    ecall

    #return
    jr ra
