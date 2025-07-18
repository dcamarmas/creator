# Simple RISC-V test program
.text
.globl _start

_start:
    addi x1, x0, 5      # Load 5 into x1
    addi x2, x0, 10     # Load 10 into x2
    add x3, x1, x2      # Add x1 and x2, store in x3
    nop                 # No operation
    nop                 # No operation
