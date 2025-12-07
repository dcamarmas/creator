#
# Creator (https://creatorsim.github.io/creator/)
#

.data

.align 2

  byte:			.byte 120,257
  half:			.half 34
  word:			.word -5678
  string:  	.ascii "This is another string"

.text
main:
	# print int
	li $v0, 1
	li $a0, 6673
	syscall

	# print byte
  lb $a0, byte
  syscall
  
  # print out of range byte
  li $t0, 4
  la $t1, byte
  lb $a0, 1($t1)
  syscall
  
  # print half
  lh $a0, half
  syscall
  
  # print negative int
  lw $a0, word
  syscall
  
  # print float
  li $a0, 1.1
  syscall
  
  # string string
  lw $a0, string
  syscall