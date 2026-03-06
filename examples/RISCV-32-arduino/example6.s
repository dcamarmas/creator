# Creatino example: min and max
.data
    msg: .string "%d"
    newline: .string "\n"
    
.text
main:

	
    addi sp, sp, -4      
    sw ra, 0(sp)          
    jal ra, initArduino    
    lw ra, 0(sp)          
    addi sp, sp, 4 
    
    li a0, 115200 
    addi sp, sp, -4      
    sw ra, 0(sp)     
    jal ra, serial_begin
    lw ra, 0(sp)     
    addi sp, sp, 4
setup:    
    
  # ---------- MIN TEST ----------
  li a0, 40
  li a1, 80

  addi sp, sp, -4
  sw ra, 0(sp)
  jal ra, min           # expected: 40
  lw ra, 0(sp)
  addi sp, sp, 4

  mv a1, a0
  la a0, msg

  addi sp, sp, -4
  sw ra, 0(sp)
  jal ra, serial_printf
  lw ra, 0(sp)
  addi sp, sp, 4
  #newline
  la a0, newline
  addi sp, sp, -4
  sw ra, 0(sp)
  jal ra, serial_printf
  lw ra, 0(sp)
  addi sp, sp, 4
  # ---------- MAX TEST ----------
  li a0, 40
  li a1, 80

  addi sp, sp, -4
  sw ra, 0(sp)
  jal ra, max           # expected: 80
  lw ra, 0(sp)
  addi sp, sp, 4

  mv a1, a0
  la a0, msg

  addi sp, sp, -4
  sw ra, 0(sp)
  jal ra, serial_printf
  lw ra, 0(sp)
  addi sp, sp, 4
    #newline
  la a0, newline
  addi sp, sp, -4
  sw ra, 0(sp)
  jal ra, serial_printf
  lw ra, 0(sp)
  addi sp, sp, 4
      # Constrain: a value has to be in a range
    li a0, 1000 
    li a1, 0
    li a2, 255
    
    addi sp,sp, -4
    sw ra, 0(sp)
    jal ra, constrain #Expected result: 255
    lw ra, 0(sp)
    addi sp, sp, 4
    
    mv a1, a0
    
    la a0, msg
    addi sp,sp, -4
    sw ra, 0(sp)
    jal ra, serial_printf
    lw ra, 0(sp)
    addi sp, sp, 4
      #newline
  la a0, newline
  addi sp, sp, -4
  sw ra, 0(sp)
  jal ra, serial_printf
  lw ra, 0(sp)
  addi sp, sp, 4
    
    # Map: Maps a value to another range: for example, fom 10 bits(0-1023) to 8 bits (0-255)
    li a0, 1000
    li a1, 0 # fromLow
    li a2, 1023 #fromUpper
    li a3, 0 #toLow
    li a4, 255 #toUpper
    
    addi sp,sp, -4
    sw ra, 0(sp)
    jal ra, map
    lw ra, 0(sp)
    addi sp, sp, 4
    
    mv a1, a0
    
    la a0, msg
    addi sp,sp, -4
    sw ra, 0(sp)
    jal ra, serial_printf
    lw ra, 0(sp)
    addi sp, sp, 4
      #newline
  la a0, newline
  addi sp, sp, -4
  sw ra, 0(sp)
  jal ra, serial_printf
  lw ra, 0(sp)
  addi sp, sp, 4


  jr ra

    