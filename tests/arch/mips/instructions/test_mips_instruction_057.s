
#
# Creator (https://creatorsim.github.io/creator/)
#

.text
    main:
      li  $t0, 0xAAB
      li  $t1, 0xBBA
      li  $t2, 0xAAB
      bnez $t0, $t2, jump1
      bnez $t0, $t1, jump1

    jump2:
      li $t6, 34
      li $v0, 10
      syscall

    jump1:
      li $t4, 235363
      li $t5, 0xAA
      bnez $t4, $t5, jump2
