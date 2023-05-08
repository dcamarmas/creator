
#
# ARCOS.INF.UC3M.ES
# BY-NC-SA (https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es)
#


.text

	main: 
			
			li $s0, 2
            jal test

            # exit
            li $v0, 10
            syscall


	test:
            # crear "stack frame" para $ra, $fp y una variable local
            subu $sp, $sp, 8
            sw   $s0, ($sp)

			li $s0, 2

	b_efs:  lw   $s0, ($sp)
    
            addu $sp, $sp, 8

            # return $v0
            jr $ra
