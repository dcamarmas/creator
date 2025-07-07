#
# Creator (https://creatorsim.github.io/creator/)
#

.data

.align 2

  byte:			.byte 120,255
  half:			.half 34
  word:			.word -5678
  string:  		.string "This is a string"

.align 2
  float:     .float 1.1

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
  
  # print half
  la t1, half
  lh a0, 0(t1)
  ecall
  
  # print negative int
  la t1, word
  lw a0, 0(t1)
  ecall
  
  # print float
  la t1, float
  flw f0, 0(t1)
  fmv.x.w a0, f0 # convert float to int to print it. This will print 1066192077, or 0x3F8CCCCD in hex
  ecall
  
  # string string
  li a7, 4
  la a0, string
  ecall
  jr ra