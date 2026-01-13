
.data
    time:
        .word 1000
.text

main:
    addi sp, sp, -16       
    sw ra, 12(sp)          
    jal ra, initArduino    
    jal ra, setup
    lw ra, 12(sp)          
    addi sp, sp, 16              
    j loop
    
setup:
    #pinMode(LED_BUILTIN, OUTPUT);
    li a0,30
    li a1,  0x03 
    jal ra, pinMode
loop:
    #digitalWrite(LED_BUILTIN, HIGH);
    li a0,30 
    li a1, 0x1
    jal ra, digitalWrite
    #delay(1000);
    la a0, time
    lw a0, 0(a0)
    addi sp, sp, -16      
    sw ra, 12(sp)
    jal ra, delay
    lw ra, 12(sp)          
    addi sp, sp, 16 
    #digitalWrite(LED_BUILTIN, LOW);
    li a0,30 
    li a1, 0x0
    jal ra, digitalWrite
    #delay(1000);
    la a0, time
    lw a0, 0(a0)
    addi sp, sp, -16      
    sw ra, 12(sp)
    jal ra, delay
    lw ra, 12(sp)          
    addi sp, sp, 16 
    j loop
        