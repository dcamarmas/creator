.text
main:
    # Test 1: Basic positive addition
    lui s0, 0x00010           # s0 = 0x10000
    addiw s1, s0, 100         # Expected s1 = 0x10064

    # Test 2: Addition with negative immediate
    lui s2, 0x00020           # s2 = 0x20000
    addiw s3, s2, -50         # Expected s3 = 0x1FFCE

    # Test 3: Addition resulting in zero
    lui s4, 0x00001       # s4 = 0x1000
    addiw s5, s4, -2048    # E xpected s5 = 0x800
    addiw s5, s5, -2048     # Expected s5 = 0x0

    # Test 4: Maximum positive immediate
    lui s6, 0x00100           # s6 = 0x100000
    addiw s7, s6, 2047        # Expected s7 = 0x1007FF

    # Test 5: Positive overflow
    lui s8, 0x7FFFF           # s8 = 0x7FFFF000 
    addiw s9, s8, 2047      # Need to do it in steps to avoid inmediate overflow
    addiw s9, s9, 2047
    addiw s9, s9, 1           # s8 = 0x7FFFFFFF
    addiw s9, s9, 1           # Expected s9 = 0xFFFFFFFF80000000

    # Test 6: Negative overflow
    lui s10, 0x80000          # s10 = 0x80000000
    addiw s11, s10, -1        # Expected s11 = 0x7FFFFFFF