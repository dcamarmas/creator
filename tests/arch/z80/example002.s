; Define constants for port numbers to make the code clearer.
KEYBOARD_PORT EQU 0x01
ECHO_PORT     EQU 0x02

; The program will be loaded at memory address 0x0000.
ORG 0x0000

main_loop:
    ; --- Part 1: Poll the keyboard until a key is pressed ---

    IN A, (KEYBOARD_PORT)

    OR A                  ; Perform a logical OR operation with A.
                          ; This sets the Zero flag if A is 0 (meaning no key was pressed).
                          ; If a key was pressed, A will contain the character code.

    JR Z, main_loop       ; Jump Relative if Zero. If the Z flag is set (meaning
                          ; A was 0), jump back to the 'main_loop' label and
                          ; try reading the keyboard again. This is the "polling" loop.

    ; --- Part 2: Echo the character ---
    
    ; If we get here, it means the JR Z instruction did NOT jump,
    ; so A must contain a non-zero character code.
    
    OUT (ECHO_PORT), A    ; Write the byte currently in the Accumulator (A)
                          ; to our defined echo port (0x02).

    ; --- Part 3: Repeat ---
    
    JP main_loop          