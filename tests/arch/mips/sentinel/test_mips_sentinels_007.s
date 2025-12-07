
#
# ARCOS.INF.UC3M.ES
# BY-NC-SA (https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es)
#


.text

	main: 
			
			li $k0, 5
            jal test

            # exit
            li $v0, 10
            syscall


	test:
            # crear "stack frame" para $ra, $fp y una variable local
            
			li $k0, 5

            # return $v0
           jr $ra
