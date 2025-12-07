
#
# Creator (https://creatorsim.github.io/creator/)
#

.text
main:

  li $t0, 0xAAD4
  li $t1, 4567
  li $t2, -9486

  srl $t3, $t0, 2
  srl $t4, $t1, 4
  srl $t5, $t2, 15
