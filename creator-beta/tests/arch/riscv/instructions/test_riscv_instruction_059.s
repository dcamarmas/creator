
#
# Creator (https://creatorsim.github.io/creator/)
#
 
.data
    a: .double 256.0
    b: .double 3481.0
    c: .double 5476.0
    
    d: .float 9801.0
    e: .float 8281.0
    f: .float 9216.0
    
.text
main:
    la x5, a
    la x6, b
    la x7, c
    
    la x8, d
    la x9, e
    la x10, f
    
    fld   f0,  0(x5)
    fld   f2,  0(x6)
    fld   f4, 0(x7)
    fmadd.d f6, f0, f0, f0
    fmadd.d f8, f2, f2, f2
    fmadd.d f10, f4, f4, f4
    
    flw   f12,  0(x8)
    flw   f14,  0(x9)
    flw   f16,  0(x10)
    fmadd.s f6, f12, f12, f12
    fmadd.s f8, f14, f14, f14
    fmadd.s f10, f16, f16, f16
    
    li a7, 10
    ecall

