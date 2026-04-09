
#
# Creator (https://creatorsim.github.io/creator/)
#

.text
    main:
      li  $s0, -40
      li  $s1, -10
      li  $s2,  15
      li  $s3,  32

      blt $s0, $s0, j0
      li $t0, 1
j0:   blt $s0, $s1, j1
      li $t1, 1
j1:   blt $s1, $s0, j2
      li $t2, 1
j2:   blt $s2, $s2, j3
      li $t3, 1
j3:   blt $s2, $s3, j4
      li $t4, 1
j4:   blt $s3, $s2, j5
      li $t5, 1
j5:   blt $s0, $s2, j6
      li $t6, 1
j6:   blt $s2, $s0, j7
      li $t7, 1
j7:   blt $s1, $s3, j8
      li $t8, 1
j8:   blt $s3, $s1, end
      li $t9, 1

end:  jr $ra
