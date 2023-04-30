
#
# ARCOS.INF.UC3M.ES
# BY-NC-SA (https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es)
#


.data
   .align 2
   vector: .space 40 # 10 enteros de 4 bytes cada
   

.text
main:
       la $t0, vector
       # vector(i=2) -> vector + (i*4)
       li $t1, 2         # $t1 = i
       mul $t2, $t1, 4    # $t1*4
       add $t2, $t2, $t0  # vector($t0) + $t1*4
      
       # 5 + vector(2)
       li $t5, 5
       lw $t3, ($t2)
       add $t5, $t5, $t3
       # vector(2) = 3
       li $t4, 3
       sw $t4, ($t2)
