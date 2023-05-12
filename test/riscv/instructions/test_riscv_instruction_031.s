
#
# Creator (https://creatorsim.github.io/creator/)
#
 
.data
    a: .double 34.544
    b: .double 11.443
    c: .double 0x7544FFB
    
    d: .zero 24
    
.text
main:
    la x5, a
    la x6, b
    la x7, c
    la x8, d
    
    fld   f0,  0(x5)
    fld   f2,  0(x6)
    fld   f10, 0(x7)
    
    fsd  f0,  0(x8)
    addi x8, x8, 8
    fsd  f2,  0(x8)
    addi x8, x8, 8
    fsd  f10, 0(x8)

    li a7, 10
    ecall

