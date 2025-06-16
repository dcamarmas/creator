
.data
    delay:  .word 1000
    buttonPin: .word  4
    ledpin: .word 5
    buttonState:    .word   0
    msg:    .string     "Button Pressed!"

.text
setup:
    li a0, 115200
    addi sp, sp, -4      
    sw ra, 0(sp)          
    jal ra, cr_serial_begin
    lw ra, 0(sp)          
    addi sp, sp, 4            

    #pinMode(buttonPin,INPUT_PULLUP)
    la a0, buttonPin   
    lw a0, 0(a0)       
    li a1,  0x05 #INPUT_PULLUP
    addi sp, sp, -4      
    sw ra, 0(sp)   
    jal ra, cr_pinMode
    lw ra, 0(sp)          
    addi sp, sp, 4
    
    #pinMode(ledpin,OUTPUT)
    la a0, ledpin
    lw a0, 0(a0)       
    li a1,  0x03 #OUTPUT
    addi sp, sp, -4      
    sw ra, 0(sp)   
    jal ra, cr_pinMode
    lw ra, 0(sp)          
    addi sp, sp, 4

    jr ra

button_pressed:
    la a0, msg
    addi sp, sp, -16       
    sw ra, 12(sp)          
    jal ra,cr_serial_printf
    lw ra, 12(sp)          
    addi sp, sp, 16       
    
    la a0, ledpin
    lw a0, 0(a0)
    li a1, 0x1
    jal ra, cr_digitalWrite
    
    la a0, delay
    lw a0, 0(a0)
    addi sp, sp, -16      
    sw ra, 12(sp)
    jal ra, cr_delay
    lw ra, 12(sp)          
    addi sp, sp, 16 
    
    jal ra, loop


loop:
    la a0, buttonPin   
    lw a0, 0(a0)       
    addi sp, sp, -4      
    sw ra, 0(sp)          
    jal ra, cr_digitalRead
    lw ra, 0(sp)          
    addi sp, sp, 4

    mv t0,a0

    li t1 ,0 #LOW

    beq t0,t1,button_pressed
    
    la a0, ledpin
    lw a0, 0(a0)
    li a1, 0x0
    jal ra, cr_digitalWrite
    
    la a0, delay
    lw a0, 0(a0)
    addi sp, sp, -16      
    sw ra, 12(sp)
    jal ra, cr_delay
    lw ra, 12(sp)          
    addi sp, sp, 16 

    j loop

main:
    addi sp, sp, -16       
    sw ra, 12(sp)          
    jal ra, cr_initArduino    
    jal ra, setup
    lw ra, 12(sp)          
    addi sp, sp, 16       
    li  t4, 0
    beqz t4, loop 
    jr ra
    ret 
