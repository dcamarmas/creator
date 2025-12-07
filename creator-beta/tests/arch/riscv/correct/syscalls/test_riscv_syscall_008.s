
#
# Creator (https://creatorsim.github.io/creator/)
#

.data

	.align 2

	buffer:	.zero 30

.text
	main:
      li a7, 8
      la a0, buffer
      li a1, 5
      ecall