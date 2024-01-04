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
text1:
   .string "Write a number: "
text2:
   .string "Write another number: "
text3:
   .string "Calculating the hard and consuming operation of "
text4:
   .string " + "
text5:
   .string "\nResult = "
time:
   .word 1500000     # 1.5s

.text
put:
   li a7, 4
   ecall
   jr ra

put_int:
   li a7, 1
   ecall
   jr ra

get_int:
   li a7, 5
   ecall
   jr ra

main:
   addi sp, sp, -16
   sw ra, 0(sp)
   sw s1, 4(sp)
   sw s2, 8(sp)
   sw s3, 12(sp)

   la a0, text1
   jal ra, put       # Put (Text1);
   jal ra, get_int
   mv s2, a0         # s2 := Get_Int;

   la a0, text2
   jal ra, put       # Put (Text2);
   jal ra, get_int
   mv s3, a0         # s3 := Get_Int;

   la a0, text3
   jal ra, put
   mv a0, s2
   jal ra, put_int
   la a0, text4
   jal ra, put
   mv a0, s3
   jal ra, put_int   # Put (Text3, s2, Text4, s3);

   li s1, 3
   for_3:            # 3 times:
      addi s1, s1, -1
      li a0, '.'
      li a7, 11
      ecall                   # Put ('.');
      la a0, time
      lw a0, 0(a0)
      jal ra, creator_udelay  # delay 1.5;
      bgt s1, zero, for_3

   la a0, text5
   jal ra, put          # Put (Text5);
   add a0, s2, s3
   jal ra, put_int      # Put (s2 + s3);
   li a0, '\n'
   li a7, 11
   ecall                # New_Line;

   lw ra, 0(sp)
   lw s1, 4(sp)
   lw s2, 8(sp)
   lw s3, 12(sp)
   addi sp, sp, 16
   jr ra
