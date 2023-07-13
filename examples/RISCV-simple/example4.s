
#
# WepSIM (https://wepsim.github.io/wepsim/)
#

.text
main:
           # loop initialization
           lui x1,  0
           lui x2,  5
           lui x3,  1
           # loop header
    loop1: beq x1, x2, fin1
           # loop body
           add x1, x1, x3
           beq x0, x0, loop1

     fin1: jalr x0, 0(ra)

