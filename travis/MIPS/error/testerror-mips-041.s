
#
# Creator (https://creatorsim.github.io/creator/)
#

#	Error de valor invalido

#	En la seccion de data si pones un caracter que no espera para un numero sí que sale el error de valor invalido
#	pero si escribes el mismo numero en la seccion text con la instruccion li muestra el error de que el numero es demasiado
#	grande. ¿No deberia ser mas consistente y mostrar el mismo error en ambos casos?


 .data
 	.align 2
    example:	.word &767

.text
main:
	li $t0 $t0 &34