#
# Creator (https://creatorsim.github.io/creator/)
# Example: Various data types in data segment and memory operations
#

.data
.align 4

# Different data types in data segment
byte_values:    .byte    0x42, 0x73, 0xA5, 0xFF
                .byte    -128, 127, 0, 55

.align 2  
half_values:    .half    0x1234, 0x5678, 0xABCD, 0xEF12
                .half    -32768, 32767, 0, 12345

.align 4
word_values:    .word    0x12345678, 0x87654321, 0xDEADBEEF, 0xCAFEBABE
                .word    -2147483648, 2147483647, 0, 1000000

.align 3
double_values:  .dword   0x123456789ABCDEF0, 0xFEDCBA9876543210
                .dword   0x0123456789ABCDEF, 0xAAAABBBBCCCCDDDD

# String data
.align 1
string_data:    .string  "Hello, RISC-V!"
                .byte    0  # Null terminator

# Float data (stored as word)
.align 4
float_data:     .word    0x40490FDB  # Pi as IEEE 754 float (3.14159...)
                .word    0x402DF854  # e as IEEE 754 float (2.71828...)

# Target memory locations for writing
.align 4
target_area:    .space   256  # Reserve 256 bytes for writing data

.text
main:
        # Set up base addresses
        la   t0, byte_values
        la   t1, half_values
        la   t2, word_values
        la   t3, double_values
        la   t4, target_area
        
        # Copy and manipulate byte data
        lb   a0, 0(t0)          # Load first byte (0x42)
        sb   a0, 0(t4)          # Store to target area
        lb   a1, 3(t0)          # Load fourth byte (0xFF)
        sb   a1, 1(t4)          # Store to target area + 1
        
        # Manipulate and store modified byte
        addi a0, a0, 1          # Increment byte value
        sb   a0, 2(t4)          # Store modified byte
        
        # Copy and manipulate half-word data
        lh   a0, 0(t1)          # Load first half (0x1234)
        sh   a0, 4(t4)          # Store to target area + 4
        lh   a1, 6(t1)          # Load fourth half (0xEF12)
        sh   a1, 6(t4)          # Store to target area + 6
        
        # Perform arithmetic on half-word and store
        add  a2, a0, a1         # Add two half-words
        sh   a2, 8(t4)          # Store result
        
        # Copy and manipulate word data
        lw   a0, 0(t2)          # Load first word (0x12345678)
        sw   a0, 12(t4)         # Store to target area + 12
        lw   a1, 12(t2)         # Load fourth word (0xCAFEBABE)
        sw   a1, 16(t4)         # Store to target area + 16
        
        # Perform bitwise operations on words
        xor  a2, a0, a1         # XOR two words
        sw   a2, 20(t4)         # Store XOR result
        or   a3, a0, a1         # OR two words
        sw   a3, 24(t4)         # Store OR result
        and  a4, a0, a1         # AND two words
        sw   a4, 28(t4)         # Store AND result
        
        # Copy double-word data (64-bit)
        ld   a0, 0(t3)          # Load first double-word
        sd   a0, 32(t4)         # Store to target area + 32
        ld   a1, 8(t3)          # Load second double-word
        sd   a1, 40(t4)         # Store to target area + 40
        
        # Create and store new data patterns
        li   a0, 0x55AA55AA     # Create alternating bit pattern
        sw   a0, 48(t4)         # Store pattern
        
        # Store sequential byte pattern
        li   a0, 0x01           # Start with 1
        li   a1, 8              # Counter for 8 bytes
        addi a2, t4, 52         # Start address for pattern
        
        jr ra