
#
# ARCOS.INF.UC3M.ES
# BY-NC-SA (https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es)
#


.text
main:
          li   $t0, 8
          li   $t1, 4
          li   $t2, 1
          li   $t4, 0
 while:   bge  $t4, $t1, fin
          mul  $t2, $t2, $t0
          addi $t4, $t4, 1
          b    while
 fin:     move $v0,  $t2

