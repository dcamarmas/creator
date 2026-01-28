# Creatino Example: Starting Monitor Print
.data
	msg: .string "Hello! Serial here"

    	msg2: .string "Come soon!!"
.text
	main:
        # ESP-IDF needs to initiate Arduino component first
        jal ra, initArduino
        # Baud rate depends on the board you are using. Maybe the same values don't fit everywhere
        li a0, 115200
        jal ra, serial_begin
        la a0, msg    
        jal ra, serial_printf
        
        #Now, we will wait all the data is transmitted
        jal ra, serial_flush
        
        #Print again!!
        la a0, msg2    
        jal ra, serial_printf
        
           
        jr ra