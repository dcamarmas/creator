
#
# Creator (https://creatorsim.github.io/creator/)
#

.data
    string: .string "Insert the string: "
    space:   .zero 100

.text
main:
    # print "Insert string..."
    la a0, string
    li a7, 4
    ecall

    # read string
    la  a0, space
    li a1, 100
    li a7, 8
    ecall

    # print enter
    la a0, '\n'
    li a7, 11
    ecall

    # print string
    la a0, space
    li a7, 4
    ecall

    # return
    jr ra
