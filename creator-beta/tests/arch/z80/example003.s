; Z80 Factorial Example
; Computes the factorial of 5 using a loop
; Outputs the result (120 = 0x0078) to the echo port

; Define constants for port numbers
ECHO_PORT EQU 0x02

; The program will be loaded at memory address 0x0000.
ORG 0x0000

; Compute 5!
LD A, 5          ; n = 5
LD HL, 1         ; result = 1
LD C, 2          ; multiplier starts at 2

factorial_loop:
    CP C          ; compare A (n) with C (current multiplier)
    JR C, done    ; if n < multiplier, we're done

    ; Multiply HL by C
    PUSH AF       ; save A
    LD A, C       ; A = multiplier
    CALL multiply ; HL = HL * A
    POP AF        ; restore A

    INC C         ; next multiplier
    JR factorial_loop

done:
    ; HL now contains 5! = 120 (0x0078)
    ; Output high byte
    LD A, H
    OUT (ECHO_PORT), A

    ; Output low byte
    LD A, L
    OUT (ECHO_PORT), A

    LD A, 10
    OUT (0x17), A  ; Signal end of execution

; Multiply subroutine: HL = HL * A
; Uses repeated addition
multiply:
    PUSH BC       ; save BC
    PUSH DE       ; save DE

    LD B, A       ; B = multiplier
    LD DE, HL     ; DE = original HL
    LD HL, 0      ; HL = 0 (result)

multiply_loop:
    ADD HL, DE    ; HL += DE
    DJNZ multiply_loop ; repeat B times

    POP DE        ; restore DE
    POP BC        ; restore BC
    RET           ; return