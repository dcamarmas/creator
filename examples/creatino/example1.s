#Template for Arduino proyects
.data

.text

setup:
    nop
loop:
    nop
    
main:
    addi sp, sp, -16       
    sw ra, 12(sp)          
    jal ra, cr_initArduino    
    jal ra, setup
    lw ra, 12(sp)          
    addi sp, sp, 16              
    li  t0, 1
    beqz t0, loop 