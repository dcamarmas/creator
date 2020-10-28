
#
# ARCOS.INF.UC3M.ES
# BY-NC-SA (https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es)
#


.text
main:
        li   $t0, 0  #i
        li   $t1, 45 #n
        li   $t2, 32
        li   $t3, 0    #s
while:  bge  $t0, $t2, fin
        and  $t4, $t1, 1
        add  $t3, $t3, $t4
        srl  $t1, $t1, 1
        addi $t0, $t0, 1
        b    while
fin:    # ...

