KEYBOARD_PORT EQU 0x01
SCREEN_PORT   EQU 0x02
INPUT_BUFFER  EQU 0x8000
BUFFER_SIZE   EQU 32
CR            EQU 0x0D
LF            EQU 0x0A
BS            EQU 0x08
SPACE         EQU 0x20

ORG 0x0000
start:
    ld sp, 0xFFFF
    
main_loop:
    call print_crlf
    ld hl, prompt_msg
    call print_string
    call read_line
    call print_crlf
    
parse_command:
    ld hl, INPUT_BUFFER
    ld a, (hl)
    cp 'a'
    jp c, not_lowercase
    cp 'z' + 1
    jp nc, not_lowercase
    sub 0x20
not_lowercase:
    cp 'R'
    jp z, cmd_read
    cp 'W'
    jp z, cmd_write
    cp 'G'
    jp z, cmd_go
    cp '?'
    jp z, cmd_help
    ld hl, unknown_cmd_msg
    call print_string
    jp main_loop

print_string:
    ld a, (hl)
    inc hl
    or a
    ret z
    out (SCREEN_PORT), a
    jp print_string

read_line:
    ld hl, INPUT_BUFFER
    ld b, BUFFER_SIZE
read_line_loop:
    call read_char
    cp CR
    jp z, read_line_end
    cp BS
    jp z, handle_backspace
    ld (hl), a
    inc hl
    out (SCREEN_PORT), a
    djnz read_line_loop
read_line_end:
    ld a, 0
    ld (hl), a
    ret

handle_backspace:
    push af
    push bc
    ld a, BUFFER_SIZE
    cp b
    jr z, backspace_done
    inc b
    dec hl
    ld a, BS
    out (SCREEN_PORT), a
    ld a, SPACE
    out (SCREEN_PORT), a
    ld a, BS
    out (SCREEN_PORT), a
backspace_done:
    pop bc
    pop af
    jp read_line_loop

read_char:
    in a, (KEYBOARD_PORT)
    or a
    jr z, read_char
    ret

cmd_read:
    ld hl, INPUT_BUFFER + 2
    call parse_hex_word
    ld a, (de)
    call print_hex_byte
    jp main_loop

cmd_write:
    ld hl, INPUT_BUFFER + 2
    call parse_hex_word
    ld hl, INPUT_BUFFER + 7
    call parse_hex_byte
    ld (de), a
    ld hl, ok_msg
    call print_string
    jp main_loop

cmd_go:
    ld hl, INPUT_BUFFER + 2
    call parse_hex_word
    ld hl, de
    jp (hl)

cmd_help:
    ld hl, help_msg
    call print_string
    jp main_loop

print_crlf:
    ld a, CR
    out (SCREEN_PORT), a
    ld a, LF
    out (SCREEN_PORT), a
    ret

parse_hex_word:
    call parse_hex_byte         ; Parses first two hex chars (e.g., "00") into A
    ld d, a                     ; D = high byte of address
    ; HL is now pointing at the next character to parse
    call parse_hex_byte         ; Parses next two hex chars (e.g., "00") into A
    ld e, a                     ; E = low byte of address
    ret

parse_hex_byte:
    call parse_hex_nibble_from_mem ; Parse first nibble from (HL)
    ; Shift left by 4
    add a, a
    add a, a
    add a, a
    add a, a
    ld b, a                      ; Store high nibble in B
    
    inc hl                       ; Advance pointer to second nibble
    
    call parse_hex_nibble_from_mem ; Parse second nibble from (HL)
    
    inc hl                       ; Now HL points to the char AFTER the byte.
    
    add a, b                     ; Combine high and low nibbles
    ret

parse_hex_nibble_from_mem:
    ld a, (hl)
    cp 'a'
    jr c, is_not_lc_p
    cp 'z' + 1
    jr nc, is_not_lc_p
    sub 0x20
is_not_lc_p:
    sub '0'
    cp 10
    ret c
    sub 'A' - '0' - 10
    ret

print_hex_byte:
    ld b, a               ; Save a copy of the original byte in B
    
    ; --- Print the HIGH nibble ---
    ; Rotate A right 4 times to move the high nibble into the low position
    rrca
    rrca
    rrca
    rrca
    call print_hex_nibble ; This will now print the original high nibble
    
    ; --- Print the LOW nibble ---
    ld a, b               ; Restore the original byte from B
    call print_hex_nibble ; This will now print the original low nibble
    
    ret
swap_loop:
    rrca                  ; Rotate right 4 times to swap nibbles
    dec c
    jr nz, swap_loop
    
    call print_hex_nibble
rra_loop:
    add a, a              ; Effectively RLA. A becomes 0x60, 0xC0, 0x80, 0x00 (with carry)
    dec c
    jr nz, rra_loop
    adc a, 0              ; Rotate carry back into bit 0. A is now 0x03.
    
    call print_hex_nibble ; Print the high nibble ('3')
    
    pop af                ; Restore original byte (A = 0x31)
    call print_hex_nibble ; Print the low nibble ('1')
    ret

; print_hex_nibble: Prints the low 4 bits of A as a hex char.
print_hex_nibble:
    and 0x0F              ; Isolate low nibble (A becomes 0x01)
    cp 10
    jr c, phn_is_digit
    add a, 'A' - 10
    out (SCREEN_PORT), a
    ret
phn_is_digit:
    add a, '0'
    out (SCREEN_PORT), a
    ret

; ======================================================================
; Data Section
; ======================================================================
prompt_msg:       db '> ', 0
help_msg:         db 'R aaaa      - Read byte', CR, LF
                  db 'W aaaa vv   - Write byte', CR, LF
                  db 'G aaaa      - Go to address', CR, LF
                  db '? - Help', 0
unknown_cmd_msg:  db 'Unknown command.', 0
ok_msg:           db 'OK', 0