
#
# Creator (https://creatorsim.github.io/creator/)
#

.text

main:
    li $a0, 23
    li $a1, -77
    li $a2, 45
    jal sum
    move $a0, $v0
    move $a1, $v1
    jal sub
    move $a0, $v0
    li $v0, 1
    syscall
    li $v0, 10
    syscall
    
sum:
    add $t1, $a0, $a1
    add $t2, $a2, $a2
    move $v0, $t1
    move $v1, $t2
    jr $ra  

sub:
    sub $v0, $a0, $a1
    jr $ra
 
