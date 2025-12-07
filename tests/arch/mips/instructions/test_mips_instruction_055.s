
#
# Creator (https://creatorsim.github.io/creator/)
#

.text
    main:
      li  $t0, 1
      li  $t1, -1
      blez $t0, jump1
      blez $t1, jump1

    jump2:
      li $t6, 34
      li $v0, 10
      syscall

    jump1:
      li $t4, 0
      blez $t4, jump2
