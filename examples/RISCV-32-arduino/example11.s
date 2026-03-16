
#Creatino example: parseInt
.data
	msg: .string "Enter a integer number:\n"
    sol: .string "You entered %d"
    lookahead: .string "SKIP_NONE"

.text

number:
	mv a1, a0
    la a0, sol
    addi sp, sp, -4       
    sw ra, 0(sp)             
	jal ra, serial_printf
    lw ra, 0(sp)          
    addi sp, sp, 4 
    jal ra, loop

setup:
	li a0, 115200
    addi sp, sp, -4       
    sw ra, 0(sp)             
	jal ra, serial_begin
    lw ra, 0(sp)          
    addi sp, sp, 4 
    
    jr ra
    
loop:    
	la a0, msg 
    addi sp, sp, -4       
    sw ra, 0(sp)             
	jal ra, serial_printf
    lw ra, 0(sp)          
    addi sp, sp, 4 
    
    la a0, lookahead
	addi sp, sp, -4       
    sw ra, 0(sp)             
	jal ra, serial_parseInt
    lw ra, 0(sp)          
    addi sp, sp, 4 
    bnez a0, number
    jal ra, loop
    
    
main:
	jal ra, initArduino
    addi sp, sp, -4       
    sw ra, 0(sp)             
    jal ra, setup
    lw ra, 0(sp)          
    addi sp, sp, 4              
    j loop