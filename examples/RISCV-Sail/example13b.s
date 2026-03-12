#
# Creator (https://creatorsim.github.io/creator/)
#

.section .bss
.align 8
tohost:
    .dword 0

.section .text.init
.globl _main

kernel:
    j reset_vector
    
    syscall: 
        li t0, 13
        bgeu a7, t0, fail
        addi t0, t0, -3
        beq t0, a7, exit
    
    csrr t0, mepc
    addi t0, t0, 4
    csrw mepc, t0
    mret

    exit:
        fence
        li gp, 1
        li a0, 0
        li a7, 10
        j exception+4
    
    fail: 
        fence
        beqz gp, fail+0x4
        slli gp, gp, 1
        ori gp, gp, 1
        li a7, 10
        mv a0, gp
        j syscall
    
    trap_vec:
        csrr t5, mcause
        li t6, 8
        beq t5, t6, syscall
        li t6, 9
        beq t5, t6, syscall
        li t6, 11
        beq t5, t6, syscall
        j exception

    exception:
        ori gp, gp, 1337
        la t5, tohost
        sw gp, 0(t5)
        sw zero, 4(t5)

        j exception

    reset_vector:
        li ra, 0
        li sp, 0x3FFFFFFC
        li gp, 0
        li tp, 0
        li t0, 0
        li t1, 0
        li t2, 0
        li fp, 0
        li s1, 0
        li a0, 0
        li a1, 0
        li a2, 0
        li a3, 0
        li a4, 0
        li a5, 0
        li a6, 0
        li a7, 0
        li s2, 0
        li s3, 0
        li s4, 0
        li s5, 0
        li s6, 0
        li s7, 0
        li s8, 0
        li s9, 0
        li s10, 0
        li s11, 0
        li t3, 0
        li t4, 0
        li t5, 0
        li t6, 0
    
    initial: 
        csrr a0, mhartid
        bnez a0, initial
        auipc t0, 0
        addi t0, t0, 16
        csrw mtvec, t0
        csrwi mstatus, 8
        auipc t0, 0
        addi t0, t0, 16
        csrw mtvec, t0
        csrwi satp, 0

        auipc t0, 0
        addi t0, t0, 36
        csrw mtvec, t0
        addi t0, zero, 1
        slli t0, t0, 0x1f
        csrw pmpaddr0, t0
        li t0, 31
        csrwi mie, 0
        auipc t0, 0
        addi t0, t0, 20

        csrwi medeleg, 0
        csrwi mideleg, 0
        la t0, trap_vec
        csrw mtvec, t0
        csrw mepc, t0
        lui t0, 0x2
        addi t0, t0, -2048
        csrrc zero, mstatus, t0

        csrr t0, mstatus
        lui t1, 0xffffe
        addi t1, t1, 2047
        and t0, t0, t1
        li t1, 0
        slli t1, t1, 11
        or t0, t0, t1
        csrw mstatus, t0

        la t0, _main
        csrw mepc, t0
        mret

_main:

    li a7, 10
    ecall
