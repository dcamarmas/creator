.text
main:
    # Initialize registers with 32-bit values (sign-extended to 64 bits)
    # s1 = 0x00010000
    lui s1, 0x00010       # s1 = 0x0000000000010000

    # s2 = 0x00020000
    lui s2, 0x00020       # s2 = 0x0000000000020000

    # Test 1: Small positive addition
    addw s3, s1, s2        # Expected s3 = 0x0000000000030000

    # Test 2: Large positive addition
    lui s4, 0x7FFF0        # s4 = 0x0000000007FFF0000
    addw s5, s4, s4        # Expected s5 = 0x000000000FFFE0000

    # Test 3: Addition resulting in negative value
    lui s6, 0x80000        # s6 = 0xFFFFFFFF80000000 (negative, correct)
    addw s7, s1, s6        # Expected s7 = 0xFFFFFFFF80010000

    # Test 4: Edge case - max 32-bit signed + 0x10000
    lui s8, 0x7FFF0        # s8 = 0x0000000007FFF0000
    addw s9, s8, s1        # Expected s9 = 0x0000000080000000
