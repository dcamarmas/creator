
#
# Creator (https://creatorsim.github.io/creator/)
#

.text
    main:
      li  t0, -40
      li  t1, -10
      li  t2,  15
      li  t3,  32

      bgeu t0, t0, j0
      li s0, 1
j0:   bgeu t0, t1, j1
      li s1, 1
j1:   bgeu t1, t0, j2
      li s2, 1
j2:   bgeu t2, t2, j3
      li s3, 1
j3:   bgeu t2, t3, j4
      li s4, 1
j4:   bgeu t3, t2, j5
      li s5, 1
j5:   bgeu t0, t2, j6
      li s6, 1
j6:   bgeu t2, t0, j7
      li s7, 1
j7:   bgeu t1, t3, j8
      li s8, 1
j8:   bgeu t3, t1, end
      li s9, 1

end:  jr ra
