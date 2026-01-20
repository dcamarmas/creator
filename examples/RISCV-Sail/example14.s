
#
# Creator (https://creatorsim.github.io/creator/)
#
.section .bss
    .align 8
tohost: .dword 0

.section .text.init
.globl _main

# Entry point of the program
_main:
    li t0, 10
    li t1, 2
    myadd t0, t1

    jr ra
    
