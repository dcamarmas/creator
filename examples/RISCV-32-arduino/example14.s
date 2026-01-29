# Creatino example:readBytes
.data
    space:   .zero 100 #Buffer to place the string
    print:  .string "%s\n"
    char: .byte 65 #A

.text
setup:
    li a0, 11520
    addi sp, sp, -4
    sw   ra, 0(sp)
    jal ra, serial_begin
    lw   ra, 0(sp)
    addi sp, sp, 4
    jr ra
loop:

    # read int
    la a0, char
    lb a0, 0(a0)
    la a1, space
    la a2, 5 # number of letters it will have

    addi sp, sp, -4
    sw   ra, 0(sp)
    jal ra, serial_readBytesUntil
    lw   ra, 0(sp)
    addi sp, sp, 4

    # print: 
    la a0, space
    addi sp, sp, -4
    sw   ra, 0(sp)
    jal ra, serial_printf
    lw   ra, 0(sp)
    addi sp, sp, 4 

    # return
    j loop
main:
    addi sp, sp, -16       
    sw ra, 12(sp)          
    jal ra, initArduino    
    jal ra, setup
    lw ra, 12(sp)          
    addi sp, sp, 16              
    j loop