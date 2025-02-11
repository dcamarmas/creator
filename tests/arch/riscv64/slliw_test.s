.text

main:

# Load value 0x7FFFFFFF (max positive 32-bit integer)
li s0, 0xFFFFFFFF

# Shift left by 1 - should become negative
slliw s1, s0, 1

# Shift right by 1 - should become positive
srliw s2, s1, 1