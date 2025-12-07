
#
# Creator (https://creatorsim.github.io/creator/)
#

.text
    main:
      li  $t0, 882
      li  $t1, 881
      li  $t2, 543
      blt $t0, $t1, jump1
      blt $t2, $t1, jump1

    jump2:
      li $t6, 34
      li $v0, 10
      syscall

    jump1:
      li $t4, 11
      li $t5, 555
      blt $t4, $t5, jump2
