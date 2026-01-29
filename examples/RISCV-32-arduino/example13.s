#Template for Arduino proyects
.data
space: .zero 100

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

    addi sp, sp, -4
    sw ra, 0(sp)
    la a0, space
    li a1, 5
    jal ra, serial_readBytes
    lw ra, 0(sp)
    addi sp, sp, 4


    addi sp, sp, -4
    sw ra, 0(sp)
    la a0, space
    jal ra, serial_printf
    lw ra, 0(sp)
    addi sp, sp, 4

    j loop
main:
    addi sp, sp, -16       
    sw ra, 12(sp)          
    jal ra, initArduino    
    jal ra, setup
    lw ra, 12(sp)          
    addi sp, sp, 16              
    j loop