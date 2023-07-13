
#
# ARCOS.INF.UC3M.ES
# BY-NC-SA (https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es)
#


.text
main:
      li   $t0, -3
      move $t1, $t0
      rol  $t1, $t1, 1
      and  $t1, $t1, 0x00000001
