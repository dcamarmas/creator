
#
# Creator (https://creatorsim.github.io/creator/)
#

.data
   utf8: .string  "String in UTF-8: ∀ ∫ ∇ ∈ 🠬"

.text
main: li a7, 1
      la t0, utf8
loop: lbu a0, 0(t0)
      ecall
      addi t0, t0, 1
      bne a0, zero, loop
      jr ra
