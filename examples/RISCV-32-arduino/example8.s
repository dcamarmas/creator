#Creatino example: Generating random numbers
.data
	msg: .string "%d"
.text
setup:
    #Stablish a seed. using the same seed will lead to the same results
    li a0, 1234
    addi sp, sp, -4       
    sw ra, 0(sp) 
    jal ra,randomSeed
    lw ra, 0(sp)          
    addi sp, sp, 4

    #Random number between 25 and 19
    li a0, 25
    li a1,19
    addi sp, sp, -4       
    sw ra, 0(sp) 
    jal ra, random
    lw ra, 0(sp)          
    addi sp, sp, 4
    
    mv a1, a0
    
    li a0, 115200
    addi sp, sp, -4       
    sw ra, 0(sp) 
    jal ra, serial_begin
    lw ra, 0(sp)          
    addi sp, sp, 4
    

    la a0, msg
    addi sp, sp, -16       
    sw ra, 12(sp)         
    jal ra,serial_printf
    lw ra, 12(sp)          
    addi sp, sp, 16

    jr ra

main:
    jal ra, initArduino
    addi sp, sp, -4       
    sw ra, 0(sp)          
    jal ra,setup
    lw ra, 0(sp)          
    addi sp, sp, 4
           
    jr ra