#
# Creator (https://creatorsim.github.io/creator/)
#

# Caso de prueba donde el programa solamente escribe float

.text
main:
	# Imprime un entero
	li $v0 2
	li.s $f12 6673
	syscall

  	# Imprime un valor negativo
    li.s $f12 -86.974
    syscall
    
    li.s $f12 1.1
    syscall
    