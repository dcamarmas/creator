
#
# Creator (https://creatorsim.github.io/creator/)
#

.text
    main:
      li  $t0, 1
      li  $t1, 0
      li  $t2, -1
      beqz $t0, jump1
      beqz $t2, jump1
      beqz $t1, jump1

    jump2:
      li $t6, 34
      li $v0, 10
      syscall

    jump1:
      li $t4, 0
      beqz $t4, jump2
