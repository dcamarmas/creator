
#
# Creator (https://creatorsim.github.io/creator/)
#

.text
    main:
      li  x5, 361
      li  x6, 2
      li  x7, 5
      li  x8, 0x44562
      bgeu x5, x8, jump1
      bgeu x8, x5, jump1
      
    jump2: 
      li t3, 34
      li a7, 10
      ecall

    jump1:
      li x5, 0x754
      li t6, 555
      bgeu x5, x6, jump2

