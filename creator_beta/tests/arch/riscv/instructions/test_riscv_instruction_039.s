
#
# Creator (https://creatorsim.github.io/creator/)
#

.text
main:

    li x5, 16
    li x6, 256
    li x7, -8192
    li x8, 24

    divu x9, x7, x5
    divu x10, x6, x5
    divu x11, x7, x8
    divu x12, x8, x7