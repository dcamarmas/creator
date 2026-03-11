
#
# Creator (https://creatorsim.github.io/creator/)
#
.section .data
 
   byte:       .byte    12
    
   .align 1
   half:       .half    34
    
   .align 2
   word:       .word   -5678
   float:      .float   456.322
   double:     .double  9741.34
   stringz:    .asciz  "This is a string"
   string:     .ascii  "This is another string"
   space:      .zero 32
   
.section .bss
.align 8
tohost: .dword 0

.section .text.init
.globl _main

   _main:
            
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
      # li a7, 10
      # ecall
      jr ra
