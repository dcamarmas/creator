
#
# Creator (https://creatorsim.github.io/creator/)
#

.data
    msg:  .string "Please, insert the first number: "
    msg2: .string "Please, insert the second number: "
    msg3: .string "The result is: "

.text
main:
    # print "insert first..."
    la a0, msg
    li a7, 4
    ecall

    # read int
    li a7, 5
    ecall

    add t0, a0, zero

    # print "insert second..."
    la a0, msg2
    li a7, 4
    ecall

    # read int
    li a7, 5
    ecall

    add t1, a0, zero
    add t2, t0, t1

    # print "result..."
    la a0, msg3
    li a7, 4
    ecall

    # print t2
    add a0, t2, zero
    li a7, 1
    ecall

    # return 
    jr ra

