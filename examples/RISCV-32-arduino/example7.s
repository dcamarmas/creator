.data
true:    .string "%c is a number (0-9)!!"
true2:   .string "\n%c is an alpha!!"
        .align 2
true3:   .string "\n%c is uppercase"
false:   .string "%c is not a number"

.text

# Imprime mensaje con el carácter en a0 (se pasa a a1 para %c)
falseStatement:
    mv a1, a0         # mueve carácter a a1 para %c
    la a0, false
    jal ra, serial_printf
    jr ra

trueStatement:
    mv a1, a0
    la a0, true
    jal ra, serial_printf
    jr ra

trueStatement2:
    mv a1, a0
    la a0, true2
    jal ra, serial_printf
    jr ra

trueStatement3:
    mv a1, a0
    la a0, true3
    jal ra, serial_printf
    jr ra

main:
    jal ra, initArduino
    li a0, 115200
    jal ra, serial_begin

    # Probar carácter '3' (ASCII 51)
    li a0, 65          # carácter a probar
    jal ra, isDigit
    bnez a0, checkAlpha
    # Si es dígito:
    li a0, 51
    jal ra, trueStatement
    j end

checkAlpha:
    li a0, 65          # carácter 'A'
    jal ra, isAlpha
    beqz a0, checkUpperCase
    li a0, 65
    jal ra, trueStatement2
    j end

checkUpperCase:
    li a0, 65
    jal ra, isUpperCase
    beqz a0, falseStatement
    li a0, 65
    jal ra, trueStatement3
    j end

end:
    jr ra
