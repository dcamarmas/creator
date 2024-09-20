
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
   * Representation
   */

  /**
   * method in chage of map a float number separated in parts and determinte what it.
   * @param s {Number} the sign of the number
   * @param e {Number} the exponent of the number.
   * @param m {Number} the mantinsa of the number
   * @return {number} 2^n with n as
   *      0 -> -infinite
   *      1 -> -normalized number
   *      2 -> -non-normalized number
   *      3 -> -0
   *      4 -> +0
   *      5 -> +normalized number
   *      6 -> +non-normalized number
   *      7 -> +inf
   *      8 -> -NaN
   *      9 -> +NaN
   */
  function checkTypeIEEE(s, e, m)
  {
      let rd = 0;

      if (!m && !e)
          rd = s ? 1<<3 : 1<<4;
      else if (!e)
          rd = s ? 1<<2 : 1<<5;
      else if (!(e ^ 255))
          if (m)
              rd = s ? 1<<8 : 1<<9;
          else
              rd = s ? 1<<0 : 1<<7;
      else
          rd = s ? 1<<1 : 1<<6;
      return rd;
  }

  /* 
   * Convert to...
   */

  function hex2char8 ( hexvalue )
  {
    var num_char = ((hexvalue.toString().length))/2;
    var exponent = 0;
    var pos = 0;

    var valuec = [] ;

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
    if (typeof value[1] != "undefined" && value[1].length > 8) {
      value[1] = value[1].substring(0, 8);
    }

    var value_bit = '';

    for (var i = 0; i < value[1].length; i++){
      var aux = value[1].charAt(i);
      aux = (parseInt(aux, 16)).toString(2).padStart(4, "0");
      value_bit = value_bit + aux;
    }

    value_bit = value_bit.padStart(32, "0");

    var buffer = new ArrayBuffer(4);
    new Uint8Array( buffer ).set( value_bit.match(/.{8}/g).map( binaryStringToInt ) );
    return new DataView( buffer ).getFloat32(0, false);
  }

  function uint_to_float32 ( value )
  {
    var buf = new ArrayBuffer(4) ;
    (new Uint32Array(buf))[0] = value ;
    return (new Float32Array(buf))[0] ;
  }

  function float32_to_uint ( value )
  {
    var buf = new ArrayBuffer(4) ;
    (new Float32Array(buf))[0] = value ;
    return (new Uint32Array(buf))[0];
  }

  function uint_to_float64 ( value0, value1 )
  {
    var buf = new ArrayBuffer(8) ;
    var arr = new Uint32Array(buf) ;
    arr[0] = value0 ;
    arr[1] = value1 ;
    return (new Float64Array(buf))[0] ;
  }

  function float64_to_uint ( value )
  {
    var buf = new ArrayBuffer(8) ;
    (new Float64Array(buf))[0] = value ;
    return (new Uint32Array(buf)) ;
  }

  function float2bin ( number )
  {
    var i, result = "";
    var dv = new DataView(new ArrayBuffer(4));

    dv.setFloat32(0, number, false);

    for (i = 0; i < 4; i++)
    {
      var bits = dv.getUint8(i).toString(2);
      if (bits.length < 8) {
          bits = new Array(8 - bits.length).fill('0').join("") + bits;
      }
      result += bits;
    }
    return result;
  }

  function double2bin ( number )
  {
    var i, result = "";
    var dv = new DataView(new ArrayBuffer(8));

    dv.setFloat64(0, number, false);

    for (i = 0; i < 8; i++)
    {
      var bits = dv.getUint8(i).toString(2);
      if (bits.length < 8) {
        bits = new Array(8 - bits.length).fill('0').join("") + bits;
      }
      result += bits;
    }
    return result;
  }

  function bin2hex ( s )
  {
    var i, k, part, accum, ret = '';

    for (i = s.length-1; i >= 3; i -= 4)
    {
      part = s.substr(i+1-4, 4);
      accum = 0;
      for (k = 0; k < 4; k += 1)
      {
        if (part[k] !== '0' && part[k] !== '1') {
          return { valid: false };
        }
        accum = accum * 2 + parseInt(part[k], 10);
      }
      if (accum >= 10) {
        ret = String.fromCharCode(accum - 10 + 'A'.charCodeAt(0)) + ret;
      }
      else {
        ret = String(accum) + ret;
      }
  }

    if (i >= 0)
    {
      accum = 0;
      for (k = 0; k <= i; k += 1)
      {
        if (s[k] !== '0' && s[k] !== '1') {
          return { valid: false };
        }
        accum = accum * 2 + parseInt(s[k], 10);
      }
      ret = String(accum) + ret;
    }

    return ret;
  }

  function hex2double ( hexvalue )
  {
    var value = hexvalue.split('x');
    var value_bit = '';

    for (var i=0; i<value[1].length; i++)
    {
      var aux = value[1].charAt(i);
      aux = (parseInt(aux, 16)).toString(2).padStart(4, "0");
      value_bit = value_bit + aux;
    }

    value_bit = value_bit.padStart(64, "0");

    var buffer = new ArrayBuffer(8);
    new Uint8Array( buffer ).set( value_bit.match(/.{8}/g).map(binaryStringToInt ));
    return new DataView( buffer ).getFloat64(0, false);
  }

  function float2int_v2 ( value )
  {
    return parseInt(float2bin(value),2);
  }

  function double2int_v2 ( value )
  {
    return parseInt(double2bin(value),2);
  }

  function int2float_v2 ( value )
  {
    return hex2float("0x" + bin2hex(value.toString(2)));
  }

  function full_print ( value, bin_value, add_dot_zero )
  {
    var print_value = value;

    //Add - if the number is -0.0
    if ( bin_value != null && value === 0 && bin_value[0] === 1 ) {
      print_value  = "-" + print_value;
    }

    //Add .0 if the number is 0.0 or similar
    if (add_dot_zero)
    {
      var aux_value = value.toString();
      if (aux_value.indexOf(".") == -1 && Number.isInteger(aux_value))
      {
        print_value = print_value + ".0";
      }
    }

    return print_value
  }


  /* 
   *  Naming
   */

  function clean_string( value, prefix )
  {
    var value2 = value.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '_');

    re = new RegExp("^[0-9]+$");
    if (value2.search(re) != -1 && prefix != "undefined") {
      value2 = prefix + value2;
    }

    return value2;
  }

