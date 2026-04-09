#
# Creator (https://creatorsim.github.io/creator/)
# Example: Use %hi and %lo modifiers to load 32 bit constants without
# pseudoinstructions
#
.data
a: .zero 1
b: .zero 63
c: .zero 4096

.text
   main:
      lui t0, %hi(0x01020304)
      addi t0, t0, %lo(0x01020304)

      lui t1, %hi(0xABCDEF01)
      addi t1, t1, %lo(0xABCDEF01)

      lui t2, %hi(a)
      addi t2, t2, %lo(a)

      lui t3, %hi(b)
      addi t3, t3, %lo(b)

      lui t4, %hi(c)
      addi t4, t4, %lo(c)

      lui t5, %hi(1)
      addi t5, t5, %lo(1)

      lui t6, %hi(-1)
      addi t6, t6, %lo(-1)

      lui s0, %hi(0xFFFFFFFF)
      addi s0, s0, %lo(0xFFFFFFFF)

      lui s1, %hi(0xFF00FFFF)
      addi s1, s1, %lo(0xFF00FFFF)

      jr ra
