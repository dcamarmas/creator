.data
	console_ctrl_addr: .word   0xF0000000
    console_data_addr: .word   0xF0000008
               string: .string "This is a string"

.text
	main:
        # load console data addr to t0
        la t0, console_data_addr
        lw t0, 0(t0)

        # load console ctrl addr to t1
        la t1, console_ctrl_addr
        lw t1, 0(t1)

        # write 69
        li t2, 69
        sw t2, 0(t0)  # store value in console data

        li t2, 1
        sw t2, 0(t1)  # signal device to write an integer

        li t2, 2
        sw t2, 0(t1)  # signal device to write a float

        li t2, 3
        sw t2, 0(t1)  # signal device to write a double

        li t2, 11
        sw t2, 0(t1)  # signal device to write a char

        # write string addr
        la t2, string
        sw t2, 0(t0)  # store value in console data
        li t2, 4
        sw t2, 0(t1)  # signal device to write a string

        jr ra