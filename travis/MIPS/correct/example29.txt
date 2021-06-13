
#
# Creator (https://creatorsim.github.io/creator/)
#
# Caso de prueba donde el programa lee cadenas
# No hay problemas a la hora de añadir numeros o con cadenas de mayor tamaño que a1
# Si en a1 introduces un valor negativo coge todo lo que hayas escrito en consola hasta la memoria reservada en el space,
# es decir, si a1 es -1 y space es 30, leera 30

.data

	.align 2

	buffer:	.space 30

.text
	main:
      li $v0, 8
      la $a0, buffer
      li $a1, -1
      syscall
      li $t1, 2
    
