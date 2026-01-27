# Creatino Example: Blink for BUILTIN RGB Led boards (ESP32-C6)
.data
    time:
        .word 1000
.text

main:
    addi sp, sp, -4       
    sw ra, 0(sp)          
    jal ra, initArduino    
    jal ra, setup
    lw ra, 0(sp)          
    addi sp, sp, 4              
    j loop
    
setup:
    nop
loop:
    #digitalWrite(LED_BUILTIN, HIGH);
    li a0,8 
    li a1, 0x1
    addi sp, sp, -4       
    sw ra, 0(sp)
    jal ra, digitalWrite
    lw ra, 0(sp)          
    addi sp, sp, 4
    #delay(1000);
    la a0, time
    lw a0, 0(a0)
    addi sp, sp, -4      
    sw ra, 0(sp)
    jal ra, delay
    lw ra, 0(sp)          
    addi sp, sp, 4 
    #digitalWrite(LED_BUILTIN, LOW);
    li a0,8 
    li a1, 0x0
    addi sp, sp, -4       
    sw ra, 0(sp)
    jal ra, digitalWrite
    lw ra, 0(sp)          
    addi sp, sp, 4 
    #delay(1000);
    la a0, time
    lw a0, 0(a0)
    addi sp, sp, -4      
    sw ra, 0(sp)
    jal ra, delay
    lw ra, 0(sp)          
    addi sp, sp, 4 
    j loop
        