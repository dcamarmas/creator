# Creatino example: Looking up serial entries with serial_find
.data 
    msg: .string "Terminal iniciado en baudrate 115200"
    missing: .string "\nNot here"
        .align 2
    wanted: .string "OK"
    stop: .string "STOP"
    found: .string "\nOK found"
    	.align 2
    buffer: .space 100

.text
not_found:
    la a0, missing
    addi sp, sp, -4       
    sw ra, 0(sp)          
    jal ra, serial_printf
    lw ra, 0(sp)          
    addi sp, sp, 4 
    
    #li a0, 10000
    #addi sp, sp, -4     
    #sw ra, 0(sp)
    #jal ra, delay
    #lw ra, 0(sp)          
    #addi sp, sp, 4
    
    jal ra, loop

founded:
    la a0, found
    addi sp, sp, -4       
    sw ra, 0(sp)          
    jal ra, serial_printf
    lw ra, 0(sp)          
    addi sp, sp, 4 
    
    #li a0, 10000
    #addi sp, sp, -4     
    #sw ra, 0(sp)
    #jal ra, delay
    #lw ra, 0(sp)          
    #addi sp, sp, 4
    
    jal ra, loop


setup:
    # Serial.begin(115200)
    li a0, 115200
    addi sp, sp, -4      
    sw ra, 0(sp)   
    jal ra, serial_begin
    lw ra, 0(sp)         
    addi sp, sp, 4       

    # Serial.printf(msg)
    la a0, msg   
    addi sp, sp, -4       
    sw ra, 0(sp)          
    jal ra, serial_printf
    lw ra, 0(sp)          
    addi sp, sp, 4       

    jr ra   

loop:
    # Search "OK" in terminal
    la a0, wanted
    la a1, stop
    addi sp, sp, -4      
    sw ra, 0(sp)   
    jal ra, serial_findUntil 
    lw ra, 0(sp)          
    addi sp, sp, 4       

    beqz a0, not_found
    jal ra, founded
    
    

    j loop

main:          
    jal ra, initArduino
    addi sp, sp, -4       
    sw ra, 0(sp)
    jal ra, setup
    lw ra, 0(sp)
    addi sp, sp, 4
    j loop
