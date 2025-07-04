
.data
    msg: .string "Hello %s\n"
    arg: .string "World"


.text
setup:
    li a0,115200 
    addi sp, sp, -4      
    sw ra, 0(sp)     
    jal ra,cr_serial_begin
    lw ra, 0(sp)     
    addi sp, sp,4 

    la a0, msg
    la a1, arg
    addi sp, sp, -16       
    sw ra, 12(sp)          
    jal ra,cr_serial_printf
    lw ra, 12(sp)          
    addi sp, sp, 16       
    jr ra
loop:
    nop
main:
    addi sp, sp, -16       
    sw ra, 12(sp)          
    jal ra, cr_initArduino
    jal ra,setup
    lw ra, 12(sp)          
    addi sp, sp, 16       
    jr ra