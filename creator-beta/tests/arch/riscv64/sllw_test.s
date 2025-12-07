.text
main:
    # Test register-based shifts
    li s3, -35        # Load same test value
    slli s4, s3, 1     
    srli s5, s4, 1     
    srai s6, s4, 1     