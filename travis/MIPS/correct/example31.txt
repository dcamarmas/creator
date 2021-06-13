
#
# Creator (https://creatorsim.github.io/creator/)
#
# Caso de prueba de exit

# Simplemente poniendo el valor 10, syscall y después cualquier instruccion, se puede ver que termina en el syscall

.text   
    main:
        li $v0, 10
        syscall            
        li $t0, 453
