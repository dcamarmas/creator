
#
# Creator (https://creatorsim.github.io/creator/)
#

.text
main:

  li $t0, 0xAAD4
  li $t1, 4567
  li $t2, -9486

  rotr $t3, $t0, 2
  rotr $t4, $t1, 4
  rotr $t5, $t2, 15
