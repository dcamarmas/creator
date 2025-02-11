
#
# Creator (https://creatorsim.github.io/creator/)
#

.data
	a: .zero 4

.text
main:
	
	la t0, a
    li t1, 10
	sw t1, 1(t0)