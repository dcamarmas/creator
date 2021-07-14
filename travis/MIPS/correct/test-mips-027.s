
#
# Creator (https://creatorsim.github.io/creator/)
#
# Caso de prueba donde el programa lee float
# Si escribes una letra aparece NaN
# Si escribes un float seguido de letra, elimina la letra
# Si escribes un float negativo seguido de letra, elimina la letra

.text
main:
	li $v0 6
    syscall
    mov.s $f1, $f0
    
    
    
