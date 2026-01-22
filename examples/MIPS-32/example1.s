#
# Creator (https://creatorsim.github.io/creator/)
#

.data

   byte:    .byte 12

   .align 1
   half:   .half 34

   .align 2
   word:   .word -5678
   float:    .float 456.322
   double:   .double 9741.34
   stringZ:  .asciiz "This is a string"
   string:   .ascii "This is another string"
   space:    .space 32

.text
   main:
            
      # print byte value 
      la $a0, byte
      lb $a0, 0($a0)
      li $v0, 1
      syscall
   
      # print half value
      la $a0, half
      lh $a0, 0($a0)
      li $v0, 1
      syscall

      # exit
      li $v0, 10
      syscall
