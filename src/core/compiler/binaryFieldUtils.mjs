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
'use strict'
import { console_log } from '../utils/creator_logger.mjs'

/**
 * method in charge of return the length of the value. The most use are whene the field are fragment
 * this funciton is create with the intention of reduce errors on the code in case of add new fragments field
 * @return {int} the size of the field
 */

export function getFieldLength(separated, startbit, stopbit, a) {
    if (startbit == stopbit)
        console_log(
            'Warning: startbit equal to stopBit, please check the achitecture definitions'
        )
    let fieldsLength
    if (!separated || !separated[a]) fieldsLength = startbit - stopbit + 1
    else
        fieldsLength = startbit
            .map((b, i) => b - stopbit[i] + 1)
            .reduce((old, newV) => old + newV)
    return fieldsLength
}
/**
 * method in charge of return the binary instruction after add the inmediate value of the instruction
 * @return {string} the new binary update
 */

export function generateBinary(
    separated,
    startbit,
    stopbit,
    binary,
    inm,
    fieldsLength,
    a
) {
    if (!separated || !separated[a]) {
        binary =
            binary.substring(0, binary.length - (startbit + 1)) +
            inm.padStart(fieldsLength, '0') +
            binary.substring(binary.length - stopbit, binary.length)
    } else {
        // check if the value fit on the first segment
        let myInm = inm
        for (let i = startbit.length - 1; i >= 0; i--) {
            let sb = startbit[i],
                stb = stopbit[i],
                diff = sb - stb + 1
            if (myInm.length <= diff) {
                binary =
                    binary.substring(0, binary.length - (sb + 1)) +
                    myInm.padStart(diff, '0') +
                    binary.substring(binary.length - stb, binary.length)
                break
            } else {
                let tmpinm = inm.substring(myInm.length - diff, myInm.length)
                binary =
                    binary.substring(0, binary.length - (sb + 1)) +
                    tmpinm.padStart(diff, '0') +
                    binary.substring(binary.length - stb, binary.length)
                myInm = myInm.substring(0, myInm.length - diff)
            }
        }
    }
    return binary
}
