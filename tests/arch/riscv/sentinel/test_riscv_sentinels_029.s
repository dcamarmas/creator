
#
# ARCOS.INF.UC3M.ES
# BY-NC-SA (https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es)
#


.text

    main: 
            
            jal ra, test

            # exit
            li a7, 10
            ecall


    test:
            # crear "stack frame" para ra, fp y una variable local
            
            addi sp, sp, 4

            # return a7
           jr ra
