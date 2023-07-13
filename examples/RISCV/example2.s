
#
# Creator (https://creatorsim.github.io/creator/)
#

.text
main:

    li t0, 10
    li t1, 13
    li t2, 45
    li t3, 33

    add t4, t0, t1  # 10+13
    sub t4, t2, t3  # 45-33
    mul t4, t3, t3  # 33*33
    div t4, t2, t0  # 45/10
    
    # print  last t4
    mv a0, t4
    li a7, 1
    ecall
   
    # return 
    jr ra

