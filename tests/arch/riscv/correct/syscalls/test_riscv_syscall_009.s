
#
# Creator (https://creatorsim.github.io/creator/)
#

.text
    main:
        li t0, 10
        li t1, 20
        
        li a7, 9
        li a0, 8
        ecall
        
        sw t0, 0(a0)
        sw t1, 4(a0)