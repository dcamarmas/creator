.text

main:
    # Test 1: Simple shift left (1 -> 2)
    lui s1, 0x0
    addi s1, s1, 1        # s1 = 1
    slli s2, s1, 1        # Expected: 2

    # Test 2: Shift by 20
    lui s3, 0x0
    addi s3, s3, 1        # s3 = 1
    slli s4, s3, 20       # Expected: 0x100000

    # Test 3: Shift negative
    lui s5, 0xFFFFF       # Load -1 
    addi s5, s5, 0xFFF    # s5 = -1
    slli s6, s5, 32       # Expected: 0xFFFFFFFF00000000

    # Test 4: Maximum shift (63)
    lui s7, 0x0
    addi s7, s7, 1        # s7 = 1
    slli s8, s7, 63       # Expected: 0x8000000000000000

    # Test 5: Large value shift
    lui s9, 0x7FFFF       # Load large positive
    slli s10, s9, 1       # Expected: 0xFFFE0000