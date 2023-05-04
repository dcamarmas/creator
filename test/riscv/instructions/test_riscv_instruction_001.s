
#
# Creator (https://creatorsim.github.io/creator/)
#

.text
main:

    li x5, 10
    li x6, -30
    li x7, 0
    li x8, 0xFFFFFF

    add x9, x5, x6,   # 10 - 30
    add x10, x7, x9,  # -20 + 0
    add x11, x8, x10, # -20 + 0xFFFFFF