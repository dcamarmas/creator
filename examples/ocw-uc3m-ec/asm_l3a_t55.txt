
#
# ARCOS.INF.UC3M.ES
# BY-NC-SA (https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es)
#


.text
main:
       li   $t0, 0
       li   $t1, 10
while: bge  $t0, $t1, fin
       # acción dentro del bucle
       addi $t0, $t0, 1
       b while
  fin: # ...


