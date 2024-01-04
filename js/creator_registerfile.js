
/*
 *  Copyright 2018-2024 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos
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


/*
 *  Register operations
 */

function crex_findReg ( value1 )
{
  var ret = {} ;

  ret.match = 0;
  ret.indexComp = null;
  ret.indexElem = null;

  if (value1 == "") {
    return ret;
  }

  for (var i = 0; i < architecture.components.length; i++)
  {
     for (var j = 0; j < architecture.components[i].elements.length; j++)
     {
        if (architecture.components[i].elements[j].name.includes(value1) !== false)
        {
          ret.match = 1;
          ret.indexComp = i;
          ret.indexElem = j;
          break ;
        }
     }
  }

  return ret ;
}

function crex_findReg_bytag ( value1 )
{
  var ret = {} ;

  ret.match = 0;
  ret.indexComp = null;
  ret.indexElem = null;

  if (value1 == "") {
    return ret;
  }

  for (var i = 0; i < architecture.components.length; i++)
  {
     for (var j = 0; j < architecture.components[i].elements.length; j++)
     {
        if (architecture.components[i].elements[j].properties.includes(value1) !== false)
        {
          ret.match = 1;
          ret.indexComp = i;
          ret.indexElem = j;
          break ;
        }
     }
  }

  return ret ;
}

function readRegister ( indexComp, indexElem, register_type )
{
  var draw = {
    space: [] ,
    info: [] ,
    success: [] ,
    danger: [],
    flash: []
  } ;

  if ((architecture.components[indexComp].elements[indexElem].properties.includes("read") !== true))
  {
    for (var i = 0; i < instructions.length; i++) {
      draw.space.push(i);
    }
    draw.danger.push(execution_index);

    throw packExecute(true, 'The register '+ architecture.components[indexComp].elements[indexElem].name.join(' | ') +' cannot be read', 'danger', null);
  }

  if ((architecture.components[indexComp].type == "ctrl_registers") ||
      (architecture.components[indexComp].type == "int_registers"))
  {
    console_log(parseInt(architecture.components[indexComp].elements[indexElem].value));
    return parseInt(architecture.components[indexComp].elements[indexElem].value);
  }

  if (architecture.components[indexComp].type == "fp_registers")
  {
    if(architecture.components[indexComp].double_precision === false){
      //return parseFloat((architecture.components[indexComp].elements[indexElem].value).toString()); //TODO: big_int2hex -> hex2float //TODO
      console_log(bi_BigIntTofloat(architecture.components[indexComp].elements[indexElem].value));
      return bi_BigIntTofloat(architecture.components[indexComp].elements[indexElem].value);
    }
    else{
      
      if (architecture.components[indexComp].double_precision_type == "linked") 
      {
        //return parseFloat((architecture.components[indexComp].elements[indexElem].value).toString()); //TODO: big_int2hex -> hex2float //TODO
        console_log(bi_BigIntTodouble(architecture.components[indexComp].elements[indexElem].value));
        return bi_BigIntTodouble(architecture.components[indexComp].elements[indexElem].value);
      }
      else
      {
        if (typeof register_type === 'undefined'){
          register_type = "DFP-Reg";
        }
        if (register_type === 'SFP-Reg'){
          //return parseFloat((architecture.components[indexComp].elements[indexElem].value).toString()); //TODO: big_int2hex -> hex2float //TODO
          console_log(bi_BigIntTofloat(architecture.components[indexComp].elements[indexElem].value));
          return bi_BigIntTofloat(architecture.components[indexComp].elements[indexElem].value);
        }
        if (register_type === 'DFP-Reg'){
          //return parseFloat((architecture.components[indexComp].elements[indexElem].value).toString()); //TODO: big_int2hex -> hex2float //TODO
          console_log(bi_BigIntTodouble(architecture.components[indexComp].elements[indexElem].value));
          return bi_BigIntTodouble(architecture.components[indexComp].elements[indexElem].value);
        }
      }

    }

  }
}

