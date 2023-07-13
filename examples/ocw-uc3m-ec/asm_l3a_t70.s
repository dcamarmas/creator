
#
# ARCOS.INF.UC3M.ES
# BY-NC-SA (https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es)
#


.text
main:
        li  $t1, 1
        li  $t2, 2
  if_3: bge $t1, $t2, else_3
then_3: # acción 1
        b fi_3
else_3: # acción 2
  fi_3: # ...
