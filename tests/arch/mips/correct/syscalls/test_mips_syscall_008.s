
#
# Creator (https://creatorsim.github.io/creator/)
#

.data

	.align 2

	buffer:	.space 30

.text
	main:
      li $v0, 8
      la $a0, buffer
      li $a1, 5
      syscall