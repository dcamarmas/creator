
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
    fsub.d f6,  f0, f2
    fsub.d f8,  f2, f4
    fsub.d f10, f4, f0
    
    flw   f12,  0(x8)
    flw   f14,  0(x9)
    flw   f16,  0(x10)
    fsub.s f18,  f12, f14
    fsub.s f20,  f14, f16
    fsub.s f22, f16, f12
    
    li a7, 10
    ecall

