
#
# ARCOS.INF.UC3M.ES
# BY-NC-SA (https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es)
#


.text

    main: 
            li t0, 1
            li a0, 5
            jal ra, test

            # exit
            li a7, 10
            ecall


    test:
            # crear "stack frame" para ra, fp y una variable local
            addi sp, sp, -12
            sw   ra, 8(sp)
            sw   fp, 4(sp)
            addi fp, sp, 4

            li t0, 2

    b_efs:  lw   ra, 8(sp)
            lw   fp, 4(sp)
            addi sp, sp, 12

            # return a7
           jr ra
