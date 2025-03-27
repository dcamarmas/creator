
.data
    .align 2             # Alinea la siguiente sección de datos a un múltiplo de 4 bytes (2^2)
    msg:    .string "Esperando datos...\n"
    
    .align 2             # Alinea la siguiente sección de datos a un múltiplo de 4 bytes
    sol:    .string "Result: %c\n"
    
    .align 2             # Alinea la siguiente sección de datos a un múltiplo de 4 bytes
    delay:  .word 3000000

.text 
setup:
    li a0,115200 
    addi sp, sp, -4      
    sw ra, 0(sp)     # Guardar el valor de ra (return address)
    jal ra, cr_serial_begin
    lw ra, 0(sp)     # Recupera el valor de ra
    addi sp, sp,4

    la a0, msg
    addi sp, sp, -16       # Reservar espacio en el stack
    sw ra, 12(sp)          # Guardar el registro RA en el stack
    jal ra, cr_serial_printf
    lw ra, 12(sp)          # Restaurar el registro RA desde el stack
    addi sp, sp, 16       # Liberar el espacio del stack
    jr ra

loop:
    addi sp, sp, -16      
    sw ra, 12(sp)     # Guardar el valor de ra (return address)
    jal ra, cr_serial_available
    lw ra, 12(sp)     # Recupera el valor de ra
    addi sp, sp,16 
    mv t2,a0
    bgez t2, loop_2
    jr ra
loop_2:
    addi sp, sp, -16      
    sw ra, 12(sp)     # Guardar el valor de ra (return address)
    jal ra, cr_serial_read
    lw ra, 12(sp)     # Recupera el valor de ra
    addi sp, sp,16 

    mv a1,a0
    la a0, sol
    addi sp, sp, -16       # Reservar espacio en el stack
    sw ra, 12(sp)
    li a7, 1 
    jal ra,cr_serial_printf        
    lw ra, 12(sp)          # Restaurar el registro RA desde el stack
    addi sp, sp, 16       # Liberar el espacio del stack

    la a0, delay
    lw a0, 0(a0)
    addi sp, sp, -16      
    sw ra, 12(sp)
    jal ra, cr_delayMicroseconds
    lw ra, 12(sp)          
    addi sp, sp, 16


    bgez t2, loop
    jr ra

main:
    #Inicializar Arduino y configurar pines
    addi sp, sp, -16       # Reservar espacio en el stack
    sw ra, 12(sp)          # Guardar el registro RA en el stack
    jal ra,  cr_initArduino    
    jal ra, setup
    lw ra, 12(sp)          # Restaurar el registro RA desde el stack
    addi sp, sp, 16       # Liberar el espacio del stack     
    li  t0, 0
    beqz t0, loop
    jr ra 

