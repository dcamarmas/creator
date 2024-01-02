#
#  Copyright 2018-2024 Felix Garcia Carballeira, Alejandro Calderon Mateos, Diego Camarmas Alonso, José Antonio Verde Jiménez
#
#  This file is part of CREATOR.
#
#  CREATOR is free software: you can redistribute it and/or modify
#  it under the terms of the GNU Lesser General Public License as published by
#  the Free Software Foundation, either version 3 of the License, or
#  (at your option) any later version.
#
#  CREATOR is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU Lesser General Public License for more details.
#
#  You should have received a copy of the GNU Lesser General Public License
#  along with CREATOR.  If not, see <http://www.gnu.org/licenses/>.
#
# AUTHOR: José Antonio Verde Jiménez

.data
   .align 4
first:
   .word 0
last:
   .word 10
length:
   .word 16
array:
   .zero 64
   .align 4
comma:
   .string ", "
end_of_array:
   .string "]\n"

.text
put:
   li a7, 4
   ecall
   jr ra

put_int:
   li a7, 1
   ecall
   jr ra

put_char:
   li a7, 11
   ecall
   jr ra

abs:
   bge a0, zero, end_abs
   sub a0, zero, a0
   end_abs:
      jr ra

main:
   addi sp, sp, -24
   sw ra, 0(sp)
   sw s1, 4(sp)      # s1 : Index;
   sw s2, 8(sp)      # s2 : Address;
   sw s3, 12(sp)     # s3 : Length;
   sw s4, 16(sp)     # s4 : First;
   sw s5, 20(sp)     # s5 : Last;

   mv s1, x0         # Index := 0;
   la s2, array      # Address := Array;
   la s3, length
   lw s3, 0(s3)      # Length := Array'Length
   la s4, first
   lw s4, 0(s4)      # First
   la s5, last
   lw s5, 0(s5)      # Last

   mv a0, s2
   slli a1, s3, 2
   jal ra, creator_random_array  # (Array, Length*4);

   li a0, '['
   jal ra, put_char  # Put ('[']);
   addi s3, s3, -1   # Length--;
   loop:
      lw a0, 0(s2)
      sub a0, a0, s4
      sub t0, a5, s4
      rem a0, a0, t0
      jal ra, abs
      add a0, a0, s4
      jal ra, put_int         # Put ((*Array - First) mod (Last - First) + First);
      addi s1, s1, 1          # Index++;
      addi s2, s2, 4          # Array++;
      beq s1, s3, end_loop    # exit when Index = Length - 1
      la a0, comma
      jal ra, put             # Put (", ");
      j loop
   end_loop:
   la a0, end_of_array
   jal ra, put

   lw s5, 20(sp)
   lw s4, 16(sp)
   lw s3, 12(sp)
   lw s2, 8(sp)
   lw s1, 4(sp)
   lw ra, 0(sp)
   addi sp, sp, 24
   jr ra
