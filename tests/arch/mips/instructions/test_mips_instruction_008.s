
#
# Creator (https://creatorsim.github.io/creator/)
#

.text
    main:
      li  $t0, 0x44562
      li  $t1, 2
      li  $t2, 5
      li  $t3, 0x44562
      bne $t2, $t0, jump1

    jump2:
      li $t6, 34
      li $v0, 10
      syscall

    jump1:
      li  $t4, 0x754
      li  $t5, 555
      bne $t0, $t2, jump2
