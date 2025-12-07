
# Creator (https://creatorsim.github.io/creator/)
#

.text
main:

    li $t0, 23457464
    li $t1, 222
    li $t2, 0xFABB53
    li $t3, -23457475
    
    addu $t4, $t0, $t1
    addu $t5, $t1, $t2
    addu $t6, $t2, $t3
    addu $t7, $t3, $t0