.section .data
.align 3
v_1:
    .double 7.7 ,8.8 ,9.9 ,-13.13 
.align 3
v_2:
    .double 62.62 , 54.54, -684.684, 379.379
.align 3
v_mem:
    .space 64

.section .bss
.align 8
tohost: .dword 0

.section .text.init
.globl _main

_main:

    li t0, 4
    vsetvli t1, t0, e64
    la t2, v_1
    la t3, v_2
    vle64.v v1, 0(t2)
    vle64.v v2, 0(t3)
    vfadd.vv v3, v1, v2
    la t1, v_mem
    vse64.v v3, 0(t1)

    li a7, 10
    ecall
    