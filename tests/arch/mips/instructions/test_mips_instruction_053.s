
#
# Creator (https://creatorsim.github.io/creator/)
#

.text
    main:
      li  $s0, -10
      li  $s1,  15
      move  $t4, $ra

      bgezal $s0, j0
      li $t0, 1
j0:   move $t5, $ra
      bgezal $s1, j1
      li $t1, 1
j1:   move $t6, $ra
      bgezal $0, end
      li $t2, 1
end:  move $t7, $ra

      move $ra, $t4
      jr $ra
