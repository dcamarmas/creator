
#
# Creator (https://creatorsim.github.io/creator/)
#

.data
 
   byte:       .byte    12
    
   .align 1
   half:       .half    34
    

   
.text
   main:
            
      # print byte value 
      la a0, byte
      lb a0, 0(a0)
      li a7, 1
      ecall
   
      # print half value
      la a0, half
      lh a0, 0(a0)
      li a7, 1
      ecall

      #return
      jr ra