function writeRegister ( value, indexComp, indexElem, register_type )
{
  var draw = {
    space: [] ,
    info: [] ,
    success: [] ,
    danger: [],
    flash: []
  } ;

  if (value == null) {
    return;
  }

  if ((architecture.components[indexComp].type == "int_registers") ||
      (architecture.components[indexComp].type == "ctrl_registers"))
  {
      if ((architecture.components[indexComp].elements[indexElem].properties.includes('write') !== true))
      {
        if ((architecture.components[indexComp].elements[indexElem].properties.includes('ignore_write') !== false)){
          return;
        }

        for (var i = 0; i < instructions.length; i++) {
           draw.space.push(i);
        }
        draw.danger.push(execution_index);

        throw packExecute(true, 'The register '+ architecture.components[indexComp].elements[indexElem].name.join(' | ') +' cannot be written', 'danger', null);
      }

      architecture.components[indexComp].elements[indexElem].value = bi_intToBigInt(value,10);
      creator_callstack_writeRegister(indexComp, indexElem);

      if ((architecture.components[indexComp].elements[indexElem].properties.includes('stack_pointer') !== false) &&
          (value != parseInt(architecture.memory_layout[4].value))) {
            writeStackLimit(parseInt(bi_intToBigInt(value,10)));
      }

      if (typeof window !== "undefined") {
        btn_glow(architecture.components[indexComp].elements[indexElem].name, "Int") ;
      }
  }

  else if (architecture.components[indexComp].type =="fp_registers")
  {
    if (architecture.components[indexComp].double_precision === false)
    {
      if ((architecture.components[indexComp].elements[indexElem].properties.includes('write') !== true))
      {
        if ((architecture.components[indexComp].elements[indexElem].properties.includes('ignore_write') !== false)){
          return;
        }
        draw.danger.push(execution_index);

        throw packExecute(true, 'The register '+ architecture.components[indexComp].elements[indexElem].name.join(' | ') +' cannot be written', 'danger', null);
      }

      //architecture.components[indexComp].elements[indexElem].value = parseFloat(value); //TODO: float2bin -> bin2hex -> hex2big_int //TODO
      architecture.components[indexComp].elements[indexElem].value = bi_floatToBigInt(value);
      creator_callstack_writeRegister(indexComp, indexElem);

      if ((architecture.components[indexComp].elements[indexElem].properties.includes('stack_pointer') !== false) &&
          (value != parseInt(architecture.memory_layout[4].value))) {
            writeStackLimit(parseFloat(value));
      }

      updateDouble(indexComp, indexElem);

      if (typeof window !== "undefined") {
        btn_glow(architecture.components[indexComp].elements[indexElem].name, "FP") ;
      }
    }

    else if (architecture.components[indexComp].double_precision === true)
    {
      if ((architecture.components[indexComp].elements[indexElem].properties.includes('write') !== true))
      {
        if ((architecture.components[indexComp].elements[indexElem].properties.includes('ignore_write') !== false)){
          return;
        }
        draw.danger.push(execution_index);

        throw packExecute(true, 'The register '+ architecture.components[indexComp].elements[indexElem].name.join(' | ') +' cannot be written', 'danger', null);
      }

      if (architecture.components[indexComp].double_precision_type == "linked") 
      {
        //architecture.components[indexComp].elements[indexElem].value = parseFloat(value); //TODO
        architecture.components[indexComp].elements[indexElem].value = bi_doubleToBigInt(value);
        updateSimple(indexComp, indexElem);
      }
      else
      {
        if (typeof register_type === 'undefined'){
          register_type = "DFP-Reg";
        }
        if (register_type === 'SFP-Reg'){
          architecture.components[indexComp].elements[indexElem].value = bi_floatToBigInt(value);
        }
        if (register_type === 'DFP-Reg'){
          architecture.components[indexComp].elements[indexElem].value = bi_doubleToBigInt(value);
        }
      }

      creator_callstack_writeRegister(indexComp, indexElem);

      if (typeof window !== "undefined") {
        btn_glow(architecture.components[indexComp].elements[indexElem].name, "DFP") ;
      }
    }
  }
}

/*Modifies double precision registers according to simple precision registers*/
function updateDouble(comp, elem)
{
  for (var i = 0; i < architecture.components.length; i++)
  {
    if (architecture.components[i].double_precision === true && architecture.components[i].double_precision_type == "linked")
    {
      for (var j = 0; j < architecture.components[i].elements.length; j++)
      {
        if (architecture.components[comp].elements[elem].name.includes(architecture.components[i].elements[j].simple_reg[0]) !== false){
          var simple = bin2hex(float2bin(readRegister(comp, elem)));
          var double = bin2hex(double2bin(readRegister(i, j))).substr(8, 15);
          var newDouble = simple + double;

          architecture.components[i].elements[j].value = bi_doubleToBigInt(hex2double("0x"+newDouble));
        }
        if (architecture.components[comp].elements[elem].name.includes(architecture.components[i].elements[j].simple_reg[1]) !== false){
          var simple = bin2hex(float2bin(readRegister(comp, elem)));
          var double = bin2hex(double2bin(readRegister(i, j))).substr(0, 8);
          var newDouble = double + simple;

          architecture.components[i].elements[j].value = bi_doubleToBigInt(hex2double("0x"+newDouble));
        }
      }
    }
  }
}

/*Modifies single precision registers according to double precision registers*/
function updateSimple ( comp, elem )
{
  if (architecture.components[comp].double_precision_type == "linked")
  {
    var part1 = bin2hex(double2bin(readRegister(comp, elem))).substr(0, 8);
    var part2 = bin2hex(double2bin(readRegister(comp, elem))).substr(8, 15);

    for (var i = 0; i < architecture.components.length; i++)
    {
      for (var j = 0; j < architecture.components[i].elements.length; j++)
      {
        if (architecture.components[i].elements[j].name.includes(architecture.components[comp].elements[elem].simple_reg[0]) !== false) {
          architecture.components[i].elements[j].value = bi_floatToBigInt(hex2float("0x"+part1));
        }
        if (architecture.components[i].elements[j].name.includes(architecture.components[comp].elements[elem].simple_reg[1]) !== false) {
          architecture.components[i].elements[j].value = bi_floatToBigInt(hex2float("0x"+part2));
        }
      }
    }
  }
}