
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
    #pinMode(LED_BUILTIN, OUTPUT);
    li a0,30
    li a1,  0x03
    addi sp, sp, -4       
    sw ra, 0(sp)  
    jal ra, pinMode
    lw ra, 0(sp)          
    addi sp, sp, 4
    jr ra
loop:
    #digitalWrite(LED_BUILTIN, HIGH);
    li a0,30 
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
    li a0,30 
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
        