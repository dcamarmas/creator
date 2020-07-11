/*
 *  Copyright 2018-2020 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos
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

// todo: draw_info y draw_space añadirlo a ret...
function packExecute(error, err_msg, err_type, draw)
{
    var ret = {} ;

    ret.error    = error ;
    ret.msg      = err_msg ;
    ret.type     = err_type ;
    ret.draw     = draw ;

    return ret ;
}

function executeInstruction()
{
    return packExecute(false, null, null, null) ;
}

function executeProgramOneShot()
{
    var ret = null;

    for (var i=0; i<10000000; i++)
    {
       ret = executeInstruction();

       if (ret.error == true){
           return ret;
       }
       if (executionIndex < -1) {
           return ret;
       }
    }

  //return packExecute(true, '"ERROR:" Infinite loop', null, null) ;
    return packExecute(false, '', null, null) ;
}

/*Read register value*/
function readRegister(indexComp, indexElem)
{
}

/*Write value in register*/
function writeRegister(value, indexComp, indexElem)
{
}


/*Read memory value*/
function readMemory(addr, type)
{
}

/*Write value in memory*/
function writeMemory(value, addr, type)
{
}

/*Modify the stack limit*/
function writeStackLimit(stackLimit)
{
}

/*Syscall*/
function syscall(action, indexComp, indexElem, indexComp2, indexElem2)
{
}

/*Divides a double into two parts*/
function divDouble(reg, index)
{
  var value = bin2hex(double2bin(reg));
  console_log(value);
  if(index == 0){
    return "0x" + value.substring(0,8);
  }
  if(index == 1) {
    return "0x" + value.substring(8,16);
  }
}


/*Reset execution*/
function reset ()
{
}

