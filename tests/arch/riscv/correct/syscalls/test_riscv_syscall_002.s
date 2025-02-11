#
# Creator (https://creatorsim.github.io/creator/)
#

.text
main:
	# print int
	li a7, 2
	li t0, 0x00001A11
    fcvt.s.w fa0, t0
	ecall

  	# print negative float
    li t0, 0xFFFFFFAA
    fcvt.s.w fa0, t0
    ecall
    
    li t0, 0x00000001
    fcvt.s.w fa0, t0
    ecall
    