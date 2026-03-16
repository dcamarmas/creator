
#
# Creator (https://creatorsim.github.io/creator/)
#
 
.data
    a: .double 256.0
    b: .double 3481.0
    c: .double NaN
    
    d: .float 9801.0
    e: .float 10502.5
    f: .double NaN
    
.text
main:
    la x5,  a
    la x6,  b
    la x7,  c
    la x8,  d
    la x9,  e
    la x10, f
    
    fld   f0,  0(x5)
    fld   f2,  0(x6)
    fld   f4,  0(x7)
    
    flt.d x11, f0, f0
    flt.d x12, f2, f2
    flt.d x13, f0, f2
    flt.d x14, f2, f0
    flt.d x15, f0, f4
    flt.d x16, f4, f4
    
    flw   f12,  0(x8)
    flw   f14,  0(x9)
    flw   f16,  0(x10)
    
    flt.s x17, f12, f12
    flt.s x18, f14, f14
    flt.s x19, f12, f14
    flt.s x20, f14, f12
    flt.s x21, f12, f16
    flt.s x22, f16, f16
    
    li a7, 10
    ecall

