.text
main:
        addi x1, x0, 1
        beq x0, x0, target    # Branch if equal using local label
        addi x6, x0, 0x123     # test value
        addi x0, x0, 0        # NOP
        addi x0, x0, 0        # NOP
        addi x0, x0, 0        # NOP
        slli x7, x7, 0       # Increment x7
target:
        addi x5, x5, 0x321        # Increment x5
        # Exit with status code 0
        li a0, 0