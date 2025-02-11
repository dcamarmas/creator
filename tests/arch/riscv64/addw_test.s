.text
main:
    # Initialize registers with 32-bit values (sign-extended to 64 bits)
    # s1 = 0x00000001
    lui s1, 0x00010       # s1 = 0x0000000000010000

    # s2 = 0x00000002
    lui s2, 0x00020       # s2 = 0x0000000000020000

    # Test 1: Small positive addition
    add s3, s1, s2        # Expected s3 = 0x0000000000030000

    # Test 2: Large positive addition (overflow ignored)
    lui s4, 0x7FFF0        # s4 = 0x0000007FFF0000
    add s5, s4, s4        # Expected s5 = 0x0000FFFE00000000

    # Test 3: Addition resulting in negative value
    lui s6, 0x80000        # s6 = 0xFFFFFFFF80000000 (negative)
    add s7, s1, s6        # Expected s7 = 0xFFFFFFFF80001000

    # Test 4: Edge case - max 32-bit signed + (-1)
    lui s8, 0x7FFF0        # s8 = 0x00007FFF0000
    add s9, s8, x0        # Expected s9 = 0x00007FFF0000 (assuming x0 = 0)
