
#
# ARCOS.INF.UC3M.ES
# BY-NC-SA (https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es)
#


.text

	main: 
			
			li $s0, 5
            jal test

            # exit
            li $v0, 10
            syscall


	test:
            # crear "stack frame" para $ra, $fp y una variable local
            subu $sp, $sp, 4
            sw   $s0, ($sp)

			li $s0, 5

            addu $sp, $sp, 4

            # return $v0
            jr $ra
