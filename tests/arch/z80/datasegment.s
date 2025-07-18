; Simple Z80 assembly test with a data segment

        ; Code segment
        ORG 0x0000         ; Start code at address 0x0000

start:
        LD B, 11    ; Load 11 into B
        ADD A, B     ; Add B to A (A = 16)
        JP test      ; Jump to the 'test' label
        nop
        nop
        nop

        ORG 0x4000         ; Start data at address 0x4000
        
test:
        ADD A, 42    ; Add 42 to the accumulator
        LD BC, (0x4000) ; Load the contents of memory address 0x4000 into BC

mydata:
        DW 0xBEEF          ; Example word (2 bytes)