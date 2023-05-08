
#
# Creator (https://creatorsim.github.io/creator/)
#

.text
    main:
      li  x5, 361
      li  x6, 2
      li  x7, 5
      li  x8, 0x44562
      bltu x5, x7, jump1
      bltu x6, x5, jump1

    jump2:
      li t3, 34
      li a7, 10
      ecall

    jump1:
      li x9, 0x754
      li x10, 555
      bltu x10, x9, jump2
