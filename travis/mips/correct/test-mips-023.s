#
# Creator (https://creatorsim.github.io/creator/)
#

# Caso de prueba donde el programa solamente escribe ints

.data

.align 2

  byte:			.byte 120,257
  half:			.half 34
  word:			.word -5678
  string:  		.ascii "This is another string"

.text
main:
	# Imprime un entero
	li $v0 1
	li $a0 6673
	syscall

	# Imprime un byte
    lb $a0 byte
    syscall
    
    # Imprime un byte fuera de rango
    li $t0 4
    la $t1 byte
    lb $a0 4($t1)
    syscall
    
    # Imprime un half
    lh $a0 half
    syscall
    
    # Imprime un valor negativo
    lw $a0 word
    syscall
    
    # Imprime un float (Se trunca al imprimir)
    li $a0 1.1
    syscall
    
    # Imprime un string (Ha cogido la primera palabra del string -> s i h T)
    lw $a0 string
    syscall