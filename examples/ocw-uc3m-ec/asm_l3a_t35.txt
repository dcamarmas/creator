
#
# ARCOS.INF.UC3M.ES
# BY-NC-SA (https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es)
#


.text
main:
      li   $t1, 5
      li   $t2, 7
      li   $t3, 8
      addi $t4, $t2, -10
      mul  $t4, $t4, $t1
      add  $t4, $t4, $t3
      mul  $t4, $t4, -1

