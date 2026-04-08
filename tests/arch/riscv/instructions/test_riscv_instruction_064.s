
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
    
    fle.d x11, f0, f0
    fle.d x12, f2, f2
    fle.d x13, f0, f2
    fle.d x14, f2, f0
    fle.d x15, f0, f4
    fle.d x16, f4, f4
    
    flw   f12,  0(x8)
    flw   f14,  0(x9)
    flw   f16,  0(x10)
    
    fle.s x17, f12, f12
    fle.s x18, f14, f14
    fle.s x19, f12, f14
    fle.s x20, f14, f12
    fle.s x21, f12, f16
    fle.s x22, f16, f16
    
    li a7, 10
    ecall

