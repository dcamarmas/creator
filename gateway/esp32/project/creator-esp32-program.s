.text
.type main, @function
.globl main

#
# Creator (https://creatorsim.github.io/creator/)
#

.data
.align 2
  w3: .word 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
  s: .string "hola"


.text
main:

  addi sp, sp, -8
  sw ra, 0(sp)

  li  t3,  1
  li  t4,  4
  la  t5,  w3
  li  s7,  0

  # loop initialization
  li  t1,  0
  li  t2,  10

  # loop header
loop1: beq t1, t2, end1     # if(t1 == t2) --> jump to fin1

  # loop body
  mul t6, t1, t4             # t1 * t4 -> t6
  lw  t6, 0(t5)            # Memory[t5] -> t6
  add s7, s7, t6             # t6 + s7 -> s7

  # loop next...
  add  t1, t1, t3            # t1 + t3 -> t1
  addi t5, t5, 4
  beq x0, x0, loop1

  # loop end
end1: 

  mv a1, s7
  li a7, 1
  #### 
 addi sp, sp, -8 
 sw ra, 0(sp) 
 jal _myecall 
 lw ra, 0(sp) 
 addi sp, sp, 8 
 ####

  li a7, 4
  la a0, s
  #### 
 addi sp, sp, -8 
 sw ra, 0(sp) 
 jal _myecall 
 lw ra, 0(sp) 
 addi sp, sp, 8 
 ####

  li a7, 11
  la a0, 'X'
  #### 
 addi sp, sp, -8 
 sw ra, 0(sp) 
 jal _myecall 
 lw ra, 0(sp) 
 addi sp, sp, 8 
 ####

  # read a integer and print
  li a7, 5
  #### 
 addi sp, sp, -8 
 sw ra, 0(sp) 
 jal _myecall 
 lw ra, 0(sp) 
 addi sp, sp, 8 
 ####
  li a7, 1
  #### 
 addi sp, sp, -8 
 sw ra, 0(sp) 
 jal _myecall 
 lw ra, 0(sp) 
 addi sp, sp, 8 
 #### 

  # read a integer and print
  li a7, 5
  #### 
 addi sp, sp, -8 
 sw ra, 0(sp) 
 jal _myecall 
 lw ra, 0(sp) 
 addi sp, sp, 8 
 ####
  li a7, 1
  #### 
 addi sp, sp, -8 
 sw ra, 0(sp) 
 jal _myecall 
 lw ra, 0(sp) 
 addi sp, sp, 8 
 #### 

  # read a char and print
  li a7, 12
  #### 
 addi sp, sp, -8 
 sw ra, 0(sp) 
 jal _myecall 
 lw ra, 0(sp) 
 addi sp, sp, 8 
 ####
  li a7, 11
  #### 
 addi sp, sp, -8 
 sw ra, 0(sp) 
 jal _myecall 
 lw ra, 0(sp) 
 addi sp, sp, 8 
 #### 


  ### end   retutn
  lw ra, 0(sp)
  addi sp, sp, 8
  jr ra
