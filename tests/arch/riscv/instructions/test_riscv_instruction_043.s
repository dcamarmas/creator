
#
# Creator (https://creatorsim.github.io/creator/)
#

.text
    main:
      li  x5, -882
      li  x6, -881
      li  x7, 5
      li  x8, 543
      bgtu x5, x6, jump1
      bgtu x8, x7, jump1

    jump2:
      li t3, 34
      li a7, 10
      ecall

    jump1:
      li x5, 11
      li x6, 555
      bgtu x6, x5, jump2
