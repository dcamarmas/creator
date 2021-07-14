#
# Creator (https://creatorsim.github.io/creator/)
#

# Caso de prueba donde el programa solamente escribe double

.text
main:
	# Imprime un entero
	li $v0 3
	li.d $FP12 6673
	syscall

  	# Imprime un valor negativo
    li.d $FP12 -86.974
    syscall
    
    li.d $FP12 1.1
    syscall
    