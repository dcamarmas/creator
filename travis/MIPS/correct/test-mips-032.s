
#
# Creator (https://creatorsim.github.io/creator/)
#
# Caso de prueba para leer y escribir caracteres

# No imprime ningun valor y tampoco se para la ejecucion cuando le indico que voy a escribir un caracter

.data

.align 2

  byte:			.byte 'a','b'

.text   
    main:
        li $v0, 11
        lw $a0, byte
        syscall
        li $t0, 5
        
        li $a0, 'c'
        syscall
        li $t0, 7
        
        li $v0, 12
        syscall
        move $t1, $v0
