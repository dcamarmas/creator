
#
# Creator (https://creatorsim.github.io/creator/)
#

.data
   utf8: .asciiz  "String in UTF-8: ∀ ∫ ∇ ∈ 🠬"

.text
main: li $v0, 1
      la $t0, utf8
loop: lb $a0, 0($t0)
      syscall
      addi $t0, $t0, 1
      bne $a0, $zero, loop
