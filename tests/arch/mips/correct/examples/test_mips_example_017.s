
#
# Creator (https://creatorsim.github.io/creator/)
#

.data
    string: .asciiz "Insert the string: "
    space:  .space 100

.text
main:
    # print "Insert string..."
    la $a0, string
    li $v0, 4
    syscall

    # read string
    la $a0, space
    li $a1, 100
    li $v0, 8
    syscall

    # print enter
    la $a0, '\n'
    li $v0, 11
    syscall

    # print string
    la $a0, space
    li $v0, 4
    syscall

    # return
    jr $ra
