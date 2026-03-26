
#
# Creator (https://creatorsim.github.io/creator/)
#

.text
    main:
      li  s0, -10
      li  s1,  15

      beqz s0, j0
      li t0, 1
j0:   beqz s1, j1
      li t1, 1
j1:   beqz x0, end
      li t2, 1

end:  jr ra
