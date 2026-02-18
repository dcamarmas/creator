#Template for Arduino proyects
.data
	lightSensorPin: .word 2
    ledPin: .word 4
    time: .word 100
    aux_msg: .string "LDR value: %d\n"

.text

setup:
#Serial
	li a0,115200 
    addi sp, sp, -4      
    sw ra, 0(sp)     
    jal ra, serial_begin
    lw ra, 0(sp)     
    addi sp, sp,4
# PinMode LED 
    la t1, ledPin
    lw a0, 0(t1) 
    li a1, 0x03 #OUTPUT
    addi sp, sp, -4
    sw ra,0(sp)
    jal ra, pinMode #pinMode(ledPin, OUTPUT);
    lw ra,0(sp)
    addi sp, sp, 4
# Light sensor pin
    la t1, lightSensorPin
    lw a0, 0(t1) 
    li a1, 0x01
    addi sp, sp, -4
    sw ra,0(sp)
    jal ra, pinMode# pinMode(ledPin, INPUT_PULLUP);
    lw ra,0(sp)
    addi sp, sp, 4
    
    jr ra
turnDown:
	la t0, ledPin
    lw a0, 0(t0)
    li a1, 0x0
    addi sp, sp, -4       
    sw ra, 0(sp)
    jal ra, digitalWrite
    lw ra, 0(sp)          
    addi sp, sp, 4
    # delay
        la a0, time
    lw a0, 0(a0)
    addi sp, sp, -4      
    sw ra, 0(sp)
    jal ra, delay
    lw ra, 0(sp)          
    addi sp, sp, 4 
    j loop
    
lightUp:
	la t0, ledPin
    lw a0, 0(t0)
    li a1, 0x1
    addi sp, sp, -4       
    sw ra, 0(sp)
    jal ra, digitalWrite
    lw ra, 0(sp)          
    addi sp, sp, 4
    # delay
        la a0, time
    lw a0, 0(a0)
    addi sp, sp, -4      
    sw ra, 0(sp)
    jal ra, delay
    lw ra, 0(sp)          
    addi sp, sp, 4 
    
    j loop

loop:
#read LDR
    addi sp, sp, -4
    sw ra,0(sp)
    jal ra, analogRead #analogRead(lightSensorPin);
    lw ra,0(sp)
    addi sp, sp, 4
# Print value
	mv t1, a0
	mv a1,a0
    la a0,aux_msg
    addi sp, sp, -4       
    sw ra, 0(sp)          
    jal ra, serial_printf
    lw ra, 0(sp)          
    addi sp, sp, 4
    
# turn up led
	li t0, 1200 #Minumun value
    bgt t1, t0, lightUp
    blt t1, t0, turnDown
    


	
    
    j loop
    
main:
    addi sp, sp, -4       
    sw ra, 0(sp)          
    jal ra, initArduino    
    jal ra, setup
    lw ra, 0(sp)          
    addi sp, sp, 4              
    j loop