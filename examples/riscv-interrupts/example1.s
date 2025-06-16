#
# Creator (https://creatorsim.github.io/creator/)
#


# -------------- #
# --- KERNEL --- #
# -------------- #

.kdata
                console_ctrl_addr: .word 0xF0000000
                console_data_addr: .word 0xF0000008
                os_ctrl_addr: .word 0xF0000010
                os_data_addr: .word 0xF0000018
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

                # decode call code (a7)

                # 1 & 4 are generic prints
                li t1, 1
                beq a7, t1, rti_print
                li t1, 4
                beq a7, t1, rti_print

                # 2 & 3 are floating point prints
                blt a7, t1, rti_print_fp

                # 5-7 are generic reads
                li t1, 7
                ble a7, t1, rti_read

                # 8 is read string
                li t1, 8
                beq a7, t1, rti_read_string

                # 9 is sbrk
                li t1, 9
                beq a7, t1, rti_sbrk

                # 10 is exit
                li t1, 10
                beq a7, t1, rti_exit

                # 11 is print char
                li t1, 11
                beq a7, t1, rti_print_char

                # 12 is read char
                li t1, 12
                beq a7, t1, rti_read_char

                j rti_end

rti_print:      # print to console

                # load in t1 console ctrl addr
                la t1, console_ctrl_addr
                lw t1, 0(t1)

                sw a0, 0(t0)  # store a0 in device data
                sw a7, 0(t1)  # print to console

                j rti_end

rti_print_fp:   # print a floating point to console

                # load in t1 console ctrl addr
                la t1, console_ctrl_addr
                lw t1, 0(t1)

                fsw fa0, 0(t0)  # store fa0 in device data
                sw a7, 0(t1)  # print to console

                j rti_end

rti_print_char: # print a char to console

                # load in t1 console ctrl addr
                la t1, console_ctrl_addr
                lw t1, 0(t1)

                sb a0, 0(t0)  # store a0 in device data
                sw a7, 0(t1)  # print to console

                j rti_end

rti_read:       # read from console

                # load in t1 console ctrl addr
                la t1, console_ctrl_addr
                lw t1, 0(t1)

                sw a7, 0(t1)  # read from keyboard

                # floating point ops slightly differ
                li t1, 6
                beq a7, t1, rti_read_fp
                li t1, 7
                beq a7, t1, rti_read_fp

                # store value back to a0
                lw a0, 0(t0)

                j rti_end

rti_read_fp:
                flw fa0, 0(t0)  # store value back to fa0

                j rti_end

rti_read_string:# read a string from console

                # load in t1 console ctrl addr
                li t1, console_ctrl_addr
                lw t1, 0(t1)

                sw a0, 0(t0)  # save string addr
                sw a1, 4(t0)  # save len

                sw a7, 0(t1)  # signal device

                lw a0, 0(t0)  # store value back to a0

                j rti_end

rti_read_char:  # read a char from console

                # load in t1 console ctrl addr
                li t1, console_ctrl_addr
                lw t1, 0(t1)

                sw a7, 0(t1)  # signal device

                # store value back to a0
                la t1, console_data_addr
                lw t1, 0(t1)
                lb a0, 0(t1)

                j rti_end

rti_sbrk:       # reserve memory

                # load in t0 os data addr
                la t0, os_data_addr
                lw t0, 0(t0)

                # load in t1 os ctrl addr
                la t1, os_ctrl_addr
                lw t1, 0(t1)

                sw a0, 0(t0)  # store length
                sw a7, 0(t1)  # signal driver
                lw a0, 0(t1)  # store addr back to a0

                j rti_end

rti_exit:       # bye-bye

                # load in t1 os ctrl addr
                la t1, os_ctrl_addr
                lw t1, 0(t1)

                sw a7, 0(t1)  # signal driver

                j rti_end

rti_end:
                csrrw t0, MCAUSE, t0  # restore t0
                csrrw t1, MSCRATCH, t1  # restore t1

                mret  # return from RTI



# --------------- #
# --- PROGRAM --- #
# --------------- #


.data
                space:      .zero    100  # space for our input string
                msg_int:    .string  "Enter an integer... "
                msg_float:  .string  "Enter a float... "
                msg_double: .string  "Enter a double... "
                msg_string: .string  "Enter a string... "
                msg_char:   .string  "Enter a char... "
.text

print_newline:
                li a0, '\n'
                li a7, 11
                ecall

                jr ra

main:
                # read int
                li a7, 4
                la a0, msg_int
                ecall  # write msg
                li a7, 5
                ecall

                # print int
                li a7, 1
                ecall

                jal ra, print_newline

                # read float
                li a7, 4
                la a0, msg_float
                ecall  # write msg
                li a7, 6
                ecall

                # print float
                li a7, 2
                ecall

                jal ra, print_newline

                # read double
                li a7, 4
                la a0, msg_double
                ecall  # write msg
                li a7, 7
                ecall

                # print double
                li a7, 3
                ecall

                jal ra, print_newline

                # read string
                li a7, 4
                la a0, msg_string
                ecall  # write msg
                la a0, space
                li a1, 10
                li a7, 8
                ecall

                # print string
                li a7, 4
                ecall

                jal ra, print_newline

                # read char
                li a7, 4
                la a0, msg_char
                ecall  # write msg

                li a7, 12
                ecall  # read char

                # print char
                li a7, 11
                ecall

                # sbrk
                li a0, 4
                li a7, 9
                ecall

                # exit
                li a7, 10
                ecall

                jr ra