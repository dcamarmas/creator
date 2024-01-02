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
asterisk:
	.string " * "
    
    .align 4
colon:
	.string " : "
    
	.align 4
message:
	.string "Generating random numbers..."

	.align 4
count:
	.word 10

	.align 4
delay:
	.word 3000000

.text

main:
	addi sp, sp, -12
    sw ra, 0(sp)
    sw s1, 4(sp)
    sw s2, 8(sp)
    
    la s1, count
    lw s1, 0(s1)
    
    la s2, delay
    lw s2, 0(s2)
    
    la a0, message
    li a7, 4
    ecall
    
    li a0, 10
    li a7, 11
    ecall
    loop:
    	la a0, asterisk
    	li a7, 4
        ecall
        
        mv a0, s1
        li a7, 1
        ecall
        
        la a0, colon
        li a7, 4
        ecall
        
        jal ra, creator_random
        li a7, 1
        ecall
        
        li a0, 10
        li a7, 11
        ecall
        
        la a0, delay
        lw a0, 0(a0)
        jal ra, creator_udelay
        
        addi s1, s1, -1
        bne s1, zero, loop
        
    lw ra, 0(sp)
    lw s1, 4(sp)
    lw s2, 8(sp)
    addi sp, sp, 12
    jr ra
