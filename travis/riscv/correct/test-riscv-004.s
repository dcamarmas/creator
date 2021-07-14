
#
# Creator (https://creatorsim.github.io/creator/)
#
 
.data
    a: .double 34.544
    b: .double 11.443
    c: .double 665.4
    
    d: .section 24
    
.text
main:
    la x5 a
    la x6 b
    la x7 c
    la x8 d
    
    fld   FP0  0(x5)
    fld   FP2  0(x6)
    fld   FP10 0(x7)
    fadd.d FP0  FP0  FP0
    fsub.d FP4  FP10 FP0
    fdiv.d FP12 FP10 FP2
    
    fsd  FP0  0(x8)
    addi x8 x8 8
    fsd  FP4  0(x8)
    addi x8 x8 8
    fsd  FP12 0(x8)

    li a7 10
    ecall

