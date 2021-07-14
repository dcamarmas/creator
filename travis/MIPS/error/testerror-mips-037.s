
#
# Creator (https://creatorsim.github.io/creator/)
#

#	Error de direccion demasiado grande

#	No consigo forzar que salga el error de una direccion muy grande. Al compilar, la direccion se trunca en la octava posicion
#	0xFF3343434FFFFAABB -> 0xFF334343

 .data
 	.align 2
    a1:	.half 123
    
.text
main:
	la $t0 0xFF3343434FFFFAABB
    lw $t1 0($t0)