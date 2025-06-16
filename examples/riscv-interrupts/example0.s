#
# Creator (https://creatorsim.github.io/creator/)
#

.kdata
                console_ctrl_addr: .word 0xF0000000
                console_data_addr: .word 0xF0000008
.ktext
                # free up registers
                csrrw t0, MCAUSE, t0  # swap t0 w/ mcause
                csrrw t1, MSCRATCH, t1  # swap t1 w/ mscratch

                # we can now safely work w/ t0 & t1

                # For the whole kernel we won't write to any of the other
                # registers, as we don't want to overwrite data.

                # Another alternative is to store the value of another register,
                # e.g. t3, in the stack, and popping it at the end, but that
                # risks an stack overflow.

                # decode interruption

                # ecall
                li t1, 256
                beq t0, t1, rti_ecall

rti_ecall:
                # load in t0 console data addr
                la t0, console_data_addr
                lw t0, 0(t0)

                # decode ecall

                # 4 is print string
                li t1, 4
                beq a7, t1, rti_print

                # 11 is print char
                li t1, 11
                beq a7, t1, rti_print_char

                # 8 is read string
                li t1, 8
                beq a7, t1, rti_read_string

                j rti_end

rti_print:
                # load in t1 console ctrl addr
                la t1, console_ctrl_addr
                lw t1, 0(t1)

                sw a0, 0(t0)  # store in device data (a0)
                sw a7, 0(t1)  # print to console

                j rti_end

rti_print_char:
                # load in t1 console ctrl addr
                la t1, console_ctrl_addr
                lw t1, 0(t1)

                sb a0, 0(t0)  # store in device data (a0)
                sw a7, 0(t1)  # print to console

                j rti_end

rti_read_string:
                # load in t1 console ctrl addr
                la t1, console_ctrl_addr
                lw t1, 0(t1)

                sw a0, 0(t0)  # save string addr
                sw a1, 4(t0)  # save len

                # signal device
                sw a7, 0(t1)

                # store value back to a0
                lw a0, 0(t0)

                j rti_end


rti_end:		csrrw t0, MCAUSE, t0  # restore t0
                csrrw t1, MSCRATCH, t1  # restore t1
                mret


.data
                space:   .zero 100  # space for our input string
                string1: .string "What's your name?"
                string2: .string "Hello, "
.text

main:  			# ask for name
                la a0, string1
                li a7, 4
                ecall

                # read name
                la a0, space
                li a1, 10
                li a7, 8
                ecall

                # print a newline
                li a0, '\n'
                li a7, 11
                ecall

                # print "Hello, "
                la a0, string2
                li a7, 4
                ecall

                # print name
                la a0, space
                li a7, 4
                ecall

                # print '!'
                li a0, '!'
                li a7, 11
                ecall


                jr ra
