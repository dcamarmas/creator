/**
 * RISC-V Assembly Examples to Fail Each Sentinel Validation Rule
 *
 * These examples demonstrate violations of calling convention rules
 * that the new sentinel system will detect and report.
 *
 * RV32I version - using 32-bit instructions
 */

.text

# ============================================================================
# RULE 1: SAVE_BEFORE_USE
# Saved registers must be saved before modification
# ============================================================================

# Example: Use s0 without saving it first
myFunction1:
    # ERROR: s0 is a saved register but we never saved it to stack
    addi s0, s0, 10      # Modify s0 without saving first
    add  t0, s0, s0      # Use s0
    jr ra                # Return

# Expected violation:
# "Register s0 was used but never saved to memory"

# ============================================================================
# RULE 2: RESTORE_REQUIRED
# Saved registers must be restored before return
# ============================================================================

# Example: Save s0 but forget to restore it
myFunction2:
    # Save s0 to stack
    addi sp, sp, -4      # Allocate stack space
    sw   s0, 0(sp)       # Save s0

    # Use s0
    addi s0, s0, 10      # Modify s0
    add  t0, s0, s0      # Use s0

    # ERROR: Forgot to restore s0!
    # lw   s0, 0(sp)     # This line is missing
    addi sp, sp, 4       # Restore stack pointer
    jr ra                # Return

# Expected violation:
# "Register s0 was saved but never restored"

# ============================================================================
# RULE 3: RESTORE_ADDRESS_MISMATCH
# Restore must use same address as save
# ============================================================================

# Example: Save to one address but restore from different address
myFunction3:
    # Save s0 to stack
    addi sp, sp, -4      # Allocate stack space
    sw   s0, 0(sp)       # Save s0 at sp+0

    # Use s0
    addi s0, s0, 10      # Modify s0

    # ERROR: Restore from wrong address!
    lw   s0, 4(sp)       # Restore from sp+4 instead of sp+0
    addi sp, sp, 4       # Restore stack pointer
    jr ra                # Return

# Expected violation:
# "Register s0 saved at 0x7ffffc but restored from 0x7ffff8"

# ============================================================================
# RULE 4: SIZE_MISMATCH
# Save and restore must use same size
# ============================================================================

# Example: Save with 4 bytes but restore with 2 bytes
myFunction4:
    # Save s0 to stack
    addi sp, sp, -4      # Allocate stack space
    sw   s0, 0(sp)       # Save s0 with 4 bytes (word)

    # Use s0
    addi s0, s0, 10      # Modify s0

    # ERROR: Restore with wrong size!
    lh   s0, 0(sp)       # Restore with 2 bytes (half word) instead of 4
    addi sp, sp, 4       # Restore stack pointer
    jr ra                # Return

# Expected violation:
# "Register s0 saved with 4 bytes but restored with 2 bytes"

# ============================================================================
# RULE 5: VALUE_NOT_RESTORED
# Register value must be restored to original
# ============================================================================

# Example: Modify register and don't restore its value
myFunction5:
    # Save s0 to stack
    addi sp, sp, -4      # Allocate stack space
    sw   s0, 0(sp)       # Save s0

    # Use s0
    addi s0, s0, 10      # Modify s0

    # ERROR: Restore the saved value but then modify again!
    lw   s0, 0(sp)       # Restore s0 from stack
    addi s0, s0, 5       # ERROR: Modify s0 again after restoring!
    addi sp, sp, 4       # Restore stack pointer
    jr ra                # Return

# Expected violation:
# "Register s0 value changed but not properly restored"

# ============================================================================
# RULE 6: STACK_NOT_RESTORED
# Stack pointer must be restored before return
# ============================================================================

# Example: Don't restore the stack pointer
myFunction6:
    # Save s0 to stack
    addi sp, sp, -4      # Allocate stack space
    sw   s0, 0(sp)       # Save s0

    # Use s0
    addi s0, s0, 10      # Modify s0

    # Restore s0
    lw   s0, 0(sp)       # Restore s0

    # ERROR: Forgot to restore stack pointer!
    # addi sp, sp, 4     # This line is missing
    jr ra                # Return

# Expected violation:
# "Stack pointer not restored: entered at 0x800000, exited at 0x7ffffc"

# ============================================================================
# BONUS: Multiple Violations in One Function
# ============================================================================

# Example: Multiple calling convention violations
badFunction:
    # Save s0 but not s1
    addi sp, sp, -8      # Allocate stack space
    sw   s0, 0(sp)       # Save s0 at sp+0
    sw   s1, 4(sp)       # Save s1 at sp+4

    # Use both registers
    addi s0, s0, 10      # Modify s0
    addi s1, s1, 20      # Modify s1

    # Restore s0 from wrong address and wrong size
    lh   s0, 4(sp)       # ERROR: Wrong address (sp+4) and wrong size (2 bytes)

    # Don't restore s1 at all
    # ERROR: s1 not restored

    # Restore stack pointer incorrectly
    addi sp, sp, 4       # ERROR: Should be +8, now sp is wrong
    jr ra                # Return

# Expected violations:
# "Register s0 saved at 0x7ffff8 but restored from 0x7ffffc"
# "Register s0 saved with 4 bytes but restored with 2 bytes"
# "Register s1 was saved but never restored"
# "Stack pointer not restored: entered at 0x800000, exited at 0x7ffffc"

# ============================================================================
# CORRECT EXAMPLE (for comparison)
# ============================================================================

# Example: Proper calling convention
goodFunction:
    # Save registers to stack
    addi sp, sp, -8      # Allocate stack space
    sw   s0, 0(sp)       # Save s0 at sp+0
    sw   s1, 4(sp)       # Save s1 at sp+4

    # Use registers
    addi s0, s0, 10      # Modify s0
    addi s1, s1, 20      # Modify s1
    add  t0, s0, s1      # Use both

    # Restore registers from stack
    lw   s0, 0(sp)       # Restore s0 from sp+0 (4 bytes)
    lw   s1, 4(sp)       # Restore s1 from sp+4 (4 bytes)

    # Restore stack pointer
    addi sp, sp, 8       # Deallocate stack space
    jr ra                # Return

# Expected: No violations (PASS)

# Main program - call all functions to demonstrate violations
main:
    jal ra, myFunction1
    jal ra, myFunction2
    jal ra, myFunction3
    jal ra, myFunction4
    jal ra, myFunction5
    jal ra, myFunction6
    jal ra, badFunction
    jal ra, goodFunction

    # Exit
    li a7, 93          # syscall exit
    li a0, 0           # exit code 0
    ecall