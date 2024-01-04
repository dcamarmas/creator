
/*
 *  Copyright 2018-2024 Felix Garcia Carballeira, Alejandro Calderon Mateos, Diego Camarmas Alonso
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


function bi_intToBigInt ( int_value, int_base )
{
  return BigInt(parseInt(int_value) >>> 0, int_base) ;
}


function bi_floatToBigInt ( float_value )
{
  var BigInt_value = null ;
  var bin          = float2bin(float_value);
  var hex          = bin2hex(bin);

  BigInt_value = BigInt("0x" + hex);

  return BigInt_value ;
}

function bi_BigIntTofloat ( big_int_value )
{
  var hex = big_int_value.toString(16);

  if (hex.length > 8) 
  {
    hex = hex.substring(hex.length-8, hex.length);
  }

  return hex2float("0x" + hex);
}


function bi_doubleToBigInt ( double_value )
{
  var BigInt_value = null ;
  var bin          = double2bin(double_value);
  var hex          = bin2hex(bin);

  BigInt_value = BigInt("0x" + hex);

  return BigInt_value ;
}

function bi_BigIntTodouble ( big_int_value )
{
  var hex = (big_int_value.toString(16)).padStart(16, "0");

  return hex2double("0x" + hex);
}


//String to number/bigint
function register_value_deserialize( architecture )
{
  //var architecture = architecture;

  for (var i=0; i<architecture.components.length; i++)
  {
    for (var j=0; j< architecture.components[i].elements.length; j++)
    {
      if (architecture.components[i].type != "fp_registers"){
        architecture.components[i].elements[j].value = bi_intToBigInt(architecture.components[i].elements[j].value,10) ;
      }
      else{
        architecture.components[i].elements[j].value = bi_floatToBigInt(architecture.components[i].elements[j].value) ;
      }

      if (architecture.components[i].double_precision !== true)
      {
        if (architecture.components[i].type != "fp_registers"){
          architecture.components[i].elements[j].default_value = bi_intToBigInt(architecture.components[i].elements[j].default_value,10) ;
        }
        else{
          architecture.components[i].elements[j].default_value = bi_floatToBigInt(architecture.components[i].elements[j].default_value) ;
        }
      }
    }
  }

  return architecture;
}


//Number/Bigint to string
function register_value_serialize( architecture )
{
  var aux_architecture = jQuery.extend(true, {}, architecture);

  for (var i=0; i<architecture.components.length; i++)
  {
    for (var j=0; j < architecture.components[i].elements.length; j++)
    {
      if (architecture.components[i].type != "fp_registers"){
        aux_architecture.components[i].elements[j].value = parseInt(architecture.components[i].elements[j].value);
      }
      else{
        aux_architecture.components[i].elements[j].value = bi_BigIntTofloat(architecture.components[i].elements[j].value);
      }

      if (architecture.components[i].double_precision !== true)
      {
        if (architecture.components[i].type != "fp_registers"){
          aux_architecture.components[i].elements[j].default_value = parseInt(architecture.components[i].elements[j].default_value);
        }
        else{
          aux_architecture.components[i].elements[j].default_value = bi_BigIntTofloat(architecture.components[i].elements[j].default_value);
        }
      }
    }
  }

  return aux_architecture;
}
