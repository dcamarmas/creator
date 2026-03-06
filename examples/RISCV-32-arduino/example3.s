
.data
    space:   .zero 100 #Buffer to place the string
    initial: .string "Introduce number of letters:\n"
    aux: .string "%d\nType your message\n"
    print:  .string "Your message: %s\n"

.text

setup:
#serialBegin
    li a0,115200 
    addi sp, sp, -4      
    sw ra, 0(sp)     
    jal ra, serial_begin
    lw ra, 0(sp)     
    addi sp, sp,4
    jr ra
    
print_int:
	la a0, aux
    mv a1,t0
    addi sp, sp, -4       
    sw ra, 0(sp)          
    jal ra, serial_printf
    lw ra, 0(sp)          
    addi sp, sp, 4
    j read_function
	
    
read_function:    
    la a0, space
    mv a1, t0 # number of letters it will have
    addi sp, sp, -4      
    sw ra, 0(sp)   
    jal ra, serial_readBytes
    lw ra, 0(sp)     
    addi sp, sp,4 
    
    bne t0,a0,read_function
    
    
    la a0, print
    la a1, space
    addi sp, sp, -4       
    sw ra, 0(sp)          
    jal ra, serial_printf
    lw ra, 0(sp)          
    addi sp, sp, 4
    
    jr ra
    
    
aux_print:
	#serialPrintf 
    la a0,initial
    addi sp, sp, -4       
    sw ra, 0(sp)          
    jal ra, serial_printf
    lw ra, 0(sp)          
    addi sp, sp, 4
    j read_num
    
    
read_num:    
    addi sp, sp, -4      
    sw ra, 0(sp)     
    jal ra, serial_parseInt
    lw ra, 0(sp)     
    addi sp, sp,4 
    
    mv t0, a0
    
    
    bnez t0, print_int
    j read_num
   
loop:
	addi sp, sp, -4       
    sw ra, 0(sp)          
    jal ra, serial_available
    lw ra, 0(sp)          
    addi sp, sp, 4
    beqz a0,aux_print
    j loop  
    
    
    
main:
    addi sp, sp, -4       
    sw ra, 0(sp)          
    jal ra, initArduino    
    jal ra, setup
    lw ra, 0(sp)          
    addi sp, sp, 4              
    j loop