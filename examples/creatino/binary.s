####################################################
# CREATINO EXAMPLE: Playing with binary operations #
#               BY ELISA UTRILLA                   #
####################################################      

#ARDUINO
.text
setup:
    # Test cr_bit
    li a0, 2          # Set bit position to 3
    addi sp, sp, -4       
    sw ra, 0(sp) 
    jal ra, cr_bit       # Call cr_bit
    lw ra, 0(sp)          
    addi sp, sp, 4
    # Expected result: a0 = 0b1000 (8)
    #Print
    addi sp, sp, -16       
    sw ra, 12(sp)
    li a7, 1          
    jal ra,cr_serial_println
    lw ra, 12(sp)          
    addi sp, sp, 16
    
    # Test cr_bitClear
    li a1, 3          # Set bit position to 3
    li a0, 0b1111     # Initial value: 0b1111 (15)
    addi sp, sp, -4       
    sw ra, 0(sp) 
    jal ra, cr_bitClear  # Call cr_bitClear
    lw ra, 0(sp)          
    addi sp, sp, 4
    # Expected result: a0 = 0b0111 (7)

    #Print
    addi sp, sp, -16       
    sw ra, 12(sp)
    li a7, 1          
    jal ra,cr_serial_println
    lw ra, 12(sp)          
    addi sp, sp, 16
    
    # Test cr_bitRead
    li a1, 2          # Set bit position to 2
    li a0, 0b0100     # Initial value: 0b0100 (4)
    addi sp, sp, -4       
    sw ra, 0(sp) 
    jal ra,cr_bitRead   # Call cr_bitRead
    lw ra, 0(sp)          
    addi sp, sp, 4
    # Expected result: a0 = 1 (bit 2 is set)

    #Print
    addi sp, sp, -16       
    sw ra, 12(sp)
    li a7, 1          
    jal ra,cr_serial_println
    lw ra, 12(sp)          
    addi sp, sp, 16
    
    # Test cr_bitSet
    li a0, 0          # Set bit position to 1
    li a1, 1         # Set bit position to 1
    addi sp, sp, -4       
    sw ra, 0(sp) 
    jal ra, cr_bitSet    # Call cr_bitSet
    lw ra, 0(sp)          
    addi sp, sp, 4
    # Expected result: a0 = 0b0010 (2)
    
    #Print
    addi sp, sp, -16       
    sw ra, 12(sp)
    li a7, 1          
    jal ra,cr_serial_println
    lw ra, 12(sp)          
    addi sp, sp, 16

    # Test cr_bitWrite (1)
    li a1, 2          
    li a0, 0b0000     
    li a2, 1          
    addi sp, sp, -4       
    sw ra, 0(sp) 
    jal ra, cr_bitWrite  # Call cr_bitWrite
    lw ra, 0(sp)          
    addi sp, sp, 4
    # Expected result: a1 = 0b0100 (4)

    #Print
    addi sp, sp, -16       
    sw ra, 12(sp)
    li a7, 1          
    jal ra,cr_serial_println
    lw ra, 12(sp)          
    addi sp, sp, 16
    
    #cr_bitWrite (0)
    li a1, 2          
    li a0, 0b0100     
    li a2, 0          
    addi sp, sp, -4       
    sw ra, 0(sp) 
    jal ra, cr_bitWrite  
    lw ra, 0(sp)          
    addi sp, sp, 4
    # Expected result: a1 = 0b0000 (0)

    #Print
    addi sp, sp, -16       
    sw ra, 12(sp)
    li a7, 1          
    jal ra,cr_serial_println
    lw ra, 12(sp)          
    addi sp, sp, 16

    # Test cr_highByte
    li a0, 0x1234  # Número de 16 bits (4660 en decimal)
    addi sp, sp, -4       
    sw ra, 0(sp) 
    jal ra,cr_lowByte 
    lw ra, 0(sp)          
    addi sp, sp, 4

    addi sp, sp, -16       
    sw ra, 12(sp)
    li a7, 1          
    jal ra,cr_serial_println
    lw ra, 12(sp)          
    addi sp, sp, 16
    
    jr ra
loop:
    nop
main:
    #call initArduino    
    addi sp, sp, -16       
    sw ra, 12(sp)          
    jal ra,setup
    lw ra, 12(sp)          
    addi sp, sp, 16       
    jr ra