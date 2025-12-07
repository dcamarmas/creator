
#
# Creator (https://creatorsim.github.io/creator/)
#

.text
main:

    li $t0, 0x22346
    li $t1, 4567
    li $t2, -9486

    li $t3, 0x455
    li $t4, 0x222
    li $t5, 0xFFF

    xor $t6, $t0, $t3
    xor $t7, $t1, $t4
    xor $t8, $t2, $t5
    
