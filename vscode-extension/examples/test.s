.text
main:
    # Simple RISC-V assembly program for testing the debugger
    addi x1, x0, 20      # Load immediate 10 into register x1
    addi x2, x0, 20      # Load immediate 20 into register x2
    add x3, x1, x2       # Add x1 and x2, store result in x3 (should be 30)
    sub x4, x3, x1       # Subtract x1 from x3, store in x4 (should be 20)
    
    # Branching example
    beq x1, x1, equal   # Branch if x1 equals x1 (always true)
    addi x5, x0, 99      # This should not execute
    
equal:
    addi x5, x0, 42      # Load 42 into x5
    
    # Loop example
    addi x6, x0, 3       # Counter = 3
    addi x7, x0, 0       # Sum = 0
    
loop:
    add x7, x7, x6       # Add counter to sum
    addi x6, x6, -1      # Decrement counter
    bne x6, x0, loop     # Branch if counter != 0
    
    # Final instruction
    nop                  # No operation (end of program)
