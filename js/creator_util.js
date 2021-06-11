/*
 *  Copyright 2018-2021 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos
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
   * Utils
   */

  function hex2char8 ( hexvalue )
  {
	var num_char = ((hexvalue.toString().length))/2;
	var exponent = 0;
	var pos = 0;

	var valuec = new Array();

	for (var i = 0; i < num_char; i++) {
	  var auxHex = hexvalue.substring(pos, pos+2);
	  valuec[i] = String.fromCharCode(parseInt(auxHex, 16));
	  pos = pos + 2;
	}

	var characters = '';

	for (var i = 0; i < valuec.length; i++){
	  characters = characters + valuec[i] + ' ';
	}

	return  characters;
  }

  function hex2float ( hexvalue )
  {
	/*var sign     = (hexvalue & 0x80000000) ? -1 : 1;
	var exponent = ((hexvalue >> 23) & 0xff) - 127;
	var mantissa = 1 + ((hexvalue & 0x7fffff) / 0x800000);

	var valuef = sign * mantissa * Math.pow(2, exponent);
	if (-127 == exponent)
	  if (1 == mantissa)
	    valuef = (sign == 1) ? "+0" : "-0";
	  else valuef = sign * ((hexvalue & 0x7fffff) / 0x7fffff) * Math.pow(2, -126);
	if (128 == exponent)
	  if (1 == mantissa)
	    valuef = (sign == 1) ? "+Inf" : "-Inf";
	  else valuef = NaN;

	return valuef ;*/
	var value = hexvalue.split('x');
	var value_bit = '';

	for (var i = 0; i < value[1].length; i++){
	  var aux = value[1].charAt(i);
	  aux = (parseInt(aux, 16)).toString(2).padStart(4, "0");
	  value_bit = value_bit + aux;
	}

	var buffer = new ArrayBuffer(4);
	new Uint8Array( buffer ).set( value_bit.match(/.{8}/g).map( binaryStringToInt ) );
	return new DataView( buffer ).getFloat32(0, false);
  }

  function clean_string( value, prefix )
  {
	var value2 = value.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '_');

	re = new RegExp("^[0-9]+$");
	if (value2.search(re) != -1 && prefix != "undefined") {
		value2 = prefix + value2;
	}

	return value2;
  }