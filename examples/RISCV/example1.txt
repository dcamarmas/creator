
#
# Creator (https://creatorsim.github.io/creator/)
#

.data
 
   byte:       .byte    12
    
   .align 1
   half:       .half    34
    
   .align 2
   word:       .word   -5678
   float:      .float   456.322
   double:     .double  9741.34
   stringz:    .string  "This is a string"
   string:     .string  "This is another string"
   space:      .zero 32
   
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
