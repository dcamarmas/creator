#
# Creator (https://creatorsim.github.io/creator/)
#

.data
	console_ctrl_addr: .word   0xF0000000
   console_data_addr: .word   0xF0000008

.text
   rti:
      # t0 <- console data addr
      la t0, console_data_addr
      lw t0, 0(t0)
      
      # t1 <- console ctrl addr
      la t1, console_ctrl_addr
      lw t1, 0(t1)
      
      # console data <- a0
      sw a0, 0(t0)
      
      # console ctrl <- 11
      li t0, 11
      sw t0, 0(t1)
      
      # return from interrupt
      mret

   main:
      # enable interrupts (MIE=1)
      csrrw zero, mstatus, t0
      ori t0, t0, 8
      csrrw zero, mstatus, t0
      
      # enable software interrupts (MSIE=1)
      csrrw zero, mie, t0
      ori t0, t0, 8
      csrrw zero, mie, t0
      
      # load rti addr to mtvec
      la  t0, rti
      li  t1, 2
      sll t0, t0, t1
      csrrw zero, mtvec, t0

      # generate interrupt
      li a7, 11
      li a0, 'x'
      ecall

      li t0, 0
      jr ra
