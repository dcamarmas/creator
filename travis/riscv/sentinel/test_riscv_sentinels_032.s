
#
# ARCOS.INF.UC3M.ES
# BY-NC-SA (https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es)
#


.text

	main: 
			
			li s0 2
            jal ra test

            # exit
            li a7 10
            ecall


	test:
            # crear "stack frame" para ra, fp y una variable local
            addi sp sp -8
            sw   s0 0(sp)

			li s0 2

	b_efs:  lw   s0 0(sp)
    
            addi sp sp 8

            # return a7
            jr ra
