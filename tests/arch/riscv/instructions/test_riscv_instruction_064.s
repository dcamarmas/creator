
#
# Creator (https://creatorsim.github.io/creator/)
#
 
.data
    a: .double 256.0
    b: .double 3481.0
    
    d: .float 9801.0
    e: .float 9801.0
    
.text
main:
    la x5, a
    la x6, b
    la x8, d
    la x9, e
    
    fld   f0,  0(x5)
    fld   f2,  0(x6)
    
    fle.d x10, f0, f2
    
    flw   f12,  0(x8)
    flw   f14,  0(x9)
    
    fle.s x11, f12, f14
    
    li a7, 10
    ecall

