
#
# Creator (https://creatorsim.github.io/creator/)
#

.text
      main:
      li $t0, 4
      li $t1, 2
      ble $t0, 5, jump1
      
    jump2: 
      li $t3, 34
      li $v0, 10
      syscall

    jump1:
      li $t9, 11
      li $t8, 555
      b jump2
