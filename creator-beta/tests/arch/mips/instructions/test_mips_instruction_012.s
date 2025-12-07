
#
# Creator (https://creatorsim.github.io/creator/)
#

.text
    main:
      li  $t0, 361
      li  $t1, 2
      li  $t2, 5
      li  $t3, 0x44562
      bgeu $t0, $t3, jump1
      bgeu $t3, $t2, jump1

    jump2:
      li $t6, 34
      li $v0, 10
      syscall

    jump1:
      li $t4, 0x754
      li $t5, 555
      bgeu $t4, $t5, jump2
