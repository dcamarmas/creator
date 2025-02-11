/*
 *  Copyright 2018-2025 Felix Garcia Carballeira, Alejandro Calderon Mateos, Diego Camarmas Alonso
 *
 *  This file is part of CREATOR.
 *
 *  CREATOR is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  CREATOR is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with CREATOR.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
'use strict';
import { bi_doubleToBigInt, bi_floatToBigInt } from '../utils/bigint.mjs';
import { architecture } from '../core.mjs';
import { readRegister } from './registerOperations.mjs';
import { bin2hex, float2bin, double2bin, hex2double, hex2float } from '../utils/utils.mjs';

/*Modifies double precision registers according to simple precision registers*/
export function updateDouble(comp, elem) {
  for (let i = 0; i < architecture.components.length; i++) {
    if (architecture.components[i].double_precision === true && architecture.components[i].double_precision_type == "linked") {
      for (let j = 0; j < architecture.components[i].elements.length; j++) {
        if (architecture.components[comp].elements[elem].name.includes(architecture.components[i].elements[j].simple_reg[0]) !== false) {
          const simple = bin2hex(float2bin(readRegister(comp, elem)));
          const double = bin2hex(double2bin(readRegister(i, j))).substr(8, 15);
          const newDouble = simple + double;

          architecture.components[i].elements[j].value = bi_doubleToBigInt(hex2double("0x" + newDouble));
        }
        if (architecture.components[comp].elements[elem].name.includes(architecture.components[i].elements[j].simple_reg[1]) !== false) {
          const simple = bin2hex(float2bin(readRegister(comp, elem)));
          const double = bin2hex(double2bin(readRegister(i, j))).substr(0, 8);
          const newDouble = double + simple;

          architecture.components[i].elements[j].value = bi_doubleToBigInt(hex2double("0x" + newDouble));
        }
      }
    }
  }
}
/*Modifies single precision registers according to double precision registers*/
export function updateSimple(comp, elem) {
  if (architecture.components[comp].double_precision_type == "linked") {
    var part1 = bin2hex(double2bin(readRegister(comp, elem))).substr(0, 8);
    var part2 = bin2hex(double2bin(readRegister(comp, elem))).substr(8, 15);

    for (var i = 0; i < architecture.components.length; i++) {
      for (var j = 0; j < architecture.components[i].elements.length; j++) {
        if (architecture.components[i].elements[j].name.includes(architecture.components[comp].elements[elem].simple_reg[0]) !== false) {
          architecture.components[i].elements[j].value = bi_floatToBigInt(hex2float("0x" + part1));
        }
        if (architecture.components[i].elements[j].name.includes(architecture.components[comp].elements[elem].simple_reg[1]) !== false) {
          architecture.components[i].elements[j].value = bi_floatToBigInt(hex2float("0x" + part2));
        }
      }
    }
  }
}
