
#
# Creator (https://creatorsim.github.io/creator/)
#

.text
    main:
      li  $t0, 1
      li  $t1, 0
      bgez $t1, jump1
      bgez $t0, jump1

    jump2:
      li $t6, 34
      li $v0, 10
      syscall

    jump1:
      li $t4, 2
      bgez $t4, jump2
