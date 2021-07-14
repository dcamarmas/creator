
#
# Creator (https://creatorsim.github.io/creator/)
#
# Caso de prueba donde el programa lee double
# Si escribes una letra aparece NaN
# Si escribes un double seguido de letra, elimina la letra
# Si escribes un double negativo seguido de letra, elimina la letra

.text
main:
	li $v0 7
    syscall
    mov.d $FP2, $FP0
    
    
    
