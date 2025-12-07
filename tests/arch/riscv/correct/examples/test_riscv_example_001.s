
#
# Creator (https://creatorsim.github.io/creator/)
#

.data
 
   mybyte:       .byte    12
    
   .align 1
   myhalf:       .half    34

   .align 2
   myword:       .word   -5678
   myfloat:      .float   456.322
   mydouble:     .double  9741.34
   mystringz:    .string  "This is a string"
   mystring:     .string  "This is another string"
   myspace:      .zero 32


   
.text
   main:

      # print byte value
      la a0, mybyte
      lb a0, 0(a0)
      li a7, 1
      ecall
   
      # print half value
      la a0, myhalf
      lh a0, 0(a0)
      li a7, 1
      ecall

      # load double to register ft0
      la a0, mydouble
      fld ft0, 0(a0)

      # store it back to memory
      la a0, mydouble
      fsd ft0, 0(a0)
   

      #return
      jr ra
