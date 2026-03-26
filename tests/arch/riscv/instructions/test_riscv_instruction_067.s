
#
# Creator (https://creatorsim.github.io/creator/)
#

.text
    main:
      li  s0, -10
      li  s1,  15

      bgez s0, j0
      li t0, 1
j0:   bgez s1, j1
      li t1, 1
j1:   bgez x0, end
      li t2, 1

end:  jr ra
