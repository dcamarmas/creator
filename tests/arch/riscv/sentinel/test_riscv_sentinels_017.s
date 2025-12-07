#
# ARCOS.INF.UC3M.ES
# BY-NC-SA (https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es)
#
# BAD EXAMPLE: This code VIOLATES RISC-V parameter conventions
# DO NOT follow this pattern in real code!
#

.text

    main: 
            # Set up important values in saved registers
            li s0, 100      # Important value that should be preserved
            li s1, 200      # Another important value
            li s2, 300      # Yet another important value
            
            # Pass parameters incorrectly - using saved registers instead of a0-a7
            li s3, 42       # WRONG: Should use a0 for first parameter
            li s4, 84       # WRONG: Should use a1 for second parameter
            
            # Call function - caller expects s0-s4 to be unchanged after call
            jal ra, bad_function
            
            # Try to use the values we set earlier - they will be corrupted!
            add t0, s0, s1  # Expected: 100 + 200 = 300, but will be wrong
            add t1, s2, s3  # Expected: 300 + 42 = 342, but will be wrong
            
            # exit
            li a7, 10
            ecall


    bad_function:
            # WRONG: Create stack frame but don't save caller's saved registers
            addi sp, sp, -12
            sw   ra, 8(sp)
            sw   fp, 4(sp)
            addi fp, sp, 4

            # VIOLATION 1: Destroy caller's saved registers without saving them
            li s0, 999      # WRONG: Overwrites caller's s0 (was 100)
            li s1, 888      # WRONG: Overwrites caller's s1 (was 200)
            li s2, 777      # WRONG: Overwrites caller's s2 (was 300)
            
            # VIOLATION 2: Use saved registers for parameters instead of a0-a7
            # Should read parameters from a0, a1, etc. but using s3, s4 instead
            add s0, s3, s4  # WRONG: Should use a0, a1 for parameters
            
            # VIOLATION 3: Don't set return value in a0
            # Function should return result in a0, but doesn't
            
            # VIOLATION 4: Use saved registers for local variables
            li s1, 555      # WRONG: Should use temporary registers t0-t6
            li s2, 444      # WRONG: Should use temporary registers t0-t6

    b_efs:  # WRONG: Restore stack but not the saved registers we corrupted
            lw   ra, 8(sp)
            lw   fp, 4(sp)
            addi sp, sp, 12

            # Return without setting a0 and with corrupted saved registers
            jr ra
