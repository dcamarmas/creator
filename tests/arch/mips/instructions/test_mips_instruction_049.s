
#
# Creator (https://creatorsim.github.io/creator/)
#

.text
main:

  li $t0, 0x234566
  li $t1, -466742

  mthi $t0
  mtlo $t1

  mfhi $t3
  mflo $t4
