.kdata

.ktext
     			# load mcause to t0
                csrrw MCAUSE t0
                csrrw MSCRATCH t1  # swap t1 w/ mscratch

                # treat interruption

                # if ecall
                li t1 256
				beq t0 t1 rti_ecall

rti_ecall:      li t1 1
				beq a7 t1 rti_print_int

rti_print_int:  print_int
				j rti_end

rti_end:		csrrw MCAUSE t0  # restore t0
				csrrw MSCRATCH t1  # restore t1
				mret

.data

.text

main:  			li a7 1
				li a0 69
				ecall
                jr ra
