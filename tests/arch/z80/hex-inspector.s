; ======================================================================
; Simple Hex Inspector
; Reads two hex characters, treats them as a memory address (0x00XX),
; and prints the value at that address in hex.
; ======================================================================

KEYBOARD_PORT EQU 0x01
SCREEN_PORT   EQU 0x02

ORG 0x0000
start:
    ; --- Part 1: Read the first hex character (high nibble) ---
    call read_char_and_echo
    call parse_hex_nibble       ; Convert ASCII hex char in A to a value (0-15)
    
    ; Shift it left by 4 bits to make it the high nibble.
    ; Since RLA/RLCA are not implemented, we do it with ADDs.
    add a, a
    add a, a
    add a, a
    add a, a
    ld b, a                     ; Store the high nibble (e.g., 0x40) in B

    ; --- Part 2: Read the second hex character (low nibble) ---
    call read_char_and_echo
    call parse_hex_nibble       ; Convert ASCII hex char in A to a value (0-15)
    
    ; --- Part 3: Combine nibbles and inspect memory ---
    add a, b                    ; Combine high and low nibbles (e.g., A = 0x01 + 0x40)
    ld l, a                     ; L now holds the address to inspect (e.g., 0x41)
    ld h, 0                     ; Set H to 0, so HL points to 0x00XX
    
    ld a, (hl)                  ; Read the value from the memory address in HL!

    ; --- Part 4: Print the result in hex ---
    call print_hex_byte         ; Print the value we just read
    
    ; --- Part 5: Print a newline and repeat ---
    call print_crlf
    jp start                    ; Go back to the beginning for the next inspection

; ======================================================================
; Subroutines
; ======================================================================

read_char_and_echo:
    call read_char
    out (SCREEN_PORT), a
    ret

read_char:
    in a, (KEYBOARD_PORT)
    or a
    jp z, read_char
    ret

; Converts a single ASCII hex character in A to its 4-bit numeric value.
parse_hex_nibble:
    cp 'A'
    jp c, parse_digit
    sub 'A' - 10
    ret
parse_digit:
    sub '0'
    ret

; Prints the byte in A as two hexadecimal characters.
print_hex_byte:
    push af
    ; Extract and print the high nibble
    ld c, a             ; Use C as a temporary holder for the full byte
    ld b, 0             ; B will count how many times 16 goes into the byte
hex_loop:
    cp 16
    jp c, hex_done      ; If A < 16, the remainder is the low nibble
    sub 16
    inc b
    jp hex_loop
hex_done:
    push af             ; Save the low nibble (now in A) on the stack
    ld a, b             ; Move the high nibble (from B) into A
    call print_hex_digit
    pop af              ; Restore the low nibble
    call print_hex_digit
    pop af
    ret

; Prints a 4-bit value in A as a single ASCII hex character.
print_hex_digit:
    cp 10
    jp c, print_is_digit
    add a, 'A' - 10
    out (SCREEN_PORT), a
    ret
print_is_digit:
    add a, '0'
    out (SCREEN_PORT), a
    ret

print_crlf:
    ld a, 0x0D
    out (SCREEN_PORT), a
    ld a, 0x0A
    out (SCREEN_PORT), a
    ret