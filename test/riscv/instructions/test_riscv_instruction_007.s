
#
# Creator (https://creatorsim.github.io/creator/)
#

.text
    main:
      li  x5, 0x44562
      li  x6, 2
      li  x7, 5
      li  x8, 0x44562
      beq x7, x5, jump1
      beq x5, x6, jump1

    jump2:
      li t3, 34
      li a7, 10
      ecall

    jump1:
      li x5, 11
      li x6, 555
      beq x0, x0, jump2
