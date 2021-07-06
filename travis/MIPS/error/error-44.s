
#
# Creator (https://creatorsim.github.io/creator/)
#

#	Error referente a introducir un numero grande

#	De la misma forma que con los errores de immediate number X is too big, no he visto forma de forzar el error
#	salvo que dejes una instruccion li con el valor a guardar vacio


 .data
 	.align 2
    example:	.half 53453453464535343456
    
.text
main:
	li $t0 53453453464535343456
    li $t1 

