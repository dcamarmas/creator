
#
# Creator (https://creatorsim.github.io/creator/)
#

.text
    main:

      li  t0, 4
      li  t1, 2
      li  t3, 5
      bge t3, t0 jump1
      
    jump2: 
      li t3, 34
      li a7, 10
      ecall

    jump1:
      li t4, 11
      li t5, 555
      beq x0, x0, jump2

      #return
      jr ra

