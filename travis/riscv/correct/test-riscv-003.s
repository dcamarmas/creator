
#
# Creator (https://creatorsim.github.io/creator/)
#

.data
    .align 2
    w1:		.word 14
    b1:		.byte 120
    h1:		.half 22
    w2:		.section 4
    b2:		.section 1
    h2:		.section 2

.text
main:
	
    la x5 w1		  #w1 address -> x5
    la x6 b1		  #b1 address -> x6
    la x7 h1		  #h1 address -> x7
    
    lw x8 (x5)	      #Memory[x5] -> x8
    lw x9 w1		  #Memory[w1] -> x9
    
    lb x10 (x6)	      #Memory[x6] -> x10
    lb x11 b1		  #Memory[b1] -> x11
    
    lh x12 (x7)	      #Memory[x7] -> x12
    lh x13 h1		  #Memory[h1] -> x13
    
    sw  x8 w2 x14 	  #x8 -> Memory[w2]
    sb x10 b2 x14	  #x10 -> Memory[b2]
    sh x12 h2 x14	  #x12 -> Memory[h2]

