#Creatino example: Semaphore with 3 LEDs

.data
    time:
        .word 1000
.text
setup:
    li a0,  4   #RED PIN GPIO
    li a1,  0x03 
    addi sp, sp, -4       
    sw ra, 0(sp)    
    jal ra, pinMode
    lw ra, 0(sp)          
    addi sp, sp, 4  

    li a0,  5   #YELLOW PIN GPIO
    li a1,  0x03 
    addi sp, sp, -4       
    sw ra, 0(sp)    
    jal ra, pinMode
    lw ra, 0(sp)          
    addi sp, sp, 4 

    li a0,  6   #GREEN PIN GPIO
    li a1,  0x03 
    addi sp, sp, -4       
    sw ra, 0(sp)    
    jal ra, pinMode
    lw ra, 0(sp)          
    addi sp, sp, 4 

    jr ra
loop:
    ## ---------------------RED PIN---------------------
    li a0,4 
    li a1, 0x1
    addi sp, sp, -4       
    sw ra, 0(sp)      
    jal ra, digitalWrite
    lw ra, 0(sp)          
    addi sp, sp, 4    
    la a0, time
    lw a0, 0(a0)
    addi sp, sp, -16      
    sw ra, 12(sp)
    jal ra, delay
    lw ra, 12(sp)          
    addi sp, sp, 16 
    li a0,4 
    li a1, 0x0
    jal ra, digitalWrite
    la a0, time
    lw a0, 0(a0)
    addi sp, sp, -16      
    sw ra, 12(sp)
    jal ra, delay
    lw ra, 12(sp)          
    addi sp, sp, 16

    ## ---------------------Yellow PIN---------------------
    li a0,5
    li a1, 0x1
    jal ra, digitalWrite
    la a0, time
    lw a0, 0(a0)
    addi sp, sp, -16      
    sw ra, 12(sp)
    jal ra, delay
    lw ra, 12(sp)          
    addi sp, sp, 16 
    li a0,5 
    li a1, 0x0
    jal ra, digitalWrite
    la a0, time
    lw a0, 0(a0)
    addi sp, sp, -16      
    sw ra, 12(sp)
    jal ra, delay
    lw ra, 12(sp)          
    addi sp, sp, 16

    ## ---------------------Green PIN---------------------
    li a0,6 
    li a1, 0x1
    jal ra, digitalWrite
    la a0, time
    lw a0, 0(a0)
    addi sp, sp, -16      
    sw ra, 12(sp)
    jal ra, delay
    lw ra, 12(sp)          
    addi sp, sp, 16 
    li a0,6 
    li a1, 0x0
    jal ra, digitalWrite
    la a0, time
    lw a0, 0(a0)
    addi sp, sp, -16      
    sw ra, 12(sp)
    jal ra, delay
    lw ra, 12(sp)          
    addi sp, sp, 16  

    j loop
    
main:
    #Initialize Arduino
    addi sp, sp, -16       
    sw ra, 12(sp)          
    jal ra, initArduino    
    jal ra, setup
    lw ra, 12(sp)          
    addi sp, sp, 16             
    j loop