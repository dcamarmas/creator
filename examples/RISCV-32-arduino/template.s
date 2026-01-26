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
    jal ra, initArduino    
    jal ra, setup
    lw ra, 12(sp)          
    addi sp, sp, 16              
    j loop