
#
# Creator (https://creatorsim.github.io/creator/)
#

#	Error de reserva de espacio demasiado grande

#	Creo que 50 MiB es excesivo como limite. Al compilar directamente se queda la pagina inutilizable.
#	He ido reduciendo la reserva de espacio a 1MiB y 500 kiB y compilan pero si vas a la seccion de Memory vuelve
#	a quedarse inutilizable la pagina. Puede ser que sea restriccion de mi navegador (Edge)



 .data
 	.align 2
    spa:	.space	512000