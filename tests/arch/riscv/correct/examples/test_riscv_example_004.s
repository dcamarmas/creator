
#
# Creator (https://creatorsim.github.io/creator/)
#
 
.data
    a: .double 34.544
    b: .double 11.443
    c: .double 665.4
    
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
    fadd.d f0,  f0,  f0
    fsub.d f4,  f10, f0
    fdiv.d f12, f10, f2
    
    fsd  f0,  0(x8)
    addi x8, x8, 8
    fsd  f4,  0(x8)
    addi x8, x8, 8
    fsd  f12, 0(x8)

    #return 
    jr ra

