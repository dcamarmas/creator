
#
# Creator (https://creatorsim.github.io/creator/)
#

# Caso de prueba donde el programa solamente espera meter ints
# Se ha probado introduciendo enteros, float, caracteres y palabras
# Cuando se escribe un float, trunca bien
# Cuando se escribe un caracter, el programa pone un 0 y sigue su ejecucion
# Con palabras lo mismo
# Si pones un numero seguido de una letra, ignora la letra
# Si introduce un numero de más de 21 de longitud, solamente pone el numero mas significativo (6767676767677889999123 -> 6)
# Con un valor negativo coge el menos y el primer numero si se pasa de longitud

.text
main:
    li $v0 5
    syscall
    move $t0 $v0
    
    li $v0 5
    syscall
    move $t1 $v0
    
    li $v0 5
    syscall
    move $t2 $v0
    
    li $v0 5
    syscall
    move $t3 $v0