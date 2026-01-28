#Template for Arduino proyects
.data
	# GPIO
	buzzerPin: .word 5
    button_C4: .word 7
    button_D4: .word 10
    button_E4: .word 3
    button_G4: .word 4
    
    # Notes
    note_C4: .word 262
    note_D4: .word 294
    note_E4: .word 330
    note_G4: .word 392
    #aux
    button_count: .word 4
    time_delay: .word 10
    anyPressed: .word -1 
    .align 4
    button_handlers:
      .word handleButton0
      .word handleButton1
      .word handleButton2
      .word handleButton3
.text
#ISR
handleButton0:
	la t0, anyPressed
    lw t1, 0(t0)
    li t2, 0 # Assign 0
    sw t2, 0(t0)
    jr ra
handleButton1:
	la t0, anyPressed
    lw t1, 0(t0)
    li t2, 1 # Assign 0
    sw t2, 0(t0)
    jr ra
handleButton2:
	la t0, anyPressed
    lw t1, 0(t0)
    li t2, 2 # Assign 0
    sw t2, 0(t0)
    jr ra
handleButton3:
	la t0, anyPressed
    lw t1, 0(t0)
    li t2, 3 # Assign 0
    sw t2, 0(t0)
    jr ra     
#SetUp
setup:
#buzzer
    la a0, buzzerPin   
    lw a0, 0(a0)       
    li a1,  0x03
    addi sp, sp, -4      
    sw ra, 0(sp)   
    jal ra, pinMode
    lw ra, 0(sp)          
    addi sp, sp, 4
#buttons
    la   s0, button_C4 #Button list
    li   s1, 0 # Position in the list
    la   t3, button_count
    lw   s2, 0(t3) #List length
loop_buttons:
    bge  s1, s2, end_loop_buttons      # loop until all the buttons are positioned
    
    # Take position of the button
    slli s3, s1, 2                     
    add  t1, s0, s3 #shitf                                   
    lw   s4, 0(t1) #Button value
    mv a0,s4
    
    li a1,  0x05 #INPUT_PULLUP
    addi sp, sp, -4      
    sw ra, 0(sp)   
    jal ra, pinMode
    lw ra, 0(sp)          
    addi sp, sp, 4
    #----Attach Interrupts
    #Transform digitalPin into interrupt
    mv a0, s4
    addi sp, sp, -4
    sw ra,0(sp)
    jal ra, digitalPinToInterrupt #digitalPinToInterrupt(interruptpin);
    lw ra,0(sp)
    addi sp, sp, 4
    # Search the correct pointer
    la t0, button_handlers
    add t1, t0, s3
    lw a1, 0(t1)
    # Let the interrupt jump when button is pressed (on_low)
    li a2, 0x03 
    addi sp, sp, -4
    sw ra,0(sp)
    jal ra, attachInterrupt #attachInterrupt(digitalPinToInterrupt(buttonPin[i]), handler[i], ON_LOW);
    lw ra,0(sp)
    addi sp, sp, 4 
    addi s1, s1, 1                     # next button
    j    loop_buttons

end_loop_buttons:
    ret 
#  LOOP 
startTune:
	# Clean value
    la t0,anyPressed
    
    sw t1, 0(t0) #-1
    #Search value
    la t0, note_C4
    slli s1, s0, 2 
    add t1,s1,t0                 
    lw   s2, 0(t1) #Note value
    #Play Tone
    la t0, buzzerPin
    lw a0, 0(t0)
    mv a1,s2
    li a2, 200
    addi sp, sp, -4
    sw ra,0(sp)
    jal ra, tone #tone(buzzerPin, notes[i], duration);
    lw ra,0(sp)
    addi sp, sp, 4
    j loop  
loop:
	la t0, anyPressed         
    lw s0,0(t0)
    li t1, -1 
    bne s0, t1, startTune
    la t0, time_delay
    lw a0, 0(t0)
    addi sp, sp, -4
    sw ra,0(sp)
    jal ra, delay #delay(200); 
    lw ra,0(sp)
    addi sp, sp, 4
    j loop

main:
    addi sp, sp, -4       
    sw ra, 0(sp)          
    jal ra, initArduino    
    jal ra, setup
    lw ra, 0(sp)          
    addi sp, sp, 4              
    j loop