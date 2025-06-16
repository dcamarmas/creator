
.data
    delay:
        .word 1000
.text
setup:
    li a0,  4   #RED PIN GPIO
    li a1,  0x03 
    jal ra, cr_pinMode

    li a0,  5   #YELLOW PIN GPIO
    li a1,  0x03 
    jal ra, cr_pinMode

    li a0,  6   #GREEN PIN GPIO
    li a1,  0x03 
    jal ra, cr_pinMode
loop:
    ## ---------------------RED PIN---------------------
    li a0,4 
    li a1, 0x1
    jal ra, cr_digitalWrite
    la a0, delay
    lw a0, 0(a0)
    addi sp, sp, -16      
    sw ra, 12(sp)
    jal ra, cr_delay
    lw ra, 12(sp)          
    addi sp, sp, 16 
    li a0,4 
    li a1, 0x0
    jal ra, cr_digitalWrite
    la a0, delay
    lw a0, 0(a0)
    addi sp, sp, -16      
    sw ra, 12(sp)
    jal ra, cr_delay
    lw ra, 12(sp)          
    addi sp, sp, 16

    ## ---------------------Yellow PIN---------------------
    li a0,5 
    li a1, 0x1
    jal ra, cr_digitalWrite
    la a0, delay
    lw a0, 0(a0)
    addi sp, sp, -16      
    sw ra, 12(sp)
    jal ra, cr_delay
    lw ra, 12(sp)          
    addi sp, sp, 16 
    li a0,5 
    li a1, 0x0
    jal ra, cr_digitalWrite
    la a0, delay
    lw a0, 0(a0)
    addi sp, sp, -16      
    sw ra, 12(sp)
    jal ra, cr_delay
    lw ra, 12(sp)          
    addi sp, sp, 16 

    ## ---------------------Green PIN---------------------
    li a0,6 
    li a1, 0x1
    jal ra, cr_digitalWrite
    la a0, delay
    lw a0, 0(a0)
    addi sp, sp, -16      
    sw ra, 12(sp)
    jal ra, cr_delay
    lw ra, 12(sp)          
    addi sp, sp, 16 
    li a0,6 
    li a1, 0x0
    jal ra, cr_digitalWrite
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
