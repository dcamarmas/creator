
#
# Creator (https://creatorsim.github.io/creator/)
#

.data
    w1:     .word 14
    b1:     .byte 120

    .align 1
    h1:     .half 22
    w2:     .zero 4
    b2:     .zero 1

    .align 1
    h2:     .zero 2

.text
main:
    
    la t0, w1         # w1 address -> t0
    la t1, b1         # b1 address -> t1
    la t2, h1         # h1 address -> t2
    
    lw t3,  0(t0)     # Memory[t0] -> t3
    
    lb t4,  0(t1)     # Memory[t1] -> t4
    
    lh t5, 0 (t2)     # Memory[t2] -> t5
    
    la t0, w2         # w2 address -> t0
    sw t3,  0(t0)     # t3 -> Memory[w2]

    la t0, b2         # b2 address -> t0
    sb t4, 0(t0)      # t4 -> Memory[b2]

    la t0, h2         # h2 address -> t0
    sh t5, 0(t0)      # t5 -> Memory[h2]
   
    # return 
    jr ra
