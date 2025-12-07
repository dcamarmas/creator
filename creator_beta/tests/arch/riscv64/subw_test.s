.text
main:
    # Test 1: Basic SUBW test
    lui s0, 0x00030       # s0 = 0x30000
    lui s1, 0x00010       # s1 = 0x10000
    subw s2, s0, s1       # Expected s2 = 0x20000

    # Test 2: SUBW with negative result
    lui s3, 0x00010       # s3 = 0x10000
    lui s4, 0x00020       # s4 = 0x20000
    subw s5, s3, s4       # Expected s5 = 0xFFFFFFFFFFFFF0000

    # Test 3: SUBW resulting in zero
    lui s6, 0x00050       # s6 = 0x50000
    subw s10, s6, s6      # Expected s10 = 0x0

    # Test 4: Edge case - max 32-bit value
    lui s11, 0x7FFF0      # s11 = 0x7FFF0000
    subw s7, s11, x0      # Expected s7 = 0x7FFF0000