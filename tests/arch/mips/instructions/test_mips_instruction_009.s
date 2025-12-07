
#
# Creator (https://creatorsim.github.io/creator/)
#

.text
    main:
      li  $t0, 361
      li  $t1, 2
      li  $t2, 5
      li  $t3, 0x44562
      blt $t0, $t2, jump1
      blt $t1, $t0, jump1

    jump2:
      li $t6, 34
      li $v0, 10
      syscall

    jump1:
      li $t4, 11
      li $t5, 555
      blt $t4, $t5, jump2
