
#
# Creator (https://creatorsim.github.io/creator/)
#

.text
main:

    li x5, 547
    li x6, -937
    li x7, 12
    li x8, 0x123515

    sub x9, x5, x6   # 547 - (-937)
    sub x10, x7, x9  # 12 - 1484
    sub x11, x8, x10 # 0x123515 + 1472