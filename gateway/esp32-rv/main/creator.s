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

# Creator Module
# ==============
#
# AUTHOR: José Antonio Verde Jiménez

.section .text

    .type  creator_udelay, @function
    .globl creator_udelay
creator_udelay:         # void (uint32_t)
    addi sp, sp, -4
    sw ra, 0(sp)

    jal ra, usleep

    lw ra, 0(sp)
    addi sp, sp, 4

    jr ra

    .type  creator_random, @function
    .globl creator_random
creator_random:         # int ()
    addi sp, sp, -4
    sw ra, 0(sp)

    jal ra, _creator_random

    lw ra, 0(sp)
    addi sp, sp, 4

    jr ra

    .type  creator_random_array, @function
    .globl creator_random_array
creator_random_array:   # void (void * ptr, size_t length)
    addi sp, sp, -4
    sw ra, 0(sp)

    jal ra, _creator_random_array

    lw ra, 0(sp)
    addi sp, sp, 4

    jr ra

# TODO:
#    * Pin (R/W)
#    * LED Colour and Blitting
#    * Current Time
#    * Attach Interrupts
