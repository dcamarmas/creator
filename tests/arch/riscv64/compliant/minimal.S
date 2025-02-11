# to communicate with the host
# check riscv-software-src/riscv-tests
.section .tohost, "aw", @progbits

.align 6
.globl tohost
tohost: .dword 0

.align 6
.globl fromhost
fromhost: .dword 0

.section .text

.globl _start

_start:

        addi x1, x0, 1
        beq x0, x0, target    # Branch if equal using local label
        addi x6, x0, 0x123     # test value
        addi x0, x0, 0        # NOP
        addi x0, x0, 0        # NOP
        addi x0, x0, 0        # NOP
        slli x7, x7, 0       # Increment x7
target:
        addi x5, x5, 0x321        # Increment x5
        # Exit with status code 0
        li a0, 0
        j tohost_exit

# a0 exit code
tohost_exit:
        slli a0, a0, 1
        ori a0, a0, 1

        la t0, tohost
        sw a0, 0(t0)

        1: j 1b # wait for termination
