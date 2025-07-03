.data
    msg:    .string "Hello, World!"
    .align 4
    nums:   .word 0x12345678, 0x9ABCDEF0, 0xDEADBEEF, 0xCAFEBABE
    bytes:  .byte 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08
    
.text
    .globl main
main:
    # Load address of message
    la a0, msg
    
    # Load address of nums array
    la t6, nums
    
    # Load some values
    lw t0, 0(t6)
    lw t1, 4(t6)
    lw t2, 8(t6)
    lw t3, 12(t6)
    
    # Load address of bytes array
    la t5, bytes
    
    # Load bytes
    lb t4, 0(t5)
    lb t5, 1(t5)
    
    # Exit
    li a7, 10
    ecall
