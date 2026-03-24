
#
# Creator (https://creatorsim.github.io/creator/)
#

.text
    main:
      li  s0, -10
      li  s1,  15

      bgtz s0, j0
      li t0, 1
j0:   bgtz s1, j1
      li t1, 1
j1:   bgtz x0, end
      li t2, 1

end:  jr ra
