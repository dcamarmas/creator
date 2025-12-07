
#
# Creator (https://creatorsim.github.io/creator/)
#

.text
main:

    li x5, 0xAAD4
    li x6, 4567
    li x7, -9486
    
    li x8, 2
    li x9, 1
    li x10, 0x554
    
    srl x11, x5, x8
    srl x12, x6, x9
  	srl x13, x7, x10
    
    