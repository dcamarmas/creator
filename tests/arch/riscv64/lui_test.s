.text
main:
    # Test 1: Small positive immediate value
    lui x10, 0x1           # Expected x1 = 0x0000000000001000

    # Test 2: Large positive immediate value
    lui x11, 0xFFFFF        # Expected x2 = 0x00000FFFFF000

    # Test 3: Negative immediate value
    lui x12, 0x80000        # Expected x3 = 0xFFFFFFFF80000000

    # Test 4: Edge case (maximum 20-bit value)
    lui x13, 0x7FFFF        # Expected x4 = 0x0007FFFF00000
    jr ra
