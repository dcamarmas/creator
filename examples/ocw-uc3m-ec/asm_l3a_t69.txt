
#
# ARCOS.INF.UC3M.ES
# BY-NC-SA (https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es)
#


.text
main:
        li  $t1, 1
        li  $t2, 2
  if_2: bge $t1, $t2, fin_2
then_2: move $t1, $t2

 fin_2: # ...
