# Creatino example: GPIO Interrupts
.data
	ledPin: .byte 4
    interruptpin: .byte 6
    state: .byte 0 #LOW
    change: .byte 0x04
.text
blink:
    la t1, ledPin
    lb a0, 0(t1)
    li a1, 1
    addi sp, sp, -4
    sw ra,0(sp)
    jal ra, digitalWrite# digitalWrite(ledPin, state)
    lw ra,0(sp)
    addi sp, sp, 4
    jr ra

    
loop:
    la t1, ledPin
    lb a0, 0(t1)
    li a1,0
    addi sp, sp, -4
    sw ra,0(sp)
    jal ra, digitalWrite# digitalWrite(ledPin, state)
    lw ra,0(sp)
    addi sp, sp, 4
    
    li a0, 100
    addi sp, sp, -4
    sw ra,0(sp)
    jal ra, delay # delay(1000)
    lw ra,0(sp)
    addi sp, sp, 4
    j loop

setup:
	#Start pins
	la t1, ledPin
    lb a0, 0(t1) 
    li a1, 0x03 #OUTPUT
    addi sp, sp, -4
    sw ra,0(sp)
    jal ra, pinMode #pinMode(ledPin, OUTPUT);
    lw ra,0(sp)
    addi sp, sp, 4
    la t1, interruptpin
    lb a0, 0(t1) 
    li a1, 0x05  #INPUT_PULLUP
    addi sp, sp, -4
    sw ra,0(sp)
    jal ra, pinMode# pinMode(ledPin, INPUT_PULLUP);
    lw ra,0(sp)
    addi sp, sp, 4
    
    la t1, interruptpin
    lb a0, 0(t1) 
    addi sp, sp, -4
    sw ra,0(sp)
    jal ra, digitalPinToInterrupt #digitalPinToInterrupt(interruptpin);
    lw ra,0(sp)
    addi sp, sp, 4
    
    la a1, blink

    la t1, change
    lb a2, 0(t1)
    
    addi sp, sp, -4
    sw ra,0(sp)
    jal ra, attachInterrupt #attachInterrupt(digitalPinToInterrupt(interruptPin), blink, CHANGE);
    lw ra,0(sp)
    addi sp, sp, 4
    jr ra
    
main:
    # Llamar a cr_initArduino()
    addi sp, sp, -4
    sw   ra, 0(sp)
    jal  ra, initArduino
    lw   ra, 0(sp)
    addi sp, sp, 4

    # Llamar a setup()
    addi sp, sp, -4
    sw   ra, 0(sp)
    jal  ra, setup
    lw   ra, 0(sp)
    addi sp, sp, 4

    # Bucle infinito
    j loop


	