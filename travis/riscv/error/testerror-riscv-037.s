
#
# Creator (https://creatorsim.github.io/creator/)
#

#	Error de direccion demasiado grande

#	No consigo forzar que salga el error de una direccion muy grande. Al compilar, la direccion se trunca en la octava posicion
#	0xFF3343434FFFFAABB -> 0xFF334343

.data
    a: 	.string "Good string"
	max: 	.word 1

.text
main:
	la x5 0xFF312312367FAAB
