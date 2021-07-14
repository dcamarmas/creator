
#
# Creator (https://creatorsim.github.io/creator/)
#

#	Error de direccion incorrecta

#	IMPORTANTE: No sale ningun error intentando forzar una direccion errónea PERO si escribes un menos despues de 0x seguido de un valor, 
#	se queda en bucle infinito y crashea
#	Algo me dice que escribe tantas instrucciones como valor pongas despues del 0x-



 .data
 	.align 2
    a1:	.half 123
    
.text
main:
	la $t0 0x-5555
    lw $t1 0($t0)