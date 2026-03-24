
#
# Creator (https://creatorsim.github.io/creator/)
#

.text
    main:
      li  $s0, -40
      li  $s1, -10
      li  $s2,  15
      li  $s3,  32

      beq $s0, $s0, j0
      li $t0, 1
j0:   beq $s0, $s1, j1
      li $t1, 1
j1:   beq $s1, $s0, j2
      li $t2, 1
j2:   beq $s2, $s2, j3
      li $t3, 1
j3:   beq $s2, $s3, j4
      li $t4, 1
j4:   beq $s3, $s2, j5
      li $t5, 1
j5:   beq $s0, $s2, j6
      li $t6, 1
j6:   beq $s2, $s0, j7
      li $t7, 1
j7:   beq $s1, $s3, j8
      li $t8, 1
j8:   beq $s3, $s1, end
      li $t9, 1

end:  jr $ra
