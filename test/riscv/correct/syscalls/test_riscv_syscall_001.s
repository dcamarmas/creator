#
# Creator (https://creatorsim.github.io/creator/)
#

.data

.align 2

  byte:			.byte 120,257
  half:			.half 34
  word:			.word -5678
  string:  		.string "This is another string"

.text
main:
	# print int
	li a7, 1
	li a0, 6673
	ecall

	# print byte
  la t1, byte
  lb a0, 0(t1)
  ecall
  
  # print out of range byte
  li t0, 4
  la t1, byte
  lb a0, 1(t1)
  ecall
  
  # print half
  la t1, half
  lh a0, 0(t1)
  ecall
  
  # print negative int
  la t1, word
  lw a0, 0(t1)
  ecall
  
  # print float
  li a0, 1.1
  ecall
  
  # string string
  la t1, string
  lw a0, 0(t1)
  ecall