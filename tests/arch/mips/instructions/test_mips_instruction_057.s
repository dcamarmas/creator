
#
# Creator (https://creatorsim.github.io/creator/)
#

.text
    main:
      li  $t0, 1
      li  $t1, 0
      li  $t2, -1
      bnez $t0, jump1

    jump2:
      li $t6, 34
      li $v0, 10
      syscall

    jump1:
      li $t4, 235363
      li $t5, 0xAA
      bnez $t4, jump2
