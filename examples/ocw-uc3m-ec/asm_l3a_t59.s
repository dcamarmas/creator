
#
# ARCOS.INF.UC3M.ES
# BY-NC-SA (https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es)
#


.text
main:
        li  $t0, 0
        li  $v0, 0
        li  $t2, 10
while1: 
        bgt $t0, $t2, fin1
        add $v0, $v0, $t0
        add $t0, $t0, 1
        b while1
  fin1: # ...


