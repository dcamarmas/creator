
#
# Creator (https://creatorsim.github.io/creator/)
#

#	Error de tag erronea

#	Si escribes una tag vacia solo con dos puntos funciona. ¿Deberia ser así?
#	Si no escribes ninguna tag tambien compila
#	No he encontrado otra forma de mostrar el error de tag erronea

 .data
 	.align 2
    :	.half 123
    .byte 498
    :	.word 5534
.text
main:
	li $t0 23