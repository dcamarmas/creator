.data
	console_ctrl_addr: .word 0xF0000000
    console_data_addr: .word 0xF0000008

.text
	main:
        # load console data addr to t0
        la t0, console_data_addr
        lw t0, 0(t0)

        # load console ctrl addr to t1
        la t1, console_ctrl_addr
        lw t1, 0(t1)

        # write integer 69
        li t2, 69
        sw t2, 0(t0)  # store value in console data
        li t2, 1
        sw t2, 0(t1)  # signal device to write an integer
