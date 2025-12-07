# This example demonstrates a classic buffer overflow attack in RISC-V assembly.
# In real-world software, buffer overflows can occur when copying data without
# proper bounds checking, allowing attackers to overwrite critical data like
# return addresses and hijack program execution.
# To visualize the exploit, go to the Memory tab in the simulator, click on
# the Stack segment, and observe how the stack changes during execution.

.data
.align 4
# Simulated attacker-controlled input: This represents data that an attacker
# might provide, such as overly long user input or malicious network data.
# The payload is crafted to overflow the buffer and overwrite the saved return
# address with the address of malicious code.
attacker_payload:
    .word 0xCAFECAFE    # filler data (padding to reach return address)
    .word 0xCAFECAFE
    .word 0xCAFECAFE
    .word 0xCAFECAFE
    .word 0xCAFECAFE
    .word 0xCAFECAFE
    .word 0xCAFECAFE    # 7 words * 4 bytes = 28 bytes to reach saved ra
    .word malicious     # overwrites saved return address with malicious addr

.text
main:
    # Simulate calling a function with attacker-controlled data
    la      a0, attacker_payload   # load address of attacker payload
    jal     ra, process_user_input # call vulnerable function

    # Normal exit (we won't reach here due to overflow)
    li      a7, 10
    ecall

#
# process_user_input(char *input):
#   Simulates a vulnerable function that processes user input without bounds checking.
#   In real code, this might be a function that reads network data, parses files,
#   or handles user input - all common sources of buffer overflow vulnerabilities.
#
# Stack layout (32-byte frame):
#   sp+0  to sp+15: buffer (16 bytes, 4 words) - local storage
#   sp+16 to sp+27: unused space
#   sp+28 to sp+31: saved return address (ra)
#
process_user_input:
    addi    sp, sp, -32        # allocate stack frame
    sw      ra, 28(sp)         # save return address

    # Setup for copying input data to local buffer
    mv      t0, sp             # destination: start of local buffer
    mv      t1, a0             # source: attacker-controlled input
    li      t2, 8              # copy 8 words (32 bytes) - exceeds buffer size!

copy_loop:
    beqz    t2, copy_done      # loop until all words copied
    lw      t3, 0(t1)          # load word from input
    sw      t3, 0(t0)          # store to buffer (NO BOUNDS CHECK!)
    addi    t1, t1, 4          # advance source pointer
    addi    t0, t0, 4          # advance destination pointer
    addi    t2, t2, -1         # decrement counter
    j       copy_loop

copy_done:
    # Attempt to return - but return address may be corrupted
    lw      ra, 28(sp)         # load (possibly overwritten) return address
    addi    sp, sp, 32         # deallocate frame
    jr      ra                 # return - may jump to malicious code!

#
# malicious: Attacker's payload code
# In a real attack, this could:
# - Execute shell commands
# - Steal sensitive data
# - Install malware/backdoors
# - Escalate privileges
#
# Here we just demonstrate control hijacking by setting a "flag" register.
#
malicious:
    # Simulate malicious activity (e.g., accessing restricted data)
    li      t5, 0xC0FFEE01     # set "compromised" flag
    # In real code, this might be: system("/bin/sh") or data theft

    # Exit (simulator will detect the magic value in t5)
    li      a7, 10
    ecall