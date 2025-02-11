#
# Creator (https://creatorsim.github.io/creator/)
#

.text
main:
	# print int
	li a7, 3
	li t0, 0x00001A11
    fcvt.d.w fa0, t0
	ecall

  	# print negative float
    li t0, 0xFFFFFFAA
    fcvt.d.w fa0, t0
    ecall
    
    li t0, 0x00000001
    fcvt.d.w fa0, t0
    ecall
    