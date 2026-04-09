
#
# Creator (https://creatorsim.github.io/creator/)
#

.data
    b1:		.byte 127, -42

    .align 1
    h1:		.half 32767, -12345
    b2:		.zero 2
    .align 1
    h2:		.zero 4

.text
main:
	
    la x6, b1		  # b1 address -> x6
    la x7, h1		  # h1 address -> x7
    
    lbu x10, 0(x6)	  # Memory[x6] -> x10
    lbu x11, 1(x6)	  # Memory[x6+1] -> x13
    
    lhu x12, 0 (x7)	  # Memory[x7] -> x12
    lhu x13, 2 (x7)	  # Memory[x7+2] -> x13
    
    la x14, b2		  # b2 address -> x14
    sb x10, 0(x14)	  # x10 -> Memory[b2]
    sb x11, 1(x14)	  # x11 -> Memory[b2+1]

    la x14, h2		  # h2 address -> x14
    sh x12, 0(x14)	  # x12 -> Memory[h2]
    sh x13, 2(x14)	  # x13 -> Memory[h2+2]

    jr ra
