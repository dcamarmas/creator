
#
# Creator (https://creatorsim.github.io/creator/)
#

#	Error de numero inmediato muy grande

#	No muestra ningun error. Ademas, a la hora de ejecutar el codigo esta sumando solamente 0s.
#	El limite positivo se encuentra en 4294967295. A partir de este valor solo pone 0s (4294967296)
#	Para los numeros negativos no ocurre. A partir de -2147483648 sigue funcionando

 .data
 	A:		.word -1
    a:		.byte -1
    
.text
main:
	li $t0 4294967295
    li $t1 4294967296
    li $t2 -2147483648
    li $t3 -2147483649