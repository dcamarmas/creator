#
# Creator (https://creatorsim.github.io/creator/)
# Example: Store "hello world" byte by byte without data segment
#

.text
   main:
      # Use a base memory address 
      li t1, 0x200000
      
      # Store "hello world" byte by byte
      # 'h' = 104
      li t0, 104
      sb t0, 0(t1)
      
      # 'e' = 101  
      li t0, 101
      sb t0, 1(t1)
      
      # 'l' = 108
      li t0, 108
      sb t0, 2(t1)
      
      # 'l' = 108
      li t0, 108
      sb t0, 3(t1)
      
      # 'o' = 111
      li t0, 111
      sb t0, 4(t1)
      
      # ' ' = 32 (space)
      li t0, 32
      sb t0, 5(t1)
      
      # 'w' = 119
      li t0, 119
      sb t0, 6(t1)
      
      # 'o' = 111
      li t0, 111
      sb t0, 7(t1)
      
      # 'r' = 114
      li t0, 114
      sb t0, 8(t1)
      
      # 'l' = 108
      li t0, 108
      sb t0, 9(t1)
      
      # 'd' = 100
      li t0, 100
      sb t0, 10(t1)
      
      # null terminator = 0
      li t0, 0
      sb t0, 11(t1)
      
      # Print the string (system call 4 - print string)
      mv a0, t1        # address of string
      li a7, 4         # system call for print string
      ecall
      
      # Return
      li a7, 10
      ecall

