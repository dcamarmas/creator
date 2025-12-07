
#
# Creator (https://creatorsim.github.io/creator/)
#
 
.data
    a: .double 618.62228
    b: .double 898.344
    c: .double 9913.55
    
    d: .float 123.62228
    e: .float 456.344
    f: .float -7554.55
    
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
    fadd.d f6,  f0, f0
    fadd.d f8,  f2, f2
    fadd.d f10, f4, f4
    
    flw   f12,  0(x8)
    flw   f14,  0(x9)
    flw   f16,  0(x10)
    fadd.s f18,  f12, f14
    fadd.s f20,  f14, f16
    fadd.s f22, f16, f12
    
    li a7, 10
    ecall

