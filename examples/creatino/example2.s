
.data
    delay:
        .word 1000
.text
setup:
    #pinMode(LED_BUILTIN, OUTPUT);
    li a0,30
    li a1,  0x03 
    jal ra, cr_pinMode
loop:
    #digitalWrite(LED_BUILTIN, HIGH);
    li a0,30 
    li a1, 0x1
    jal ra, cr_digitalWrite
    #delay(1000);
    la a0, delay
    lw a0, 0(a0)
    addi sp, sp, -16      
    sw ra, 12(sp)
    jal ra, cr_delay
    lw ra, 12(sp)          
    addi sp, sp, 16 
    #digitalWrite(LED_BUILTIN, LOW);
    li a0,30 
    li a1, 0x0
    jal ra, cr_digitalWrite
    #delay(1000);
    la a0, delay
    lw a0, 0(a0)
    addi sp, sp, -16      
    sw ra, 12(sp)
    jal ra, cr_delay
    lw ra, 12(sp)          
    addi sp, sp, 16 
    
main:
    addi sp, sp, -16       
    sw ra, 12(sp)          
    jal ra, cr_initArduino    
    jal ra, setup
    lw ra, 12(sp)          
    addi sp, sp, 16              
    li  t0, 1
    beqz t0, loop       