
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
   * Google Analytics
   */

  var is_ga_initialize = false ;

  function creator_ga ( category, action, label )
  {
    if (typeof gtag !== "undefined") {
      gtag('event',
            label,
            {
              'event_category' : "creator_"+category,
              'event_action' : action,
              'event_label' : label
            });
    }
  }


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
  * Data Structure
  */

 /* 
  * [ "x", "y" ] ;
  */
 var stack_call_names = [];

 /*
  * [
  *   {
  *     function_name: "",
  *     enter_stack_pointer: 0x0,
  *     register_sm:           [ indexComp: [ 0, ... ]... ; // once per register: state
  *     register_value:        [ indexComp: [ 0x0, ... ], ... ; // once per register: initial value (before save)
  *     register_size_write:   [ indexComp: [ 0x0, ... ], ... ; // once per register: size value
  *     register_size_read:    [ indexComp: [ 0x0, ... ], ... ; // once per register: size value
  *     register_address_write: [ indexComp: [ [0x0, 0x4, ...], ... ], ... ; // once per register: in which position is stored
  *     register_address_read:  [ indexComp: [ [0x0, 0x4, ...], ... ], ... ; // once per register: from which position is restored
  *   },
  *   ...
  * ] ;
  *
  */

 /*
  *
  * TODO: update this with draw.io graph
  * States:
  *  0 -> Init
  *  1 -> Saved in memory/stack
  *  2 -> Restored from memory/stack (read from memory stage)
  *  5 -> Restored from memory/stack (write register stage)
  *  3 -> Error
  *  4 -> Save/.../Restore/Save
  *
  *
  * Transitions (state x action -> next state):
  *
  *           WM==  WM!= RM  WR  RR  END
  *      0     1    1     2  a4   0   3
  *      1     1    7     6  5    1   b4
  *      2     1    1     2  e4   2   3
  *      3     -    -     -  -    -   -
  *      4     -    -     -  -    -   -
  *      5     d4   5     6  5    5   c4
  *      6     d4   6     6  0    6   c4
  *      7     7    7     6  5    7   b4
  *
  */

 var stack_state_transition = [
    { "wm==": 1,  "wm!=": 1,  "rm": 2,  "wr":40,  "rr": 0,  "end": 3  },
    { "wm==": 1,  "wm!=": 7,  "rm": 6,  "wr": 5,  "rr": 1,  "end":40  },
    { "wm==": 1,  "wm!=": 1,  "rm": 2,  "wr":45,  "rr": 2,  "end": 3  },
    { "wm==":-1,  "wm!=":-1,  "rm":-1,  "wr":-1,  "rr":-1,  "end":-1  },
    { "wm==":-1,  "wm!=":-1,  "rm":-1,  "wr":-1,  "rr":-1,  "end":-1  },
    { "wm==":44,  "wm!=": 5,  "rm": 6,  "wr": 5,  "rr": 5,  "end":43  },
    { "wm==":44,  "wm!=": 6,  "rm": 6,  "wr": 0,  "rr": 6,  "end":43  },
    { "wm==": 7,  "wm!=": 7,  "rm": 6,  "wr": 5,  "rr": 7,  "end":42  }
     ];

 var stack_call_register = [];


/*
 * Public API
 */

//
// Initialize
// Example: creator_callstack_create() ;
//
function creator_callstack_create()
{
    var ret = {
        ok: true,
        msg: ""
    };

    // initialize stack_call
    stack_call_names     = [];
    stack_call_register = [];
    creator_callstack_enter("main");

    return ret;
}

//
// "jal X, ..." -> add new element (at the end)
// Example: creator_callstack_Enter("main")
//
function creator_callstack_enter ( function_name )
{
    var ret = {
        ok: true,
        msg: ""
    };

    // 1.- caller name
    stack_call_names.push(function_name) ;

    // 2.- caller element
    var arr_sm = [];
    var arr_write = [];
    var arr_read = [];
    var arr_value = [];
    var arr_size_write = [];
    var arr_size_read = [];

    for (var i = 0; i < architecture.components.length; i++)
    {
                arr_sm.push([]);
             arr_write.push([]);
              arr_read.push([]);
             arr_value.push([]);
        arr_size_write.push([]);
         arr_size_read.push([]);

        for (var j = 0; j < architecture.components[i].elements.length; j++)
        {
                    arr_sm[i].push(0);
                 arr_write[i].push([]);
                  arr_read[i].push([]);
            arr_size_write[i].push([]);
             arr_size_read[i].push([]);
                 arr_value[i].push(architecture.components[i].elements[j].value);
        }
    }

    var new_elto = {
        function_name:          function_name,
        enter_stack_pointer:    architecture.memory_layout[4].value,
        register_sm:           arr_sm,
        register_value:        arr_value,
        register_size_write:   arr_size_write,
        register_size_read:    arr_size_read,
        register_address_write: arr_write,
        register_address_read:  arr_read
    };

    stack_call_register.push(new_elto);

    // return ok
    return ret;
}

//
// "jr ra, ..." -> remove last element
// Example: creator_callstack_Leave() ;
//
function creator_callstack_leave()
{
    var ret = {
        ok: true,
        msg: ""
    };

    // check params
    if (0 === stack_call_register.length) {
        ret.msg = "creator_callstack_Leave: empty stack_call_register !!.\n";
        return ret;
    }

    // get stack top element
    var last_elto = stack_call_register[stack_call_register.length - 1];

    //check sp that points to corresponding address
    if (ret.ok)
    {
        if (architecture.memory_layout[4].value != last_elto.enter_stack_pointer)
        {
            ret.ok  = false;
            ret.msg = "Stack memory has not been released successfully";
        }
    }

    // check values (check currrent state)
    if (ret.ok)
       {
         for (var i = 0; i < architecture.components.length; i++)
         {
            for (var j = 0; j < architecture.components[i].elements.length; j++)
            {
                if ((last_elto.register_value[i][j] != architecture.components[i].elements[j].value) &&
                    (architecture.components[i].elements[j].properties.includes("saved"))
                )
                {
                    ret.ok  = false;
                    ret.msg = "Possible failure in the parameter passing convention";
                    break;
                }
            }
         }
    }

    //Check state
    if (ret.ok)
    {
        for (var i = 0; i < architecture.components.length; i++)
        {
            for (var j = 0; j < architecture.components[i].elements.length; j++)
            {
                creator_callstack_do_transition("end", i, j, null);

                last_elto = stack_call_register[stack_call_register.length - 1];

                /////////////////////////// TEMPORAL SOLUTION ///////////////////////////////////////////////////////////////////
                //last_index_write = last_elto.register_address_write[i][j].length -1;
                last_index_read = last_elto.register_address_read[i][j].length -1;

                if ( (last_elto.register_address_write[i][j][0] == last_elto.register_address_read[i][j][last_index_read]) &&
                     (last_elto.register_sm[i][j] === 45) &&
                     (architecture.components[i].elements[j].properties.includes("saved")) // ...but should be saved
                )
                {
                    break;
                }

                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

                else if ( (last_elto.register_sm[i][j] !== 3) &&
                     (architecture.components[i].elements[j].properties.includes("saved")) // ...but should be saved
                )
                {
                    ret.ok  = false;
                    ret.msg = "Possible failure in the parameter passing convention";
                    break;
                }
            }
        }
    }

    //Check address
    if (ret.ok)
    {
        for (var i = 0; i < architecture.components.length; i++)
        {
            for (var j = 0; j < architecture.components[i].elements.length; j++)
            {
                //last_index_write = last_elto.register_address_write[i][j].length -1;
                last_index_read = last_elto.register_address_read[i][j].length -1;

                if ( (last_elto.register_address_write[i][j][0] != last_elto.register_address_read[i][j][last_index_read]) &&
                     (architecture.components[i].elements[j].properties.includes("saved")) // ...but should be saved
                )
                {
                    ret.ok  = false;
                    ret.msg = "Possible failure in the parameter passing convention";
                    break;
                }
            }
        }
    }

    //Check size
    if (ret.ok)
    {
        for (var i = 0; i < architecture.components.length; i++)
        {
            for (var j = 0; j < architecture.components[i].elements.length; j++)
            {
                //last_index_write = last_elto.register_size_write[i][j].length -1;
                last_index_read = last_elto.register_size_read[i][j].length -1;
                
                if ( (last_elto.register_size_write[i][j][0] != last_elto.register_size_read[i][j][last_index_read]) &&
                     (architecture.components[i].elements[j].properties.includes("saved")) // ...but should be saved
                )
                {
                    ret.ok  = false;
                    ret.msg = "Possible failure in the parameter passing convention";
                    break;
                }
            }
        }
    }

    // pop stack
    stack_call_register.pop();
    if (stack_call_names.length > 0) {
        stack_call_names.pop() ;
    }

    // return ok
    return ret;
}

//
// Get the last element
// Example: var elto = creator_callstack_getTop() ;
//
function creator_callstack_getTop()
{
    var ret = {
        ok: true,
        val: null,
        msg: ""
    };

    // check params
    if (0 === stack_call_register.length)
    {
        ret.ok = false;
        ret.msg = "creator_callstack_getTop: empty stack_call_register !!.\n";
        return ret;
    }

    // return the last element in the array
    ret.val = stack_call_register[stack_call_register.length - 1];
    return ret;
}

//
// Let programmers to modify some arbitrary field.
// Example: creator_callstack_getTop("function_name", 1, 2, "main") ;
//
function creator_callstack_setTop( field, indexComponent, indexElement, value )
{
    var ret = {
        ok: true,
        msg: ""
    };

    // check params
    if (0 === stack_call_register.length)
    {
        ret.ok = false;
        ret.msg = "creator_callstack_getTop: empty stack_call_register !!.\n";
        return ret;
    }

    // set field value
    var elto = stack_call_register[stack_call_register.length - 1];
    if (typeof elto.length !== "undefined")
    {
        elto[field][indexComponent][indexElement] = value;
        return ret;
    }

    elto[field] = value;
    return ret;
}

//
// Let programmers to modify register state
// Example: creator_callstack_setState(1, 2, 1) ;
//
function creator_callstack_setState (indexComponent, indexElement, newState)
{
    var elto = creator_callstack_getTop();
    if (elto.ok === false) {
        console_log('creator_callstack_setState: ' + elto.msg) ;
    return '' ;
    }

    elto.val.register_sm[indexComponent][indexElement] = newState;
}


function creator_callstack_getState (indexComponent, indexElement)
{
    var elto = creator_callstack_getTop();
    if (elto.ok === false) {
        console_log('creator_callstack_getState: ' + elto.msg) ;
    return '' ;
    }

    return elto.val.register_sm[indexComponent][indexElement];
}

//
// Let programmers add a new write
// Example: creator_callstack_newWrite(1, 2, 0x12345) ;
//
function creator_callstack_newWrite (indexComponent, indexElement, address, length)
{
    // Move state finite machine
    creator_callstack_do_transition("wm", indexComponent, indexElement, address);

    var elto = creator_callstack_getTop();
    if (elto.ok == false) {
        console_log('creator_callstack_newWrite: ' + elto.msg) ;
    return '' ;
    }

    elto.val.register_address_write[indexComponent][indexElement].push(address);
    elto.val.register_size_write[indexComponent][indexElement].push(length);
}

//
// Let programmers add a new read
// Example: creator_callstack_newRead(1, 2, 0x12345) ;
//
function creator_callstack_newRead (indexComponent, indexElement, address, length)
{
    var elto = creator_callstack_getTop();
    if (elto.ok == false) {
        console_log('creator_callstack_newRead: ' + elto.msg) ;
    return '' ;
    }

    elto.val.register_address_read[indexComponent][indexElement].push(address);
    elto.val.register_size_read[indexComponent][indexElement].push(length);

    // Move state finite machine
    creator_callstack_do_transition("rm", indexComponent, indexElement, address);
}

//
// Let programmers add a new read
// Example: creator_callstack_newRead(1, 2, 0x12345) ;
//
function creator_callstack_writeRegister (indexComponent, indexElement)
{
   // Move state finite machine
   creator_callstack_do_transition("wr", indexComponent, indexElement, address);
}

//
// Reset
// Example: creator_callstack_reset() ;
//
function creator_callstack_reset()
{
    var ret = {
        ok: true,
        msg: ""
    };

    // initialize stack_call
    stack_call_names     = [];
    stack_call_register = [];
    creator_callstack_enter("main");

    // return ok
    return ret ;
}

//
// do state transition
// Example: creator_callstack_do_transition("wm", 1, 2, 0x12345678)
//
function creator_callstack_do_transition ( doAction, indexComponent, indexElement, address )
{
    // get current state
    var state = creator_callstack_getState(indexComponent, indexElement);

    // get action
    var action = doAction ;
    if (doAction == "wm")
    {
        var elto = creator_callstack_getTop();
        if (elto.ok == false) {
            console_log('creator_callstack_do_transition: ' + elto.msg) ;
            return '' ;
        }

        var equal  = elto.val.register_address_write[indexComponent][indexElement].includes(address); 
        action = (equal) ? "wm==" : "wm!=" ;
    }

    if (doAction == "rm")
    {
        var elto = creator_callstack_getTop();
        if (elto.ok == false) {
            console_log('creator_callstack_do_transition: ' + elto.msg) ;
            return '' ;
        }

        var equal  = elto.val.register_address_write[indexComponent][indexElement].includes(address);
        if (equal == false){
            return
        }
    }

    if ( (typeof(stack_state_transition[state])         === "undefined") ||
         (typeof(stack_state_transition[state][action]) === "undefined") )
    {
        if (state < 40 || state < 0) {
            console_log("creator_callstack_do_transition: undefined action");
        } 
        return ;
    }

    // get new state: transition(state, action) -> new_state
    var new_state = stack_state_transition[state][action];
    creator_callstack_setState(indexComponent, indexElement, new_state);

    if (action != "end") {
        console_log("creator_callstack_do_transition [" + architecture.components[indexComponent].elements[indexElement].name +"]: transition from " +
                    "state '" + state + "'' to state '" + new_state + "' and action '" + action + "' is empty (warning).") ;
    }
}


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
 *  CREATOR instruction description API:
 *  Assert
 */

function capi_raise ( msg )
{
	if (typeof app !== "undefined"){
		app.exception(msg);
	}
	else
	{
		console.log(msg);
	}
}

function capi_arithmetic_overflow ( op1, op2, res_u )
{
	op1_u = capi_uint2int(op1) ;
	op2_u = capi_uint2int(op2) ;
	res_u = capi_uint2int(res_u) ;

	return ((op1_u > 0) && (op2_u > 0) && (res_u < 0)) || 
		   ((op1_u < 0) && (op2_u < 0) && (res_u > 0)) ;
}

function capi_bad_align ( addr, type )
{
	size = creator_memory_type2size(type) ;
	return (addr % size !== 0) ; // && (architecture.properties.memory_align == true) ; <- FUTURE-WORK
}


/*
 *  CREATOR instruction description API:
 *  Memory access
 */

/*
 * Name:        mp_write - Write value into a memory address
 * Sypnosis:    mp_write (destination_address, value2store, byte_or_half_or_word)
 * Description: similar to memmove/memcpy, store a value into an address
 */

function capi_mem_write ( addr, value, type, reg_name )
{
	var size = 1 ;

	// 1) check address is aligned
	if (capi_bad_align(addr, type))
	{
		capi_raise("The memory must be align") ;
		creator_executor_exit( true );
	}

	// 2) check address is into text segment
	var addr_16 = parseInt(addr, 16);
	if((addr_16 >= parseInt(architecture.memory_layout[0].value)) && (addr_16 <= parseInt(architecture.memory_layout[1].value)))
    {
        capi_raise('Segmentation fault. You tried to write in the text segment');
        creator_executor_exit( true );
    }

	// 3) write into memory
	try {
		writeMemory(value, addr, type);
	} 
	catch(e) {
		capi_raise("Invalid memory access to address '0x" + addr.toString(16) + "'") ;
		creator_executor_exit( true );
	}

	// 4) Call convenction
	var ret = crex_findReg(reg_name) ;
	if (ret.match === 0) {
		return;
	}

	var i = ret.indexComp ;
	var j = ret.indexElem ;

	creator_callstack_newWrite(i, j, addr, type);
}

/*
 * Name:        mp_read - Read value from a memory address
 * Sypnosis:    mp_read (source_address, byte_or_half_or_word)
 * Description: read a value from an address
 */

function capi_mem_read ( addr, type, reg_name )
{
	var size = 1 ;
	var val  = 0x0 ;

	// 1) check address is aligned
	if (capi_bad_align(addr, type))
	{
		capi_raise("The memory must be align") ;
		creator_executor_exit( true );
	}

	// 2) check address is into text segment
	var addr_16 = parseInt(addr, 16);
	if((addr_16 >= parseInt(architecture.memory_layout[0].value)) && (addr_16 <= parseInt(architecture.memory_layout[1].value)))
    {
        capi_raise('Segmentation fault. You tried to read in the text segment');
        creator_executor_exit( true );
    }

	// 3) read from memory
	try {
		val = readMemory(addr, type);
	} 
	catch(e) {
	   capi_raise("Invalid memory access to address '0x" + addr.toString(16) + "'") ;
	   creator_executor_exit( true );
	}

	var ret = creator_memory_value_by_type(val, type) ;

	// 4) Call convenction
	var find_ret = crex_findReg(reg_name) ;
	if (find_ret.match === 0) {
		return ret;
	}

	var i = find_ret.indexComp ;
	var j = find_ret.indexElem ;
	
	creator_callstack_newRead(i, j, addr, type);

	// 5) return value
	return ret ;
}


/*
 *  CREATOR instruction description API:
 *  Syscall
 */

function capi_exit ( )
{
	/* Google Analytics */
	creator_ga('execute', 'execute.syscall', 'execute.syscall.exit');

	return creator_executor_exit( false ) ;
}

function capi_print_int ( value1 )
{
	/* Google Analytics */
	creator_ga('execute', 'execute.syscall', 'execute.syscall.print_int');

	/* Get register id */
	var ret1 = crex_findReg(value1) ;
	if (ret1.match === 0) {
		throw packExecute(true, "capi_syscall: register " + value1 + " not found", 'danger', null);
	}

	/* Print integer */
	var value   = readRegister(ret1.indexComp, ret1.indexElem);
	var val_int = parseInt(value.toString()) >> 0 ;


	var value = readRegister(ret1.indexComp, ret1.indexElem);
	var val_int = parseInt(value.toString()) >> 0 ;

	display_print(full_print(val_int, null, false));
}

function capi_print_float ( value1 )
{
	/* Google Analytics */
	creator_ga('execute', 'execute.syscall', 'execute.syscall.print_float');

	/* Get register id */
	var ret1 = crex_findReg(value1) ;
	if (ret1.match == 0) {
		throw packExecute(true, "capi_syscall: register " + value1 + " not found", 'danger', null);
	}

	/* Print float */
	var value = readRegister(ret1.indexComp, ret1.indexElem, "SFP-Reg");
	var bin = float2bin(value);

	display_print(full_print(value, bin, true));
}

function capi_print_double ( value1 )
{
	/* Google Analytics */
	creator_ga('execute', 'execute.syscall', 'execute.syscall.print_double');

	/* Get register id */
	var ret1 = crex_findReg(value1) ;
	if (ret1.match == 0) {
		throw packExecute(true, "capi_syscall: register " + value1 + " not found", 'danger', null);
	}

	/* Print double */
	var value = readRegister(ret1.indexComp, ret1.indexElem, "DFP-Reg");
	var bin = double2bin(value);

	display_print(full_print(value, bin, true));
}

function capi_print_char ( value1 )
{
	/* Google Analytics */
	creator_ga('execute', 'execute.syscall', 'execute.syscall.print_char');

	/* Get register id */
	var ret1 = crex_findReg(value1) ;
	if (ret1.match == 0) {
		throw packExecute(true, "capi_syscall: register " + value1 + " not found", 'danger', null);
	}

	/* Print char */
	var aux    = readRegister(ret1.indexComp, ret1.indexElem);
	var aux2   = aux.toString(16);
	var length = aux2.length;

	var value = aux2.substring(length-2, length) ;
	value = String.fromCharCode(parseInt(value, 16)) ;

	display_print(value) ;
}

function capi_print_string ( value1 )
{
	/* Google Analytics */
	creator_ga('execute', 'execute.syscall', 'execute.syscall.print_string');

	/* Get register id */
	var ret1 = crex_findReg(value1) ;
	if (ret1.match == 0) {
		throw packExecute(true, "capi_syscall: register " + value1 + " not found", 'danger', null);
	}

	/* Print string */
	var addr = readRegister(ret1.indexComp, ret1.indexElem);
    var msg  = readMemory(parseInt(addr), "string") ;
	display_print(msg) ;
}

function capi_read_int ( value1 )
{
	/* Google Analytics */
	creator_ga('execute', 'execute.syscall', 'execute.syscall.read_int');

	/* Get register id */
	var ret1 = crex_findReg(value1) ;
	if (ret1.match == 0) {
		throw packExecute(true, "capi_syscall: register " + value1 + " not found", 'danger', null);
	}

	/* Read integer */
        if (typeof document != "undefined") {
	    document.getElementById('enter_keyboard').scrollIntoView();
	}

	run_program = 3;
	return keyboard_read(kbd_read_int, ret1) ;
}

function capi_read_float ( value1 )
{
	/* Google Analytics */
	creator_ga('execute', 'execute.syscall', 'execute.syscall.read_float');

	/* Get register id */
	var ret1 = crex_findReg(value1) ;
	if (ret1.match == 0) {
		throw packExecute(true, "capi_syscall: register " + value1 + " not found", 'danger', null);
	}

        if (typeof document != "undefined") {
	    document.getElementById('enter_keyboard').scrollIntoView();
	}

	run_program = 3;
	return keyboard_read(kbd_read_float, ret1) ;
}

function capi_read_double ( value1 )
{
	/* Google Analytics */
	creator_ga('execute', 'execute.syscall', 'execute.syscall.read_double');

	/* Get register id */
	var ret1 = crex_findReg(value1) ;
	if (ret1.match == 0) {
		throw packExecute(true, "capi_syscall: register " + value1 + " not found", 'danger', null);
	}

        if (typeof document != "undefined") {
	    document.getElementById('enter_keyboard').scrollIntoView();
	}

	run_program = 3;
	return keyboard_read(kbd_read_double, ret1) ;
}

function capi_read_char ( value1 )
{
	/* Google Analytics */
	creator_ga('execute', 'execute.syscall', 'execute.syscall.read_char');

	/* Get register id */
	var ret1 = crex_findReg(value1) ;
	if (ret1.match == 0) {
		throw packExecute(true, "capi_syscall: register " + value1 + " not found", 'danger', null);
	}

        if (typeof document != "undefined") {
	    document.getElementById('enter_keyboard').scrollIntoView();
	}

	run_program = 3;
	return keyboard_read(kbd_read_char, ret1) ;
}

function capi_read_string ( value1, value2 )
{
	/* Google Analytics */
	creator_ga('execute', 'execute.syscall', 'execute.syscall.read_string');

	/* Get register id */
	var ret1 = crex_findReg(value1) ;
	if (ret1.match === 0) {
		throw packExecute(true, "capi_syscall: register " + value1 + " not found", 'danger', null);
	}

	var ret2 = crex_findReg(value2) ;
	if (ret2.match === 0) {
		throw packExecute(true, "capi_syscall: register " + value2 + " not found", 'danger', null);
	}

	/* Read string */
	if (typeof document != "undefined") {
	    document.getElementById('enter_keyboard').scrollIntoView();
	}

	ret1.indexComp2 = ret2.indexComp ;
	ret1.indexElem2 = ret2.indexElem ;

	run_program = 3;
	return keyboard_read(kbd_read_string, ret1) ;
}

function capi_sbrk ( value1, value2 )
{
	/* Google Analytics */
	creator_ga('execute', 'execute.syscall', 'execute.syscall.sbrk');

	/* Get register id */
	var ret1 = crex_findReg(value1) ;
	if (ret1.match === 0) {
		throw packExecute(true, "capi_syscall: register " + value1 + " not found", 'danger', null);
	}

	var ret2 = crex_findReg(value2) ;
	if (ret2.match === 0) {
		throw packExecute(true, "capi_syscall: register " + value2 + " not found", 'danger', null);
	}

	/* Request more memory */
	var new_size = parseInt(readRegister(ret1.indexComp, ret1.indexElem)) ;
	if (new_size < 0) {
		throw packExecute(true, "capi_syscall: negative size", 'danger', null) ;
	}

    var new_addr = creator_memory_alloc(new_size) ;
	writeRegister(new_addr, ret2.indexComp, ret2.indexElem);
}

function capi_get_clk_cycles ( )
{
	/* Google Analytics */
	creator_ga('execute', 'execute.syscall', 'execute.syscall.get_clk_cycles');

	return total_clk_cycles;
}


/*
 *  CREATOR instruction description API:
 *  Check stack
 */

function capi_callconv_begin ( addr )
{
	var function_name = "" ;

	// 1) Passing Convection enable?
	if (architecture.arch_conf[6].value === 0) {
		return;
	}

	// 2) get function name
	if (typeof architecture.components[0] !== "undefined")
	{
		if (typeof tag_instructions[addr] === "undefined")
			 function_name = "0x" + parseInt(addr).toString(16) ;
		else function_name = tag_instructions[addr] ;
	}

	// 3) callstack_enter
	creator_callstack_enter(function_name) ;
}

function capi_callconv_end ()
{
	// 1) Passing Convection enable?
	if (architecture.arch_conf[6].value === 0) {
		return;
	}

	// 2) Callstack_leave
	var ret = creator_callstack_leave();

	// 3) If everything is ok, just return 
	if (ret.ok) {
		return;
	}

	// 4) Othewise report some warning...
	// Google Analytics
	creator_ga('execute', 'execute.exception', 'execute.exception.protection_jrra' + ret.msg);

	// User notification
	crex_show_notification(ret.msg, 'danger') ;
}


/*
 *  CREATOR instruction description API:
 *  Draw stack
 */

function capi_drawstack_begin ( addr )
{
	var function_name = "" ;

	// 1.- get function name
	if (typeof architecture.components[0] !== "undefined")
	{
		if (typeof tag_instructions[addr] == "undefined")
			 function_name = "0x" + parseInt(addr).toString(16) ;
		else function_name = tag_instructions[addr] ;
	}

	// 2.- callstack_enter
	track_stack_enter(function_name) ;
}

function capi_drawstack_end ()
{
	// track leave
	var ret = track_stack_leave() ;

	// 2) If everything is ok, just return 
	if (ret.ok) {
		return;
	}

	// User notification
	crex_show_notification(ret.msg, 'warning') ;
}


/*
 *  CREATOR instruction description API:
 *  Representation
 */

function capi_split_double ( reg, index )
{
	var value = bin2hex(double2bin(reg));
	console_log(value);
	if(index === 0){
		return value.substring(0,8);
	}
	if(index === 1) {
		return value.substring(8,16);
	}
}

function capi_uint2float32 ( value )
{
	return uint_to_float32(value) ;
}

function capi_float322uint ( value )
{
	return float32_to_uint(value) ;
}

function capi_int2uint ( value )
{
	return (value >>> 0) ;
}

function capi_uint2int ( value )
{
	return (value >> 0) ;
}

function capi_uint2float64 ( value0, value1 )
{
	return uint_to_float64(value0, value1) ;
}

function capi_float642uint ( value )
{
	return float64_to_uint(value) ;
}

function capi_check_ieee ( s, e, m )
{
	return checkTypeIEEE(s, e, m) ;
}

function capi_float2bin ( f )
{
	return float2bin(f) ;
}

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
  * Data Structure
  */

    /*
     *  track_stack_names = [ "PC=xxx", "main" ] ;
     */
    var track_stack_names = [];

    /*
     *  track_stack_limits = [
     *		               {
     *		                  function_name: "",
     *		                  begin_caller: 0,
     *		                  end_caller: 0,
     *		                  begin_callee: 0,
     *		                  end_callee: 0
     *		               },
     *		               ...
     *                      ] ;
     */
    var track_stack_limits = [];


 /*
  * Public API
  */

//
// Initialize
// Example: track_stack_create() ;
//
function track_stack_create()
{
    var ret = {
        ok: true,
        msg: ""
    };

    // initialize array
    track_stack_names  = [];
    track_stack_limits = [];
    track_stack_enter("main");

    return ret;
}

//
// "jal X, ..." -> add new element (at the end)
// Example: track_stack_Enter("main")
//
function track_stack_enter ( function_name )
{
    var ret = {
        ok: true,
        msg: ""
    };

    // 1.- caller name
    track_stack_names.push(function_name) ;

    // 2.- new call element
    var new_elto = {
        function_name:          function_name,
        begin_caller:           track_stack_getTop().val.begin_callee, // llamante: FFFFFFFC, FFFFFFF0
        end_caller:             track_stack_getTop().val.end_callee,   // llamante: FFFFFFF0, FFFFFF00
        begin_callee:           architecture.memory_layout[4].value,   // llamado:  FFFFFFF0, FFFFFF00
        end_callee:             architecture.memory_layout[4].value    // llamado:  FFFFFFF0, FFFFFF00
    };

    track_stack_limits.push(new_elto);

    // 3.- update UI
    if (typeof window !== "undefined")
    {
        app._data.callee_subrutine  = track_stack_names[track_stack_names.length - 1];
        app._data.caller_subrutine  = track_stack_names[track_stack_names.length - 2];
        app._data.begin_caller      = new_elto.begin_caller; 
        app._data.end_caller        = new_elto.end_caller;
        app._data.begin_callee      = new_elto.begin_callee;
        app._data.end_callee        = new_elto.end_callee;
    }

    return ret;
}

//
// "jr ra, ..." -> remove last element
// Example: track_stack_Leave() ;
//
function track_stack_leave()
{
    var ret = {
        ok: true,
        msg: ""
    };

    // check params
    if (0 === track_stack_limits.length)
    {
        ret.msg = "track_stack_Leave: empty track_stack_limits !!.\n";
        return ret;
    }

    // pop both stacks
    track_stack_limits.pop();
    if (track_stack_names.length > 0) {
        track_stack_names.pop() ;
    }

    // draw stack zones
    var elto_top = track_stack_getTop() ;
    if ( (typeof window !== "undefined") && (elto_top.val != null) )
    {
        app._data.callee_subrutine = track_stack_names[track_stack_names.length - 1];
        app._data.caller_subrutine = track_stack_names[track_stack_names.length - 2];
        app._data.begin_caller     = elto_top.val.begin_caller;  // llamante: FFFFFFFC, FFFFFFF0, FFFFFF00
        app._data.end_caller       = elto_top.val.end_caller;    // llamante: FFFFFFF0, FFFFFF00, FFFFF000
        app._data.begin_callee     = elto_top.val.begin_callee;  // llamado:  FFFFFFF0, FFFFFF00, FFFFF000
        app._data.end_callee       = elto_top.val.end_callee;    // llamado:  FFFFFFF0, FFFFFF00, FFFFF000
    }

    return ret;
}

//
// Get the last element
// Example: var elto = track_stack_getTop() ;
//
function track_stack_getTop()
{
    var ret = {
        ok: true,
        val: {
            begin_caller: architecture.memory_layout[4].value,
            end_caller: architecture.memory_layout[4].value,
            begin_callee: architecture.memory_layout[4].value,
            end_callee: architecture.memory_layout[4].value
        },
        msg: ""
    };

    // check params
    if (0 === track_stack_limits.length)
    {
        ret.ok = false;
        ret.msg = "track_stack_getTop: empty track_stack_limits !!.\n";
        return ret;
    }

    // return the last element in the array
    ret.val = track_stack_limits[track_stack_limits.length - 1];
    if (typeof ret.val.begin_caller === "undefined"){
        ret.val.begin_caller = architecture.memory_layout[4].value;
    }

    return ret;
}

//
// Let programmers to modify some arbitrary field.
// Example: track_stack_getTop("function_name", 1, 2, "main") ;
//
function track_stack_setTop( field, indexComponent, indexElement, value )
{
    var ret = {
        ok: true,
        msg: ""
    };

    // check params
    if (0 === track_stack_limits.length)
    {
        ret.ok = false;
        ret.msg = "track_stack_getTop: empty track_stack_limits !!.\n";
        return ret;
    }

    // set field value
    var elto = track_stack_limits[track_stack_limits.length - 1];
    if (typeof elto.length !== "undefined")
    {
        elto[field][indexComponent][indexElement] = value;
        return ret;
    }

    elto[field] = value;
    return ret;
}

//
// Updates the .end_callee field of the top stack element
// Example: track_stack_setsp("0xFFFFFFF0") ;
//
function track_stack_setsp(value)
{
    if (typeof window !== "undefined") {
        app._data.end_callee = value;   // llamado:  FFFFFFF0, FFFFFF00, FFFFF000
    }

    // check params
    if (0 === track_stack_limits.length) {
        return;
    }

    // return the last element in the array
    var elto = track_stack_limits[track_stack_limits.length - 1];
    elto.end_callee = value;
}

//
// Reset
// Example: track_stack_reset() ;
//
function track_stack_reset()
{
    var ret = {
        ok: true,
        msg: ""
    };

    // initialize stack_call
    track_stack_names  = [];
    track_stack_limits = [];
    track_stack_enter("main");

    // draw new limits
    if (typeof window !== "undefined")
    {
        app._data.track_stack_names = track_stack_names;
        app._data.callee_subrutine  = track_stack_names[track_stack_names.length - 1];
        app._data.caller_subrutine  = "";
        app._data.begin_caller      = architecture.memory_layout[4].value;
        app._data.end_caller        = architecture.memory_layout[4].value;
        app._data.begin_callee      = architecture.memory_layout[4].value;
        app._data.end_callee        = architecture.memory_layout[4].value;
    }

    return ret ;
}


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


/********************
 * Global variables *
 ********************/

var word_size_bits  = 32 ;
    // TODO: load from architecture

var word_size_bytes = word_size_bits / 8 ;
    // TODO: load from architecture

var main_memory = [] ;
    //  [
    //    addr: { addr: addr, bin: "00", def_bin: "00", tag: null, data_type: ref <main_memory_datatypes>, reset: true, break: false },
    //    ...
    //  ]

var main_memory_datatypes = {} ;
    //  {
    //    addr: { address: addr, "type": type, "address": addr, "value": value, "default": "00", "size": 0 },
    //    ...
    //  }

var memory_hash = [ "data_memory", "instructions_memory", "stack_memory" ] ;
    // main segments


/********************
 * Internal API     *
 ********************/

// Address

function main_memory_get_addresses ( )
{
        return Object.keys(main_memory)
                     .sort(function (a, b) {
                             ia = parseInt(a) ;
                             ib = parseInt(b) ;
                             if (ia > ib) return -1;
                             if (ib > ia) return  1;
                                          return  0;
                     }) ;
}

function main_memory_datatype_get_addresses ( )
{
        return Object.keys(main_memory_datatypes)
                     .sort(function (a, b) {
                             ia = parseInt(a) ;
                             ib = parseInt(b) ;
                             if (ia > ib) return -1;
                             if (ib > ia) return  1;
                                          return  0;
                     }) ;
}

// Full value (stored in address)

function main_memory_packs_forav ( addr, value )
{
        return {
                 addr: addr,
                 bin: value,
                 def_bin: "00",
                 tag: null,
                 data_type: null,
                 reset: true,
                 break: false
               } ;
}

function main_memory_datatypes_packs_foravt ( addr, value, type, size )
{
  var default_value = "00"

  if (typeof(main_memory_datatypes[addr]) !== 'undefined')
  {
    default_value = main_memory_datatypes[addr].default_value;
  }

  return {
           address: addr,
           value: value,
           default: default_value,
           type: type,
           size: size
         } ;
}

// reset (set to defaults) and clear (remove all values)

function main_memory_reset ( )
{
        var i = 0;

        // reset memory
        var addrs = main_memory_get_addresses() ;
        for (i=0; i<addrs.length; i++) {
             main_memory[addrs[i]].bin = main_memory[addrs[i]].def_bin ;
        }

        // reset datatypes
        addrs = main_memory_datatype_get_addresses() ;
        for (i=0; i<addrs.length; i++) {
             main_memory_datatypes[addrs[i]].value = main_memory_datatypes[addrs[i]].default ;
        }
}

function main_memory_clear ( )
{
        // reset memory and datatypes
        main_memory = [] ;
        main_memory_datatypes = {} ;
}

//// Read/write (1/3): object level (compilation)

function main_memory_read ( addr )
{
        if (typeof main_memory[addr] !== "undefined") {
            return main_memory[addr] ;
        }

        return main_memory_packs_forav(addr, '00') ;
}

function main_memory_write ( addr, value )
{
        main_memory[addr] = value ;
}

function main_memory_zerofill ( addr, size )
{
        //Old zerofill version
        /*for (var i=0; i<size; i++)
        {
             var value = main_memory_packs_forav(addr+i, '00') ;
             main_memory_write(addr+i, value) ;
        }*/

        var base = {
               addr: 0,
               bin: '00',
               def_bin: "00",
               tag: null,
               data_type: null,
               reset: true,
               break: false
        } ;

        // Thanks for this line to Gonzalo Juarez Tello :-)
        var value = Array(size).fill(base).map( (x,i) => { return {...x, addr: addr+i};}  ) ;

        main_memory.splice(addr, size, ...value);
}

function main_memory_update_associated_datatype ( addr, value, datatype )
{
        var value = main_memory_read(addr) ;
        value.main_memory_datatypes = datatype ;
        main_memory[addr] = value ;
}


//// Read/write (2/3): byte level (execution)

function main_memory_read_value ( addr )
{ // main_memory_read_value  ( addr: integer )
        return main_memory_read(addr).bin ;
}

function main_memory_write_value ( addr, value )
{ // main_memory_write_value ( addr: integer,  value: string (hexadecimal) )
        var value_obj = main_memory_read(addr) ;
        value_obj.bin = value ;
        main_memory_write (addr, value_obj) ;
}

function main_memory_write_tag ( addr, tag )
{ // main_memory_write_tag ( addr: integer,  tag: string )
        var value_obj = main_memory_read(addr) ;
        value_obj.tag = tag ;
        main_memory_write (addr, value_obj) ;
}

function main_memory_read_default_value ( addr )
{
        return main_memory_read(addr).def_bin ;
}

//// Read/write nbytes

function main_memory_read_nbytes ( addr, n )
{
        var value = "" ;
        for (var i = 0; i < n; i++) {
             value = value + main_memory_read_value(addr+i) ;
        }

        return value;
}

function main_memory_write_nbytes ( addr, value, n )
{
        var value_str = value.toString(16).padStart(2*n, "0") ;
        var chunks    = value_str.match(/.{1,2}/g) ;

        for (var i = 0; i < n; i++) {
             main_memory_write_value(addr+i, chunks[i]) ;
        }
}

//// Read/write (3/3): DATAtype level (byte, ..., integer, space, ...)

var string_length_limit = 4*1024 ;

function create_memory_read_string ( addr )
{
        var ch = '' ;
        var ret_msg = '' ;

        for (var i=0; i<string_length_limit; i++)
        {
             ch = main_memory_read_value(addr+i) ;
             if (ch == '00') {
                 return ret_msg ;
             }

             ret_msg += String.fromCharCode(parseInt(ch, 16));
        }

        return ret_msg + '... (string length greater than ' + string_length_limit + ' chars)' ;
}

function main_memory_read_bydatatype ( addr, type )
{
        var ret = 0x0 ;

        switch (type)
        {
          case 'b':
          case 'bu':
          case 'byte':
               ret = "0x" + main_memory_read_value(addr) ;
               ret = parseInt(ret, 16) ;
               break;

          case 'h':
          case 'hu':
          case 'half':
          case 'half_word':
               ret = "0x" + main_memory_read_nbytes(addr, word_size_bytes/2) ;
               ret = parseInt(ret, 16) ;
               break;

          case 'w':
          case 'integer':
          case 'word':
               ret = "0x" + main_memory_read_nbytes(addr, word_size_bytes) ;
               ret = parseInt(ret, 16) ;
               break;

          case 'float':
               ret = "0x" + main_memory_read_nbytes(addr, word_size_bytes) ;
               ret = hex2float(ret) ;
               break;

          case 'd':
          case 'double':
          case 'double_word':
               ret = "0x" + main_memory_read_nbytes(addr, word_size_bytes*2) ;
               ret = hex2double(ret) ;
               break;

          case 'c':
          case 'cu':
          case 'char':
               ch = main_memory_read_value(addr) ;
               ret = String.fromCharCode(parseInt(ch, 16));
               break;

          case 'asciiz':
          case 'string':
          case 'ascii_null_end':
               ret = create_memory_read_string(addr) ;
               break;

          case 'ascii':
          case 'ascii_not_null_end':
               // TODO
               break;

          case 'space':
               // TODO
               break;
        }

        return ret ;
}

function main_memory_datatypes_update ( addr )
{
        var data = main_memory_read(addr) ;
        var data_type = data.data_type ;
        if (data_type != null)
        {
            var new_value   = main_memory_read_bydatatype(addr, data_type.type) ;
            data_type.value = new_value ;
            return true ;
        }

        return false ;
}

function main_memory_datatypes_update_or_create ( addr, value_human, size, type )
{
        var addr_i ;

        // get main-memory entry for the associated byte at addr
        var data = main_memory_read(addr) ;

        // get associated datatype to this main-memory entry
        var data_type = data.data_type ;

        // if not associated datatype, make on... otherwise update it
        if (data_type == null) {
            data_type = main_memory_datatypes_packs_foravt(addr, value_human, type, size) ;
            main_memory_datatypes[addr] = data_type ;
        }
        else {
            var new_value   = main_memory_read_bydatatype(data_type.address, data_type.type) ;
            data_type.value = new_value ;
        }

        // update main-memory referencies...
        var data = null ;
        for (var i=0; i<size; i++)
        {
             data = main_memory_read(addr + i) ;
             data.data_type = data_type ;
             main_memory_write(addr + i, data) ;
        }
}


function main_memory_write_bydatatype ( addr, value, type, value_human )
{
        var ret  = 0x0 ;
        var size = 0 ;

        // store byte to byte...
        switch (type)
        {
                case 'b':
                case 'byte':
                     size = 1 ;
                     var value2 = creator_memory_value_by_type(value, type) ;
                     ret = main_memory_write_nbytes(addr, value2, size, type) ;
                     main_memory_datatypes_update_or_create(addr, value_human, size, type);
                     break;

                case 'h':
                case 'half':
                case 'half_word':
                     size = word_size_bytes / 2 ;
                     var value2 = creator_memory_value_by_type(value, type) ;
                     ret = main_memory_write_nbytes(addr, value2, size, type) ;
                     main_memory_datatypes_update_or_create(addr, value_human, size, type);
                     break;

                case 'w':
                case 'integer':
                case 'float':
                case 'word':
                     size = word_size_bytes ;
                     ret = main_memory_write_nbytes(addr, value, size, type) ;
                     main_memory_datatypes_update_or_create(addr, value_human, size, type);
                     break;

                case 'd':
                case 'double':
                case 'double_word':
                     size = word_size_bytes * 2 ;
                     ret = main_memory_write_nbytes(addr, value, size, type) ;
                     main_memory_datatypes_update_or_create(addr, value_human, size, type);
                     break;

                case 'string':
                case 'ascii_null_end':
                case 'asciiz':
                case 'ascii_not_null_end':
                case 'ascii':
                     var ch   = 0 ;
                     var ch_h = '';
                     for (var i=0; i<value.length; i++) {
                          ch = value.charCodeAt(i);
                          ch_h = value.charAt(i);
                          main_memory_write_nbytes(addr+i, ch.toString(16), 1, type) ;
                          main_memory_datatypes_update_or_create(addr+i, ch_h, 1, 'char');
                          size++ ;
                     }

                     if ( (type != 'ascii') && (type != 'ascii_not_null_end') ) {
                           main_memory_write_nbytes(addr+value.length, "00", 1, type) ;
                           main_memory_datatypes_update_or_create(addr+value.length, "0", 1, 'char');
                           size++ ;
                     }
                     break;

                case 'space':
                     for (var i=0; i<parseInt(value); i++) {
                          main_memory_write_nbytes(addr+i, "00", 1, type) ;
                          size++ ;
                     }
                     main_memory_datatypes_update_or_create(addr, value_human, size, type);
                     break;

                case 'instruction':
                     size = Math.ceil(value.toString().length / 2) ;
                     ret = main_memory_write_nbytes(addr, value, size, type) ;
                     main_memory_datatypes_update_or_create(addr, value_human, size, type);
                     break;
        }

        // update view
        creator_memory_updateall();

        return ret ;
}


/********************
 * Public API (1/3) *
 ********************/

// Type, size and address...

function creator_memory_type2size ( type )
{
        var size = 4;

        switch (type)
        {
                case 'b':
                case 'bu':
                case 'byte':
                     size = 1 ;
                     break;

                case 'h':
                case 'hu':
                case 'half':
                case 'half_word':
                     size = word_size_bytes / 2 ;
                     break;

                case 'w':
                case 'wu':
                case 'word':
                case 'float':
                case 'integer':
                case 'instruction':
                     size = word_size_bytes ;
                     break;

                case 'd':
                case 'du':
                case 'double':
                case 'double_word':
                      size = word_size_bytes * 2 ;
                      break;
        }

        return size ;
}

function creator_memory_value_by_type ( val, type )
{
        switch (type)
        {
                case 'b':
                 val = val & 0xFF ;
                 if (val & 0x80)
                 {
                         val = 0xFFFFFF00 | val ;
                         val = (val >>> 0)
                 }
                 break;

                case 'bu':
                 val = ((val << 24) >>> 24) ;
                 break;

                case 'h':
                 val = val & 0xFFFF ;
                 if (val & 0x8000)
                 {
                         val = 0xFFFF0000 | val ;
                         val = (val >>> 0)
                 }
                 break;

                case 'hu':
                 val = ((val << 16) >>> 16) ;
                 break;

                default:
                 break;
        }

        return val ;
}

function creator_memory_alignelto ( new_addr, new_size )
{
        var ret = {
                    new_addr: new_addr,
                    new_size: new_size
                  } ;

        // get align address and size
        for (var i=0; i<align; i++)
        {
             if (((new_addr + i) % align) === 0) {
                 ret.new_addr = new_addr + i ;
             }
             if (((new_size + i) % align) === 0) {
                 ret.new_size = new_size + i ;
             }
        }

        return ret ;
}

// set default content for main_memory and main_memory_datatype

function creator_memory_prereset ( )
{
        var i = 0;

        // prereset main memory
        var addrs = main_memory_get_addresses() ;
        for (i=0; i<addrs.length; i++) {
             main_memory[addrs[i]].def_bin = main_memory[addrs[i]].bin ;
        }

        // prereset datatypes
        addrs = main_memory_datatype_get_addresses() ;
        for (i=0; i<addrs.length; i++) {
             main_memory_datatypes[addrs[i]].default = main_memory_datatypes[addrs[i]].value ;
        }
}

// find address by tag

function creator_memory_findaddress_bytag ( tag )
{
        var ret = {
                     exit:  0,
                     value: 0
                  } ;

        // find main memory by tag
        var addrs = main_memory_get_addresses() ;
        for (var i=0; i<addrs.length; i++)
        {
             if (main_memory[addrs[i]].tag == tag)
             {
                 ret.exit  = 1 ;
                 ret.value = parseInt(addrs[i]) ;
             }
        }

        return ret ;
}

// memory zerofill and alloc ...

function creator_memory_zerofill ( new_addr, new_size )
{
        // fill memory
        main_memory_zerofill(new_addr, new_size) ;

        // update view
        creator_memory_updateall();

        // return initial address used
        return new_addr ;
}

function creator_memory_alloc ( new_size )
{
        // get align address
        var new_addr = parseInt(architecture.memory_layout[3].value) + 1 ;
        var algn = creator_memory_alignelto(new_addr, new_size) ;

        // fill memory
        creator_memory_zerofill(algn.new_addr, algn.new_size) ;

        // new segment limit
        architecture.memory_layout[3].value ="0x" + ((algn.new_addr + new_size).toString(16)).padStart(8, "0").toUpperCase();
        if (typeof app !== "undefined") {
            app.architecture.memory_layout[3].value = "0x" + ((algn.new_addr + new_size).toString(16)).padStart(8, "0").toUpperCase();
        }

        return algn.new_addr ;
}

function main_memory_storedata ( data_address, value, size, dataLabel, value_human, DefValue, type )
{
        var algn = creator_memory_alignelto(data_address, size) ;

        main_memory_write_bydatatype(algn.new_addr, value, type, value_human) ;
        creator_memory_zerofill((algn.new_addr + size), (algn.new_size - size)) ;

        if (dataLabel != '') {
            main_memory_write_tag(algn.new_addr, dataLabel) ;
        }

        return parseInt(algn.new_addr) + parseInt(size) ;
}

// for debugging...

function creator_memory_consolelog ( )
{
        var i = 0;

        // show main memory
        console.log(' ~~~ main memory ~~~~~~~~~~~~~~') ;
        var addrs = main_memory_get_addresses() ;
        for (i=0; i<addrs.length; i++) {
             console.log(JSON.stringify(main_memory[addrs[i]])) ;
        }

        // show datatypes
        console.log(' ~~~ datatypes ~~~~~~~~~~~~~~') ;
        addrs = main_memory_datatype_get_addresses() ;
        for (i=0; i<addrs.length; i++) {
             console.log(JSON.stringify(main_memory_datatypes[addrs[i]])) ;
        }
}


/************************
 * Public API (2/3): UI *
 ************************/

// update an app._data.main_memory row:
//  "000": { addr: 2003, addr_begin: "0x200", addr_end: "0x2003",
//           hex:[{byte: "1A", tag: "main"},...],
//           value: "1000", size: 4, eye: true, hex_packed: "1A000000" },
//  ...

function creator_memory_updaterow ( addr )
{
    // skip if app.data does not exit...
    if ((typeof app == "undefined") || (typeof app._data.main_memory == "undefined") ) {
        return ;
    }

    // base address
    var addr_base = parseInt(addr) ;
        addr_base = addr_base - (addr_base % word_size_bytes) ; // get word aligned address

    // get_or_create...
    var elto = { addr:0, addr_begin:'', addr_end:'', value:'', size:0, hex:[], eye:true } ;
    if (typeof app._data.main_memory[addr_base] != "undefined")
    { // reuse the existing element...
        elto = app._data.main_memory[addr_base] ;
    }
    else
    { // set a new element, and set the initial values...
        Vue.set(app._data.main_memory, addr_base, elto) ;

        for (var i=0; i<word_size_bytes; i++) {
             elto.hex[i] = { byte: "00", tag: null } ;
        }
    }

    // addr_begin
    elto.addr_begin = "0x" + addr_base.toString(16).padStart(word_size_bytes * 2, "0").toUpperCase() ;

    // addr_end
    var addr_end  = addr_base + word_size_bytes - 1 ;
    elto.addr_end = "0x" + addr_end.toString(16).padStart(word_size_bytes * 2, "0").toUpperCase() ;

    // addr
    elto.addr = addr_end ;

    // hex, hex_packed
    var v1 = {} ;
    elto.hex_packed = '' ;
    for (var i=0; i<word_size_bytes; i++)
    {
         v1 = main_memory_read(addr_base + i) ;

         elto.hex[i].byte = v1.bin;
         elto.hex[i].tag  = v1.tag;
         if (v1.tag == "") {
             elto.hex[i].tag  = null;
         }

         elto.hex_packed += v1.bin ;
    }

    // value, size and eye
    elto.value = '' ;
    elto.size  = 0 ;
    for (var i=0; i<word_size_bytes; i++)
    {
         if (typeof main_memory_datatypes[addr_base+i] == "undefined") {
             continue ;
         }

         elto.size = elto.size + main_memory_datatypes[addr_base+i].size ;
         if (main_memory_datatypes[addr_base+i].type != "space")
         {
             if (elto.value != '')
                 elto.value += ', ' ;
             elto.value += main_memory_datatypes[addr_base+i].value ;
         }
         else { // (main_memory_datatypes[addr_base+i].type == "space")
             elto.eye   = true ;
         }
    }
}

function creator_memory_updateall ( )
{
    // skip if app.data does not exit...
    if ((typeof app == "undefined") || (typeof app._data.main_memory == "undefined") ) {
        return ;
    }

    // update all rows in app._data.main_memory...
    var addrs = main_memory_get_addresses() ;

    var last_addr = -1;
    var curr_addr = -1;
    for (var i=0; i<addrs.length; i++)
    {
        curr_addr = parseInt(addrs[i]) ;
        if (Math.abs(curr_addr - last_addr) > (word_size_bytes - 1)) // if (|curr - last| > 3)
        {
            creator_memory_updaterow(addrs[i]);
            last_addr = curr_addr ;
        }
    }
}

function creator_memory_clearall ( )
{
    // skip if app.data does not exit...
    if ((typeof app == "undefined") || (typeof app._data.main_memory == "undefined") ) {
        return ;
    }

    // clear all
    app._data.main_memory = {} ;
}

function creator_memory_update_row_view ( selected_view, segment_name, row_info )
{
        if (typeof app._data.main_memory[row_info.addr] == "undefined") {
            return ;
        }

        var hex_packed = app._data.main_memory[row_info.addr].hex_packed ;
        var new_value  = app._data.main_memory[row_info.addr].value ;

        switch (selected_view)
        {
                case "sig_int":
                     new_value = parseInt(hex_packed, 16)  >> 0 ;
                     break ;
                case "unsig_int":
                     new_value = parseInt(hex_packed, 16) >>> 0 ;
                     break ;
                case "float":
                     new_value = hex2float("0x" + hex_packed) ;
                     break ;
                case "char":
                     new_value = hex2char8(hex_packed) ;
                     break ;
        }

        app._data.main_memory[row_info.addr].value = new_value ;
}

function creator_memory_update_space_view ( selected_view, segment_name, row_info )
{
        for (var i=0; i<row_info.size; i++) {
             creator_memory_update_row_view(selected_view, segment_name, row_info) ;
             row_info.addr ++ ;
        }
}


/********************
 * Public API (3/3) *
 ********************/

function writeMemory ( value, addr, type )
{
        main_memory_write_bydatatype(addr, value, type, value) ;

        // update view
        creator_memory_updaterow(addr);
}

function readMemory ( addr, type )
{
        return main_memory_read_bydatatype(addr, type) ;
}

function creator_memory_reset ( )
{
        main_memory_reset() ;

        // update view
        creator_memory_updateall() ;
}

function creator_memory_clear ( )
{
        main_memory_clear() ;
        creator_memory_clearall() ;
}


function creator_memory_is_address_inside_segment ( segment_name, addr )
{
         var elto_inside_segment = false ;

         if (segment_name == "instructions_memory") {
             elto_inside_segment = ((addr >= parseInt(architecture.memory_layout[0].value)) && (addr <= parseInt(architecture.memory_layout[1].value))) ;
         }
         if (segment_name == "data_memory") {
             elto_inside_segment = ((addr >= parseInt(architecture.memory_layout[2].value)) && (addr <= parseInt(architecture.memory_layout[3].value))) ;
         }
         if (segment_name == "stack_memory") {
             elto_inside_segment = (addr >= parseInt(architecture.memory_layout[3].value)) ;
         }

         return elto_inside_segment ;
}

function creator_memory_is_segment_empty ( segment_name )
{
          var addrs    = main_memory_get_addresses() ;
          var insiders = addrs.filter(function(elto) {
                                         return creator_memory_is_address_inside_segment(segment_name, elto) ;
                                      });

          return (insiders.length === 0) ;
}


function creator_memory_data_compiler ( data_address, value, size, dataLabel, DefValue, type )
{
        var ret = {
                     msg: '',
                     data_address: 0
                  } ;

        // If align changes then zerofill first...
        if ((data_address % align) > 0)
        {
             var to_be_filled = align - (data_address % align) ;
             creator_memory_zerofill(data_address, to_be_filled);
             data_address = data_address + to_be_filled;
        }

        if ((data_address % size !== 0) && (data_address % word_size_bytes !== 0)) {
            ret.msg = 'm21' ;
            ret.data_address = data_address ;
            return ret ;
        }

        if (dataLabel != null) {
            data_tag.push({tag: dataLabel, addr: data_address});
        }

        ret.msg = '' ;
        ret.data_address = main_memory_storedata(data_address, value, size, dataLabel, DefValue, DefValue, type) ;

        return ret ;
}

function creator_insert_instruction ( auxAddr, value, def_value, hide, hex, fill_hex, label )
{
        var size = Math.ceil(hex.toString().length / 2) ;
        return main_memory_storedata(auxAddr, hex, size, label, def_value, def_value, "instruction") ;
}

function creator_memory_storestring ( string, string_length, data_address, label, type, align )
{
        if (label != null) {
            data_tag.push({tag: label, addr: data_address});
        }

        return main_memory_storedata(data_address, string, string_length, label, string, string, type);
}


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


/********************
 * Global variables *
 ********************/

/*Architecture editor*/

/*Available architectures*/
var architecture_available = [];
/*New architectures*/
var load_architectures_available = [];
var load_architectures = [];
/*Architectures card background*/
var back_card = [];
/*Load architecture*/
var architecture_hash = [];
var architecture = {arch_conf:[], memory_layout:[], components:[], instructions:[], directives:[]};
var architecture_json = ""






/*Compilator*/

/*Codemirror*/
var textarea_assembly_editor;
var codemirrorHistory = null;
/*Assembly code textarea*/
var code_assembly = '';
/*Compilation index*/
var tokenIndex = 0 ;
var nEnters = 0 ;
var pc = 4; //PRUEBA
/*Instructions memory address*/
var address;
/*Data memory address*/
var data_address;
/*Stack memory address*/
var stack_address;
/*Backup memory address*/
var backup_stack_address;
var backup_data_address;
/*Pending instructions and pending tags*/
var pending_instructions = [];
var pending_tags = [];
/*Global functions*/
var extern = [];
/*Error code messages*/
var compileError = {
   'm0': function(ret) { return ""                                           + ret.token + "" },
   'm1': function(ret) { return "Repeated tag: "                             + ret.token + "" },
   'm2': function(ret) { return "Instruction '"                              + ret.token + "' not found" },
   'm3': function(ret) { return "Incorrect instruction syntax for '"         + ret.token + "'" },
   'm4': function(ret) { return "Register '"                                 + ret.token + "' not found" },
   'm5': function(ret) { return "Immediate number '"                         + ret.token + "' is too big" },
   'm6': function(ret) { return "Immediate number '"                         + ret.token + "' is not valid" },
   'm7': function(ret) { return "Tag '"                                      + ret.token + "' is not valid" },
   'm8': function(ret) { return "Address '"                                  + ret.token + "' is too big" },
   'm9': function(ret) { return "Address '"                                  + ret.token + "' is not valid" },
  'm10': function(ret) { return ".space value out of range ("                + ret.token + " is greater than 50MiB)" },
  'm11': function(ret) { return "The space directive value should be positive and greater than zero" },
  'm12': function(ret) { return "This field is too small to encode in binary '"              + ret.token + "" },
  'm13': function(ret) { return "Incorrect pseudoinstruction definition "    + ret.token + "" },
  'm14': function(ret) { return "Invalid directive: "                        + ret.token + "" },
  'm15': function(ret) { return "Invalid value '"                            + ret.token + "' as number." },
  'm16': function(ret) { return 'The string of characters must start with "' + ret.token + "" },
  'm17': function(ret) { return 'The string of characters must end with "'   + ret.token + "" },
  'm18': function(ret) { return "Number '"                                   + ret.token + "' is too big" },
  'm19': function(ret) { return "Number '"                                   + ret.token + "' is empty" },
//'m20': function(ret) { return "The text segment should start with '"       + ret.token + "'" },
  'm21': function(ret) { return "The data must be aligned"                   + ret.token + "" },
  'm22': function(ret) { return "The number should be positive '"            + ret.token + "'" },
  'm23': function(ret) { return "Empty directive"                            + ret.token + "" },
  'm24': function(ret) { return "After the comma you should go a blank --> " + ret.token + "" },
//'m25': function(ret) { return "Incorrect syntax "                          + ret.token + "" },
  'm26': function(ret) { return "Syntax error near line: "                   + ret.token + "" },
  'm27': function(ret) { return "Please check instruction syntax, inmediate ranges, register name, etc."}
} ;
/*Promise*/
let promise;


/*Simulator*/

/*Displayed notifications*/
var notifications = [];
/*Available examples*/
var example_set_available = [];
var example_available = [];
/*Instructions memory*/
var instructions = [];
var instructions_tag = [];
var tag_instructions = {};
var instructions_binary = [];
/*Data memory*/
var data = [];
var data_tag = [];
/*Binary*/
var code_binary = '';
var update_binary = '';
var load_binary = false;


//
// Load architecture
//


// Load architecture

function load_arch_select ( cfg ) //TODO: repeated?
{
      var ret = {
                  errorcode: "",
                  token: "",
                  type: "",
                  update: "",
                  status: "ok"
                } ;

      var auxArchitecture = cfg;
      architecture = register_value_deserialize(auxArchitecture);

      architecture_hash = [];
      for (var i = 0; i < architecture.components.length; i++) {
           architecture_hash.push({name: architecture.components[i].name, index: i});
      }

      backup_stack_address = architecture.memory_layout[4].value;
      backup_data_address  = architecture.memory_layout[3].value;

      ret.token = "The selected architecture has been loaded correctly";
      ret.type  = "success";
      return ret;
}


//
// console_log
//

var creator_debug = false ;

function console_log ( msg )
{
  if (creator_debug) {
      console_log(msg) ;
  }
}


//
// Compiler
//

/*Compile assembly code*/
function packCompileError(err_code, err_token, err_ti, err_bgcolor )
{
  var ret = {} ;

  ret.status     = "error" ;
  ret.errorcode  = err_code ;
  ret.token      = err_token ;
  ret.type       = err_ti ;
  ret.bgcolor    = err_bgcolor ;
  ret.tokenIndex = tokenIndex ;
  ret.line       = nEnters ;

  // generic error
  if (typeof err_token == "undefined") {
      err_code  = 'm27' ;
      ret.token = "" ;
  }

  ret.msg = compileError[err_code](ret) ;

  /*Google Analytics*/
  creator_ga('compile', 'compile.error', 'compile.error.' + ret.msg);
  creator_ga('compile', 'compile.type_error', 'compile.type_error.' + err_code);

  return ret ;
}

/*Places the pointer in the first position*/
function first_token()
{
        var assembly = code_assembly ;
        var index    = tokenIndex;

        // check that there are elements to read
        if (index >= assembly.length) {
            return null;
        }

        // skip till first token:
        while ( (":\t\n \r#".includes(assembly.charAt(index))) && (index < assembly.length) )
        {
              // skip <spaces>
              while ( (":\t\n \r".includes(assembly.charAt(index))) && (index < assembly.length) ) {
                      if (assembly.charAt(index) == "\n") nEnters++ ;
                      index++;
              }

              // skip line comment #...
              if (assembly.charAt(index) == '#')
              {
                  while ((assembly.charAt(index) != '\n') && (index < assembly.length)) {
                          index++;
                  }

                  while ( (":\t\n \r".includes(assembly.charAt(index))) && (index < assembly.length) ) {
                          if (assembly.charAt(index) == "\n") nEnters++ ;
                          index++;
                  }
              }
        }

        tokenIndex = index;
}

/* Read token */
function get_token()
{
        var assembly = code_assembly ;
        var index    = tokenIndex;

        // check that there are elements to read
        if (index >= assembly.length) {
            return null;
        }

        // read string: '...'
        if (assembly.charAt(index) == "'") {
            index++;
            while (assembly.charAt(index) != "'" && index < assembly.length) {
                  //if (assembly.charAt(index) == "\n") nEnters++ ;
                  index++;
            }
            index++;

            return assembly.substring(tokenIndex, index);
        }

        // read string: "..."
        if (assembly.charAt(index) == '"') {
            index++;
            while (assembly.charAt(index) != '"' && index < assembly.length) {
                  //if (assembly.charAt(index) == "\n") nEnters++ ;
                  index++;
            }
            index++;

            return assembly.substring(tokenIndex, index);
        }

        // ([{...
        if ("([{".includes( assembly.charAt(index) )) {
             index++;
        }

        while ((",()[]{}:#\t\n \r".includes( assembly.charAt(index) ) === false) && (index < assembly.length))
        {
             index++;
        }
        //if (assembly.charAt(index) == "\n") nEnters++ ;

        var res = assembly.substring(tokenIndex, index) ;
        if (":)]}".includes( assembly.charAt(index) )) {
            res = res + assembly.charAt(index);
        }

        return res;
}


/*Places the pointer in the start of next token*/
function next_token()
{
        var assembly = code_assembly ;
        var index    = tokenIndex;

        // '..'
        if (assembly.charAt(index) == "'") {
            index++;
            while (assembly.charAt(index) != "'" && index < assembly.length) {
                  if (assembly.charAt(index) == "\n") nEnters++ ;
                  index++;
            }
            index++;
        }

        // ".."
        if (assembly.charAt(index) == '"') {
            index++;
            while (assembly.charAt(index) != '"' && index < assembly.length) {
                  if (assembly.charAt(index) == "\n") nEnters++ ;
                  index++;
            }
            index++;
        }

        // ([..
        if ("([{".includes( assembly.charAt(index) )) {
             index++;
        }

        while ((",()[]{}:#\t\n \r".includes( assembly.charAt(index) ) === false) && (index < assembly.length))
        {
             index++;
        }
        //if (assembly.charAt(index) == "\n") nEnters++ ;

        while ((",()[]{}:#\t\n \r".includes( assembly.charAt(index) )) && (index < assembly.length))
        {
          while (",)]}:\t\n \r".includes( assembly.charAt(index) ) && (index < assembly.length))
          {
             if (assembly.charAt(index) == "\n") nEnters++ ;
             index++;
          }

          if ("([{".includes( assembly.charAt(index) )) {
               break;
          }

          if (assembly.charAt(index) == '#')
          {
              while ((assembly.charAt(index) != '\n') && (index < assembly.length)) {
                    index++;
              }

              while (("()[]{}:\t\n \r".includes( assembly.charAt(index) )) && (index < assembly.length))
              {
                 if (assembly.charAt(index) == "\n") nEnters++ ;
                 index++;
              }
          }
        }

        tokenIndex = index;
}


/*Compile assembly code*/
function assembly_compiler()
{
  var ret = {
          errorcode: "",
          token: "",
          type: "",
          update: "",
          status: "ok"
        } ;

        /* Google Analytics */
        creator_ga('compile', 'compile.assembly');
        
        instructions = [];
        instructions_tag = [];
        tag_instructions = {};
        pending_instructions = [];
        pending_tags = [];
        data_tag = [];
        instructions_binary =[];
        creator_memory_clear() ;
        extern = [];
        data = [];
        execution_init = 1;

        pc = 4;

        nEnters = 0;

        if(update_binary.instructions_binary != null){
          for(var i = 0; i < update_binary.instructions_binary.length; i++){

            pc=pc+(architecture.instructions[i].nwords*4); //PRUEBA
            
            instructions.push(update_binary.instructions_binary[i]);
            if(i === 0){
              instructions[instructions.length-1].hide = false;
              if(update_binary.instructions_binary[i].globl === false){
                instructions[instructions.length-1].Label = "";
              }
            }
            else if(update_binary.instructions_binary[i].globl === false){
              instructions[instructions.length-1].Label = "";
              instructions[instructions.length-1].hide = true;
            }
            else if(update_binary.instructions_binary[i].globl == null){
              instructions[instructions.length-1].hide = true;
            }
            else{
              instructions[instructions.length-1].hide = false;
            }

            address = parseInt(instructions[instructions.length-1].Address, 16) + 4;
          }
        }
        else{
          address = parseInt(architecture.memory_layout[0].value);
        }

        var numBinaries = instructions.length;


        /*Allocation of memory addresses*/
        architecture.memory_layout[4].value = backup_stack_address;
        architecture.memory_layout[3].value = backup_data_address;
        data_address = parseInt(architecture.memory_layout[2].value);
        stack_address = parseInt(architecture.memory_layout[4].value);

        for (var i = 0; i < architecture.components.length; i++)
        {
          for (var j = 0; j < architecture.components[i].elements.length; j++)
          {
            if (architecture.components[i].elements[j].properties.includes("program_counter")) 
            {
              architecture.components[i].elements[j].value          = bi_intToBigInt(address,10) ;
              architecture.components[i].elements[j].default_value  = bi_intToBigInt(address,10) ;
            }
            if (architecture.components[i].elements[j].properties.includes("stack_pointer"))
            {
              architecture.components[i].elements[j].value         = bi_intToBigInt(stack_address,10) ;
              architecture.components[i].elements[j].default_value = bi_intToBigInt(stack_address,10) ;
            }
          }
        }

        /*architecture.components[1].elements[29].value = bi_intToBigInt(stack_address,10) ;
        architecture.components[0].elements[0].value  = bi_intToBigInt(address,10) ;
        architecture.components[1].elements[29].default_value = bi_intToBigInt(stack_address,10) ;
        architecture.components[0].elements[0].default_value  = bi_intToBigInt(address,10) ;*/

        /*Reset stats*/
        totalStats = 0;
        for (var i = 0; i < stats.length; i++){
          stats[i].percentage = 0;
          stats[i].number_instructions = 0;
          stats_value[i] = 0;
        }

        align = 1;
        var empty = false;

        /*Start of compilation*/
        first_token();
        if (get_token() == null) {
          return packCompileError('m0', 'Please enter the assembly code before compiling', 'warning', 'danger') ;
        }

        token = get_token();
        console_log(token)

        while(!empty)
        {
          token = get_token();
          console_log(token)

          if(token == null){
            empty = true;
            break;
          }

          var change = false;

          for (var i = 0; i < architecture.directives.length; i++)
          {
            if (token == architecture.directives[i].name)
            {
              switch(architecture.directives[i].action)
              {
                case "data_segment":
                  console_log("data_segment");
                  ret = data_segment_compiler();
                  if (ret.status == "ok") {
                      change = true;
                  }
                  if (ret.status != "ok")
                  {
                    instructions = [];
                    pending_instructions = [];
                    pending_tags = [];
                    data_tag = [];
                    instructions_binary = [];
                    data = [];
                    extern = [];
                    creator_memory_clear() ;

                    return ret;
                  }
                  break;

                case "code_segment":
                  console_log("code_segment") ;
                  ret = code_segment_compiler();
                  if (ret.status == "ok") {
                      change = true;
                  }
                  if (ret.status != "ok")
                  {
                    instructions = [];
                    pending_instructions = [];
                    pending_tags = [];
                    data_tag = [];
                    instructions_binary = [];
                    extern = [];
                    data = [];
                    creator_memory_clear() ;

                    return ret;
                  }
                  break;

                case "global_symbol":
                  var isGlobl = true;
                  next_token();

                  while(isGlobl){
                    token = get_token();

                    re = new RegExp(",", "g");
                    token = token.replace(re, "");
                    console_log("token: " + token)

                    extern.push(token);
                    change = true;

                    next_token();
                    token = get_token();
                    console_log("token: " + token);

                    for(var z = 0; z < architecture.directives.length; z++){
                      if(token == architecture.directives[z].name || token == null || token.search(/\:$/) != -1){
                        isGlobl = false;
                      }
                    }
                  }
                  break;

                default:
                  console_log("default") ;
                  empty = true;
                  break;
              }
            }

            else if (i== architecture.directives.length-1 && token != architecture.directives[i].name && change === false && token != null)
            {
              empty = true;
              //tokenIndex = 0;
              //nEnters = 0 ;
              return packCompileError('m14', token, 'error', "danger");
            }
          }
        }

        var found = false;

        if(update_binary.instructions_binary != null){
          for(var j = 0; j<instructions.length; j++){
            if(instructions[j].Label != ""){
              for(var i = 0; i<update_binary.instructions_tag.length; i++){
                if(instructions[j].Label == update_binary.instructions_tag[i].tag){
                  update_binary.instructions_tag[i].addr = instructions[j].Address;
                }
              }
            }
          }
        }


        /*Check pending instructions*/
        for (var i = 0; i < pending_instructions.length; i++)
        {
          var exit = 0;
          var signatureParts    = pending_instructions[i].signature;
          var signatureRawParts = pending_instructions[i].signatureRaw;
          var instructionParts  = (pending_instructions[i].instruction).split(' ');
          console_log(instructionParts);

          for (var j = 0; j < signatureParts.length && exit === 0; j++)
          {
            if (signatureParts[j] == "inm-signed" || signatureParts[j] == "inm-unsigned" || signatureParts[j] == "address")
            {
              for (var z = 0; z < instructions.length && exit === 0; z++)
              {
                if (instructions[z].Label == instructionParts[j])
                {
                  var addr = instructions[z].Address;
                  var bin  = parseInt(addr, 16).toString(2);
                  var startbit = pending_instructions[i].startBit;
                  var stopbit  = pending_instructions[i].stopBit;
                  var fieldsLength = startbit - stopbit + 1;

                  //Error
                  if (bin.length > fieldsLength) {
                    nEnters=pending_instructions[i].line;
                    return packCompileError('m8', signatureRawParts[j], 'error', "danger") ;
                  }

                  instructionParts[j] = addr;
                  var newInstruction  = "";
                  for (var w=0; w < instructionParts.length; w++)
                  {
                    newInstruction = newInstruction + instructionParts[w];
                    if (w != instructionParts.length-1) {
                        newInstruction = newInstruction + " ";
                    }
                  }

                  for (var w=0; w < instructions.length && exit === 0; w++)
                  {
                    var aux = "0x" + (pending_instructions[i].address).toString(16);
                    if (aux == instructions[w].Address) {
                      instructions[w].loaded = newInstruction;
                    }
                  }

                  for (var w=0; w < instructions.length && exit === 0; w++)
                  {
                    var aux = "0x" + (pending_instructions[i].address).toString(16);
                    if (aux == instructions[w].Address)
                    {
                      instructions[w].loaded = newInstruction;
                      console_log(w)
                      console_log(numBinaries)
                      console_log(w - numBinaries)
                      var iload =  instructions_binary[w - numBinaries].loaded;
                      instructions_binary[w - numBinaries].loaded = iload.substring(0, iload.length - (startbit + 1)) + bin.padStart(fieldsLength, "0") + iload.substring(iload.length - stopbit, iload.length);
                      exit = 1;
                    }
                  }
                }
              }


              // NEW
              var ret1 = creator_memory_findaddress_bytag(instructionParts[j]);
              if (ret1.exit === 1)
              {
                var addr = ret1.value;
                var bin  = parseInt(addr, 16).toString(2);
                var startbit = pending_instructions[i].startBit;
                var stopbit  = pending_instructions[i].stopBit;
                var fieldsLength = startbit - stopbit + 1;

                //Error
                if (bin.length > fieldsLength) {
                  nEnters=pending_instructions[i].line;
                  return packCompileError('m8', instructionParts[j], 'error', "danger") ;
                }


                instructionParts[j] = "0x" + addr.toString(16);
                var newInstruction = "";
                for (var w=0; w < instructionParts.length; w++)
                {
                  newInstruction = newInstruction + instructionParts[w];
                  if (w != instructionParts.length-1){
                    newInstruction = newInstruction + " ";
                  }
                }
                for (var w=0; w < instructions.length; w++)
                {
                  var aux = "0x" + (pending_instructions[i].address).toString(16);
                  if (aux == instructions[w].Address) {
                    instructions[w].loaded = newInstruction;
                  }
                }

                for (var w=0; w < instructions.length && exit === 0; w++)
                {
                  var aux = "0x" + (pending_instructions[i].address).toString(16);
                  if (aux == instructions[w].Address)
                  {
                    instructions[w].loaded = newInstruction;
                    var fieldsLength = startbit - stopbit + 1;
                    var iload        = instructions_binary[w - numBinaries].loaded;
                    instructions_binary[w - numBinaries].loaded = iload.substring(0, iload.length - (startbit + 1)) + bin.padStart(fieldsLength, "0") + iload.substring(iload.length - stopbit, iload.length);
                    exit = 1;
                  }
                }
              }

              if (exit === 0 && isNaN(instructionParts[j]) === true)
              {
                //tokenIndex = 0;
                //nEnters = 0 ;
                //tokenIndex=pending_instructions[i].line;
                nEnters=pending_instructions[i].line;
                instructions = [];
                pending_instructions = [];
                pending_tags = [];
                data_tag = [];
                instructions_binary = [];
                creator_memory_clear() ;
                data = [];
                extern = [];
                return packCompileError('m7', instructionParts[j], "error", "danger");
              }
            }

            if (signatureParts[j] == "offset_words")
            {
              for (var z = 0; z < instructions.length && exit === 0; z++)
              {
                if(instructions[z].Label == instructionParts[j])
                {
                  var addr = instructions[z].Address;
                  var startbit = pending_instructions[i].startBit;
                  var stopbit = pending_instructions[i].stopBit;

                  addr = ((addr - pending_instructions[i].address)/4)-1;

                  if (startbit.length > 1 && stopbit.length)
                  {
                    var fieldsLength = 0;
                    for (var s = 0; s < startbit.length; s++) {
                      fieldsLength = fieldsLength + startbit[s]-stopbit[s]+1;
                    }

                    var bin = bi_intToBigInt(addr,10).toString(2);
                    bin = bin.padStart(fieldsLength, "0");
                    bin = bin.slice((bin.length - fieldsLength), bin.length);

                    var last_segment = 0;
                    for (var s = 0; s < startbit.length; s++)
                    {
                      var starbit_aux = 31 - startbit[s]; //TODO: using nwords
                      var stopbit_aux = 32 - stopbit[s]; //TODO: using nwords

                      var fieldsLength2 = stopbit_aux - starbit_aux;
                      var bin_aux = bin.substring(last_segment, fieldsLength2 + last_segment);

                      last_segment = last_segment + fieldsLength2

                      for (var w = 0; w < instructions.length && exit === 0; w++) {
                        var aux = "0x" + (pending_instructions[i].address).toString(16);
                        if(aux == instructions[w].Address){
                          instructions_binary[w - numBinaries].loaded = instructions_binary[w - numBinaries].loaded.substring(0, instructions_binary[w - numBinaries].loaded.length - (startbit[s] + 1)) + bin_aux + instructions_binary[w - numBinaries].loaded.substring(instructions_binary[w - numBinaries].loaded.length - stopbit[s], instructions_binary[w - numBinaries].loaded.length);
                        }
                      }
                    }
                  }
                  else
                  {
                    var fieldsLength = (startbit-stopbit)+1;
                    console_log(fieldsLength);
                    var bin = bi_intToBigInt(addr,10).toString(2);
                    bin = bin.padStart(fieldsLength, "0");

                    for (var w = 0; w < instructions.length && exit === 0; w++) {
                      var aux = "0x" + (pending_instructions[i].address).toString(16);
                      if(aux == instructions[w].Address){
                        instructions_binary[w - numBinaries].loaded = instructions_binary[w - numBinaries].loaded.substring(0, instructions_binary[w - numBinaries].loaded.length - (startbit + 1)) + bin.padStart(fieldsLength, "0") + instructions_binary[w - numBinaries].loaded.substring(instructions_binary[w - numBinaries].loaded.length - stopbit, instructions_binary[w - numBinaries].loaded.length);
                      }
                    }
                  }

                  instructionParts[j] = addr;
                  var newInstruction = "";
                  for (var w = 0; w < instructionParts.length; w++) {
                    if(w == instructionParts.length-1){
                      newInstruction = newInstruction + instructionParts[w];
                    }
                    else{
                      newInstruction = newInstruction + instructionParts[w] + " ";
                    }
                  }

                  //Load new instruction
                  for (var w = 0; w < instructions.length && exit === 0; w++) {
                    var aux = "0x" + (pending_instructions[i].address).toString(16);
                    if(aux == instructions[w].Address){
                      instructions[w].loaded = newInstruction;
                      exit = 1;
                    }
                  }
                }
              }

              if(exit === 0){
                //tokenIndex = 0;
                //nEnters = 0 ;
                //tokenIndex=pending_instructions[i].line;
                nEnters=pending_instructions[i].line;
                instructions = [];
                pending_instructions = [];
                pending_tags = [];
                data_tag = [];
                instructions_binary = [];
                creator_memory_clear() ;
                data = [];
                extern = [];
                return packCompileError('m7', instructionParts[j], "error", "danger");
              }
            }

            if(signatureParts[j] == "offset_bytes"){
              for (var z = 0; z < instructions.length && exit === 0; z++){
                if(instructions[z].Label == instructionParts[j]){
                  var addr = instructions[z].Address;
                  var startbit = pending_instructions[i].startBit;
                  var stopbit = pending_instructions[i].stopBit;

                  var fieldsLength = (startbit-stopbit)+1;
                  var bin = bi_intToBigInt(addr,10).toString(2);
                  //bin = bin.substring((startbit-stopbit)+1,bin.length)
                  bin = bin.padStart(fieldsLength, "0");

                  instructionParts[j] = addr;
                  var newInstruction = "";
                  for (var w = 0; w < instructionParts.length; w++) {
                    if(w == instructionParts.length-1){
                      newInstruction = newInstruction + instructionParts[w];
                    }
                    else{
                      newInstruction = newInstruction + instructionParts[w] + " ";
                    }
                  }
                  for (var w = 0; w < instructions.length && exit == 0; w++) {
                    var aux = "0x" + (pending_instructions[i].address).toString(16);
                    if(aux == instructions[w].Address){
                      instructions[w].loaded = newInstruction;
                    }
                  }

                  for (var w = 0; w < instructions.length && exit == 0; w++) {
                    var aux = "0x" + (pending_instructions[i].address).toString(16);
                    if(aux == instructions[w].Address){
                      instructions[w].loaded = newInstruction;
                      var fieldsLength = startbit - stopbit + 1;
                      console_log(w)
                      console_log(numBinaries)
                      console_log(w - numBinaries)
                      instructions_binary[w - numBinaries].loaded = instructions_binary[w - numBinaries].loaded.substring(0, instructions_binary[w - numBinaries].loaded.length - (startbit + 1)) + bin.padStart(fieldsLength, "0") + instructions_binary[w - numBinaries].loaded.substring(instructions_binary[w - numBinaries].loaded.length - stopbit, instructions_binary[w - numBinaries].loaded.length);
                      exit = 1;
                    }
                  }
                }
              }

              if(exit == 0){
                //tokenIndex = 0;
                //nEnters = 0 ;
                //tokenIndex=pending_instructions[i].line;
                nEnters=pending_instructions[i].line;
                instructions = [];
                pending_instructions = [];
                pending_tags = [];
                data_tag = [];
                instructions_binary = [];
                creator_memory_clear() ;
                data = [];
                extern = [];
                return packCompileError('m7', instructionParts[j], "error", "danger");
              }
            }
          }
        }

        /* Enter the binary in the text segment */
        if (update_binary.instructions_binary != null)
        {
          for (var i = 0; i < update_binary.instructions_binary.length; i++)
          {
            var hex     = bin2hex(update_binary.instructions_binary[i].loaded);
            var auxAddr = parseInt(update_binary.instructions_binary[i].Address, 16);
            var label   = update_binary.instructions_binary[i].Label;
            var hide    = false ;

            if (i == 0) {
              hide = false;
              if(update_binary.instructions_binary[i].globl === false){
                label = "";
              }
            }
            else if(update_binary.instructions_binary[i].globl === false){
              hide  = true;
              label = "";
            }
            else if(update_binary.instructions_binary[i].globl == null){
              hide = true;
            }
            else {
              hide = false;
            }

            auxAddr = creator_insert_instruction(auxAddr, "********", "********", hide, hex, "**", label);
          }
        }

        /* Enter the compilated instructions in the text segment */
        for (var i = 0; i < instructions_binary.length; i++)
        {
          var hex = bin2hex(instructions_binary[i].loaded);
          var auxAddr = parseInt(instructions_binary[i].Address, 16);
          var label = instructions_binary[i].Label;
          var binNum = 0;

          if (update_binary.instructions_binary != null) {
              binNum = update_binary.instructions_binary.length
          }

          auxAddr = creator_insert_instruction(auxAddr, instructions[i + binNum].loaded, instructions[i + binNum].loaded, false, hex, "00", label);
        }


        // Check for overlap
/* 
 * TODO: migrate to new memory model
 *
        if (memory[memory_hash[0]].length > 0)
        {
          if (memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary[3].Addr > architecture.memory_layout[3].value) {
            //tokenIndex = 0;
            //nEnters = 0 ;
            instructions = [];
            pending_instructions = [];
            pending_tags = [];
            data_tag = [];
            instructions_binary = [];
            extern = [];
            creator_memory_clear() ;
            data = [];

            return packCompileError('m0', 'Data overflow', 'warning', "danger") ;
          }
        }

        if (memory[memory_hash[1]].length > 0)
        {
          if(memory[memory_hash[1]][memory[memory_hash[1]].length-1].Binary[3].Addr > architecture.memory_layout[1].value){
            //tokenIndex = 0;
            //nEnters = 0 ;
            instructions = [];
            pending_instructions = [];
            pending_tags = [];
            data_tag = [];
            instructions_binary = [];
            extern = [];
            creator_memory_clear() ;
            data = [];

            return packCompileError('m0', 'Instruction overflow', 'warning', "danger");
          }
        }
*/

        /*Save binary*/
        for(var i = 0; i < instructions_binary.length; i++){
          if(extern.length === 0 && instructions_binary[i].Label != ""){
            instructions_binary[i].Label = instructions_binary[i].Label + "_symbol";
            instructions_binary[i].globl = false;
          }
          else{
            for(var j = 0; j < extern.length; j++){
              if(instructions_binary[i].Label != extern[j] && j == extern.length-1 && instructions_binary[i].Label != ""){
                instructions_binary[i].Label = instructions_binary[i].Label + "_symbol";
                instructions_binary[i].globl = false;
                break;
              }
              else if(instructions_binary[i].Label == extern[j]){
                instructions_binary[i].globl = true;
                break;
              }
            }
          }
        }

        /*Save tags*/
        for(var i = 0; i < instructions_tag.length; i++){
          if(extern.length === 0 && instructions_tag[i].tag != ""){
            instructions_tag[i].tag = instructions_tag[i].tag + "_symbol";
            instructions_tag[i].globl = false;
            break;
          }
          else{
            for(var j = 0; j < extern.length; j++){
              if(instructions_tag[i].tag != extern[j] && j == extern.length-1 && instructions_tag[i].tag != ""){
                instructions_tag[i].tag = instructions_tag[i].tag + "_symbol";
                instructions_tag[i].globl = false;
                break;
              }
              else if(instructions_tag[i].tag == extern[j]){
                instructions_tag[i].globl = true;
                break;
              }
            }
          }
        }

        if (typeof app != "undefined")
            app._data.instructions = instructions;

        /* Initialize stack */
        writeMemory("00", parseInt(stack_address), "word") ;

        address = parseInt(architecture.memory_layout[0].value);
        data_address = parseInt(architecture.memory_layout[2].value);
        stack_address = parseInt(architecture.memory_layout[4].value);

  // save current value as default values for reset()...
        creator_memory_prereset() ;

        return ret;
}

/*Compile data segment*/
function data_segment_compiler()
{
  var ret = {
          errorcode: "",
          token: "",
          type: "",
          update: "",
          status: "ok"
        } ;

        var existsData = true;

        next_token();
        while(existsData)
        {
          token = get_token();
          console_log("token: " + token);

          var label = "";

          if (token == null){
              break;
          }

          var found = false;
          if (token.search(/\:$/) != -1)
          {
              if (token.length === 1)
              {
                  return packCompileError('m0', "Empty label", 'error', "danger");
              }

              for (var i = 0; i < data_tag.length; i++)
              {
                   console_log(data_tag[i].tag);
                   console_log(token.substring(0,token.length-1))
                   if (data_tag[i].tag == token.substring(0,token.length-1)) {
                       return packCompileError('m1', token.substring(0,token.length-1), 'error', "danger") ;
                   }
              }

              for (var i = 0; i < instructions.length; i++)
              {
                   if (instructions[i].Label == token.substring(0,token.length-1)) {
                       return packCompileError('m1', token.substring(0,token.length-1), 'error', "danger") ;
                   }
              }

              label = token.substring(0,token.length-1);
              next_token();
              token = get_token();
          }

          for (var j = 0; j < architecture.directives.length; j++)
          {
            if (token == architecture.directives[j].name)
            {
              switch (architecture.directives[j].action)
              {
                case "byte":
                  var isByte = true;

                  next_token();

                  while(isByte){
                    token = get_token();

                    if (token == null) {
                      return packCompileError('m23', "", 'error', "danger") ;
                    }

                    re = new RegExp("([0-9A-Fa-f-]),([0-9A-Fa-f-])");
                    if (token.search(re) != -1) {
                      return packCompileError('m24', token, 'error', "danger") ;
                    }

                    re = new RegExp(",", "g");
                    token = token.replace(re, "");

                    console_log("byte, " + token)

                    var auxToken;
                    var auxTokenString;

                    if (token.match(/^\'(.*?)\'$/))
                    {
                      var re = /^\'(.*?)\'$/;
                      console_log(re);
                      var match = re.exec(token);
                      console_log(match);
                      var asciiCode;

                      console_log(match[1]);

                      if(token.search(/^\'\\n\'$/) != -1){
                        asciiCode = 10;
                      }
                      else if(token.search(/^\'\\t\'$/) != -1){
                        asciiCode = 9;
                      }
                      else{
                        asciiCode = match[1].charCodeAt(0);
                      }

                      console_log(asciiCode);
                      auxTokenString = asciiCode.toString(16);
                    }
                    else if(token.match(/^0x/))
                    {
                      var value = token.split('x');

                      re = new RegExp("[0-9A-Fa-f]{"+value[1].length+"}","g");
                      if(value[1].search(re) == -1){
                        return packCompileError('m15', token, 'error', "danger") ;
                      }

                      auxTokenString = value[1].padStart(2*parseInt(architecture.directives[j].size), "0");
                      if(value[1].length === 0){
                        return packCompileError('m19', token, 'error', "danger") ;
                      }

                      if(auxTokenString.length > 2*parseInt(architecture.directives[j].size)){
                        return packCompileError('m18', token, 'error', "danger") ;
                      }
                      auxTokenString = auxTokenString.substring(auxTokenString.length-(2*parseInt(architecture.directives[j].size)), auxTokenString.length);
                    }
                    else
                    {
                      var re = new RegExp("[0-9-]{"+token.length+"}","g");
                      if (token.search(re) == -1) {
                        return packCompileError('m15', token, 'error', "danger") ;
                      }
                      auxToken = parseInt(token) >>> 0;
                      auxTokenString = (auxToken.toString(16).substring(auxToken.toString(16).length-2*parseInt(architecture.directives[j].size), auxToken.toString(16).length)).padStart(2*parseInt(architecture.directives[j].size), "0");
                      if (auxTokenString.length > 2*parseInt(architecture.directives[j].size)) {
                        return packCompileError('m18', token, 'error', "danger") ;
                      }
                      auxTokenString = auxTokenString.substring(auxTokenString.length-(2*parseInt(architecture.directives[j].size)), auxTokenString.length);
                    }

                    console_log(auxTokenString)

                    var r = creator_memory_data_compiler(data_address, auxTokenString, parseInt(architecture.directives[j].size), label, (parseInt(auxTokenString, 16) >> 0), "byte") ;
                    if (r.msg != "") {
                      return packCompileError(r.msg, "", 'error', "danger") ;
                    }

                    data_address = r.data_address ;
                    label = null;

                    console_log("byte Terminado");

                    next_token();
                    token = get_token();
                    console_log("token: " + token);

                    for (var z = 0; z < architecture.directives.length; z++) {
                      if (token == architecture.directives[z].name || token == null || token.search(/\:$/) != -1){
                        isByte = false;
                      }
                    }

                    align = 1;
                  }

                  j=0;

                  break;

                case "half_word":
                  console_log("half_word")
                  var ishalf = true;

                  next_token();
                  while(ishalf)
                  {
                    token = get_token();
                    if (token == null) {
                      return packCompileError('m23',"", 'error', "danger") ;
                    }

                    re = new RegExp("([0-9A-Fa-f-]),([0-9A-Fa-f-])");
                    if (token.search(re) != -1) {
                      return packCompileError('m24', token, 'error', "danger") ;
                    }

                    re = new RegExp(",", "g");
                    token = token.replace(re, "");

                    console_log("half_word, " + token);

                    var auxToken;
                    var auxTokenString;
                    if(token.match(/^0x/)){
                      var value = token.split('x');

                      re = new RegExp("[0-9A-Fa-f]{"+value[1].length+"}","g");
                      if (value[1].search(re) == -1) {
                        return packCompileError('m15', token, 'error', "danger") ;
                      }

                      auxTokenString = value[1].padStart(2*parseInt(architecture.directives[j].size), "0");

                      if (value[1].length === 0) {
                        return packCompileError('m19', token, 'error', "danger") ;
                      }
                      if (auxTokenString.length > 2*parseInt(architecture.directives[j].size)) {
                        return packCompileError('m18', token, 'error', "danger") ;
                      }
                      auxTokenString = auxTokenString.substring(auxTokenString.length-(2*parseInt(architecture.directives[j].size)), auxTokenString.length);
                    }
                    else{
                      var re = new RegExp("[0-9-]{"+token.length+"}","g");
                      if (token.search(re) == -1) {
                        return packCompileError('m15', token, 'error', "danger") ;
                      }
                      auxToken = parseInt(token) >>> 0;
                      auxTokenString = (auxToken.toString(16).substring(auxToken.toString(16).length-2*parseInt(architecture.directives[j].size), auxToken.toString(16).length)).padStart(2*parseInt(architecture.directives[j].size), "0");
                      if (auxTokenString.length > 2*parseInt(architecture.directives[j].size)) {
                        return packCompileError('m18', token, 'error', "danger") ;
                      }
                      auxTokenString = auxTokenString.substring(auxTokenString.length-(2*parseInt(architecture.directives[j].size)), auxTokenString.length);
                    }

                    console_log(auxTokenString)

                    var r = creator_memory_data_compiler(data_address, auxTokenString, parseInt(architecture.directives[j].size), label, (parseInt(auxTokenString, 16) >> 0), "half") ;
                    if (r.msg != "") {
                        return packCompileError(r.msg, "", 'error', "danger") ;
                    }

                    data_address = r.data_address ;
                    label = null;

                    console_log("half Terminado");

                    next_token();
                    token = get_token();
                    console_log("token: " + token);

                    for(var z = 0; z < architecture.directives.length; z++){
                      if(token == architecture.directives[z].name || token == null || token.search(/\:$/) != -1){
                        ishalf = false;
                      }
                    }

                    align = 1;
                  }

                  j=0;
                  break;

                case "word":
                  var isWord = true;
                  next_token();

                  while(isWord){
                    console_log("word")

                    token = get_token();
                    if (token == null) {
                      return packCompileError('m23', "", 'error', "danger") ;
                    }

                    re = new RegExp("([0-9A-Fa-f-]),([0-9A-Fa-f-])");
                    if (token.search(re) != -1) {
                      return packCompileError('m24', token, 'error', "danger") ;
                    }

                    re = new RegExp(",", "g");
                    token = token.replace(re, "");
                    console_log("token: " + token);

                    var auxToken;
                    var auxTokenString;
                    if(token.match(/^0x/)){
                      var value = token.split('x');

                      re = new RegExp("[0-9A-Fa-f]{"+value[1].length+"}","g");
                      if(value[1].search(re) == -1){
                        return packCompileError('m15', token, 'error', "danger") ;
                      }

                      auxTokenString = value[1].padStart(2*parseInt(architecture.directives[j].size), "0");
                      if(value[1].length == 0){
                        return packCompileError('m19', token, 'error', "danger") ;
                      }
                      if(auxTokenString.length > 2*parseInt(architecture.directives[j].size)){
                        return packCompileError('m18', token, 'error', "danger") ;
                      }
                      auxTokenString = auxTokenString.substring(auxTokenString.length-(2*parseInt(architecture.directives[j].size)), auxTokenString.length);
                    }
                    else{
                      var re = new RegExp("[0-9-]{"+token.length+"}","g");
                      if(token.search(re) == -1){
                        return packCompileError('m15', token, 'error', "danger") ;
                      }
                      auxToken = parseInt(token) >>> 0;
                      auxTokenString = (auxToken.toString(16).substring(auxToken.toString(16).length-2*parseInt(architecture.directives[j].size), auxToken.toString(16).length)).padStart(2*parseInt(architecture.directives[j].size), "0");
                      if(auxTokenString.length > 2*parseInt(architecture.directives[j].size)){
                        return packCompileError('m18', token, 'error', "danger") ;
                      }
                      auxTokenString = auxTokenString.substring(auxTokenString.length-(2*parseInt(architecture.directives[j].size)), auxTokenString.length);
                    }

                    console_log(auxTokenString);

                    var r = creator_memory_data_compiler(data_address, auxTokenString, parseInt(architecture.directives[j].size), label, (parseInt(auxTokenString, 16) >> 0), "word") ;
                    if (r.msg != "") {
                        return packCompileError(r.msg, "", 'error', "danger") ;
                    }

                    data_address = r.data_address ;
                    label = null;

                    console_log("word Terminado");

                    next_token();
                    token = get_token();
                    console_log("token: " + token);

                    for(var z = 0; z < architecture.directives.length; z++){
                      if(token == architecture.directives[z].name || token == null || token.search(/\:$/) != -1){

                        isWord = false;
                      }
                    }

                    align = 1;
                  }

                  j=0;
                  break;

                case "double_word":
                  var isDoubleWord = true;

                  next_token();

                  while(isDoubleWord){
                    console_log("word");

                    token = get_token();

                    if(token == null){
                      return packCompileError('m23', "", 'error', "danger") ;
                    }

                    re = new RegExp("([0-9A-Fa-f-]),([0-9A-Fa-f-])");
                    if(token.search(re) != -1){
                      return packCompileError('m24', token, 'error', "danger") ;
                    }

                    re = new RegExp(",", "g");
                    token = token.replace(re, "");
                    console_log("token: " + token);

                    var auxToken;
                    var auxTokenString;
                    if(token.match(/^0x/)){
                      var value = token.split('x');

                      re = new RegExp("[0-9A-Fa-f]{"+value[1].length+"}","g");
                      if(value[1].search(re) == -1){
                        return packCompileError('m15', token, 'error', "danger") ;
                      }

                      auxTokenString = value[1].padStart(2*parseInt(architecture.directives[j].size), "0");
                      if(value[1].length == 0){
                        return packCompileError('m19', token, 'error', "danger") ;
                      }
                      if(auxTokenString.length > 2*parseInt(architecture.directives[j].size)){
                        return packCompileError('m18', token, 'error', "danger") ;
                      }
                      auxTokenString = auxTokenString.substring(auxTokenString.length-(2*parseInt(architecture.directives[j].size)), auxTokenString.length);
                    }
                    else{
                      var re = new RegExp("[0-9-]{"+token.length+"}","g");
                      if(token.search(re) == -1){
                        return packCompileError('m15', token, 'error', "danger") ;
                      }
                      auxToken = parseInt(token) >>> 0;
                      auxTokenString = (auxToken.toString(16).substring(auxToken.toString(16).length-2*parseInt(architecture.directives[j].size), auxToken.toString(16).length)).padStart(2*parseInt(architecture.directives[j].size), "0");
                      if(auxTokenString.length > 2*parseInt(architecture.directives[j].size)){
                        return packCompileError('m18', token, 'error', "danger") ;
                      }
                      auxTokenString = auxTokenString.substring(auxTokenString.length-(2*parseInt(architecture.directives[j].size)), auxTokenString.length);
                    }

                    var r = creator_memory_data_compiler(data_address, auxTokenString, parseInt(architecture.directives[j].size), label, (parseInt(auxTokenString, 16) >> 0), "double_word") ;
                    if (r.msg != "") {
                        return packCompileError(r.msg, "", 'error', "danger") ;
                    }

                    data_address = r.data_address ;
                    label = null;

                    console_log("double word Terminado");

                    next_token();
                    token = get_token();
                    console_log("token: " + token);

                    for(var z = 0; z < architecture.directives.length; z++){
                      if(token == architecture.directives[z].name || token == null || token.search(/\:$/) != -1){
                        isDoubleWord = false;
                      }
                    }

                    align = 1;
                  }

                  j=0;
                  break;

                case "float":
                  var isFloat = true;

                  next_token();

                  while(isFloat){
                    console_log("float");

                    token = get_token();

                    if(token == null){
                      return packCompileError('m23', "", 'error', "danger") ;
                    }

                    re = new RegExp("([0-9A-Fa-f-]),([0-9A-Fa-f-])");
                    if(token.search(re) != -1){
                      return packCompileError('m24', token, 'error', "danger") ;
                    }

                    re = new RegExp(",", "g");
                    token = token.replace(re, "");
                    console_log("token: " + token);

                    var auxToken;
                    var auxTokenString;
                    if(token == "-Inf" || token == "-inf" || token == "-Infinity" || token == "-infinity")
                    {
                      token = "-Infinity";
                      auxTokenString = "FF800000";
                    }
                    else if(token == "Inf" || token == "+Inf" || token == "inf" || token == "+inf" || token == "Infinity" || token == "+Infinity" || token == "infinity" || token == "+infinity")
                    {
                      token = "+Infinity";
                      auxTokenString = "7F800000";
                    }
                    else if(token == "NaN" || token == "nan")
                    {
                      token = "NaN";
                      auxTokenString = "7FC00000";
                    }
                    else if(token.match(/^0x/))
                    {
                      var value = token.split('x');

                      re = new RegExp("[0-9A-Fa-f]{"+value[1].length+"}","g");
                      if(value[1].search(re) == -1){
                        return packCompileError('m15', token, 'error', "danger") ;
                      }

                      auxTokenString = value[1].padStart(2*parseInt(architecture.directives[j].size), "0");
                      if(value[1].length == 0){
                        return packCompileError('m19', token, 'error', "danger") ;
                      }
                      if(auxTokenString.length > 2*parseInt(architecture.directives[j].size)){
                        return packCompileError('m18', token, 'error', "danger") ;
                      }
                      auxTokenString = auxTokenString.substring(auxTokenString.length-(2*parseInt(architecture.directives[j].size)), auxTokenString.length);
                      token = hex2float(token);
                    }
                    else
                    {
                      var re = new RegExp("[\+e0-9.-]{"+token.length+"}","g");
                      if(token.search(re) == -1){
                        return packCompileError('m15', token, 'error', "danger") ;
                      }
                      auxToken = parseFloat(token, 10);
                      auxTokenString = (bin2hex(float2bin(auxToken))).padStart(2*parseInt(architecture.directives[j].size), "0");
                      if(auxTokenString.length > 2*parseInt(architecture.directives[j].size)){
                        return packCompileError('m18', token, 'error', "danger") ;
                      }
                      auxTokenString = auxTokenString.substring(auxTokenString.length-(2*parseInt(architecture.directives[j].size)), auxTokenString.length);
                    }

                    console_log(auxTokenString);

                    var r = creator_memory_data_compiler(data_address, auxTokenString, parseInt(architecture.directives[j].size), label, token, "float") ;
                    if (r.msg != "") {
                        return packCompileError(r.msg, "", 'error', "danger") ;
                    }

                    data_address = r.data_address ;
                    label = null;

                    console_log("float Terminado");

                    next_token();
                    token = get_token();
                    console_log("token: " + token);

                    for (var z = 0; z < architecture.directives.length; z++) {
                      if (token == architecture.directives[z].name || token == null || token.search(/\:$/) != -1){
                        isFloat = false;
                      }
                    }

                    align = 1;
                  }

                  j=0;
                  break;

                case "double":
                  var isDouble = true;

                  next_token();

                  while(isDouble){
                    console_log("double");

                    token = get_token();
                    if (token == null) {
                      return packCompileError('m23', "", 'error', "danger") ;
                    }

                    re = new RegExp("([0-9A-Fa-f-]),([0-9A-Fa-f-])");
                    if (token.search(re) != -1) {
                      return packCompileError('m24', token, 'error', "danger") ;
                    }

                    re = new RegExp(",", "g");
                    token = token.replace(re, "");
                    console_log("token: " + token);

                    var auxToken;
                    var auxTokenString;
                    if(token == "-Inf" || token == "-inf" || token == "-Infinity" || token == "-infinity"){
                      token = "-Infinity";
                      auxTokenString = "FFF0000000000000";
                    }
                    else if(token == "Inf" || token == "+Inf" || token == "inf" || token == "+inf" || token == "Infinity" || token == "+Infinity" || token == "infinity" || token == "+infinity"){
                      token = "+Infinity";
                      auxTokenString = "7FF0000000000000";
                    }
                    else if(token == "NaN" || token == "nan"){
                      token = "NaN";
                      auxTokenString = "7FF8000000000000";
                    }
                    else if(token.match(/^0x/)){
                      var value = token.split('x');

                      re = new RegExp("[0-9A-Fa-f]{"+value[1].length+"}","g");
                      if (value[1].search(re) == -1) {
                        return packCompileError('m15', token, 'error', "danger") ;
                      }

                      auxTokenString = value[1].padStart(2*parseInt(architecture.directives[j].size), "0");
                      if (value[1].length == 0) {
                        return packCompileError('m19', token, 'error', "danger") ;
                      }
                      if (auxTokenString.length > 2*parseInt(architecture.directives[j].size)) {
                        return packCompileError('m18', token, 'error', "danger") ;
                      }
                      auxTokenString = auxTokenString.substring(auxTokenString.length-(2*parseInt(architecture.directives[j].size)), auxTokenString.length);
                      token = hex2double(token);
                    }
                    else{
                      var re = new RegExp("[\+e0-9.-]{"+token.length+"}","g");
                      if (token.search(re) == -1) {
                        return packCompileError('m15', token, 'error', "danger") ;
                      }
                      auxToken = parseFloat(token, 10); console_log(auxTokenString);
                      auxTokenString = (bin2hex(double2bin(auxToken))).padStart(2*parseInt(architecture.directives[j].size), "0");
                      if (auxTokenString.length > 2*parseInt(architecture.directives[j].size)) {
                        return packCompileError('m18', token, 'error', "danger") ;
                      }
                      auxTokenString = auxTokenString.substring(auxTokenString.length-(2*parseInt(architecture.directives[j].size)), auxTokenString.length);
                    }

                    console_log(auxTokenString);

                    var r = creator_memory_data_compiler(data_address, auxTokenString, parseInt(architecture.directives[j].size), label, token, "double") ;
                    if (r.msg != "") {
                      return packCompileError(r.msg, "", 'error', "danger") ;
                    }

                    data_address = r.data_address ;
                    label = null;

                    console_log("double Terminado");

                    next_token();
                    token = get_token();
                    console_log("token: " + token);

                    for (var z = 0; z < architecture.directives.length; z++)
                    {
                      if (token == architecture.directives[z].name || token == null || token.search(/\:$/) != -1) {
                        isDouble = false;
                      }
                    }

                    align = 1;
                  }

                  j=0;
                  break;

                case "ascii_not_null_end":
                  console_log("ascii_not_null_end");

                  var isAscii = true;
                  var nextToken = 1;

                  next_token();
                  while(isAscii)
                  {
                    token = get_token();
                    console_log("token: " + token);

                    string = token;

                    re = new RegExp('^"');
                    if (string.search(re) != -1){
                      string = string.replace(re, "");
                      console_log(string);
                    }
                    else {
                      return packCompileError('m16', "", 'error', "danger") ;
                    }

                    re = new RegExp('"$');
                    if (string.search(re) != -1){
                      string = string.replace(re, "");
                      console_log(string);
                    }
                    else{
                      return packCompileError('m17', "", 'error', "danger") ;
                    }

                    if (token == null) {
                      break;
                    }

                    data_address = creator_memory_storestring(string, string.length, data_address, label, "ascii", align);

                    console_log("ascii_not_null_end Terminado");

                    if (nextToken === 1) {
                      next_token();
                      token = get_token();
                      console_log("token: " + token);
                    }

                    nextToken = 1;

                    for (var z = 0; z < architecture.directives.length; z++){
                      if (token == architecture.directives[z].name || token == null || token.search(/\:$/) != -1){
                        isAscii = false;
                      }
                    }

                    align = 1;
                  }

                  j=0;
                  break;

                case "ascii_null_end":
                  console_log("ascii_null_end");

                  var isAscii = true;
                  var nextToken = 1;

                  next_token();

                  while(isAscii)
                  {
                    console_log("ascii_null_end")

                    token = get_token();
                    console_log("token: " + token);

                    if (token == null) {
                      break;
                    }

                    string = token;

                    re = new RegExp('^"');
                    if(string.search(re) != -1){
                      string = string.replace(re, "");
                      console_log(string);
                    }
                    else{
                      return packCompileError('m16', "", 'error', "danger") ;
                    }
                    re = new RegExp('"$');
                    if(string.search(re) != -1){
                      string = string.replace(re, "");
                      console_log(string);
                    }
                    else{
                      return packCompileError('m17', "", 'error', "danger") ;
                    }

                    data_address = creator_memory_storestring(string, string.length, data_address, label, "asciiz", align) + 1;

                    console_log("ascii_null_end Terminado");

                    if (nextToken == 1) {
                      next_token();
                      token = get_token();
                      console_log("token: " + token);
                    }

                    nextToken = 1;

                    for (var z = 0; z < architecture.directives.length; z++){
                      if (token == architecture.directives[z].name || token == null || token.search(/\:$/) != -1){
                        isAscii = false;
                      }
                    }

                    align = 1;
                  }

                  j=0;
                  break;

                case "space":
                  console_log("space");

                  var string = "";

                  next_token();
                  token = get_token();
                  console_log("token: " + token);

                  if (token == null){
                    return packCompileError('m23', "", 'error', "danger") ;
                  }

                  var re = new RegExp("[0-9-]{"+token.length+"}","g");
                  if (token.search(re) == -1){
                    return packCompileError('m15', token, 'error', "danger") ;
                  }

                  if (parseInt(token) <= 0){
                    return packCompileError('m11', token, 'error', "danger") ;
                  }

                  if (parseInt(token) > 50*1024*1024){
                    return packCompileError('m10', token, 'error', "danger") ;
                  }

                  var size = parseInt(token) * parseInt(architecture.directives[j].size);
                  data_address = creator_memory_storestring(size, size, data_address, label, "space", align);

                  next_token();
                  token = get_token();
                  console_log("token: " + token);

                  align = 1;

                  console_log("space Terminado");

                  j=0;
                  break;

                case "align":
                case "balign":
                  console_log("[b]align");
                  let pow_mode = token == ".align";

                  next_token();
                  token = get_token();
                  console_log("token: " + token);

                  if (token == null){
                    return packCompileError('m23', "", 'error', "danger") ;
                  }

                  var re = new RegExp("[0-9-]{"+token.length+"}","g");
                  if (token.search(re) == -1){
                    return packCompileError('m15', token, 'error', "danger") ;
                  }

                  if (parseInt(token) < 0){
                    return packCompileError('m22', token, 'error', "danger") ;
                  }

                  align = pow_mode ? Math.pow(2, parseInt(token)) : token;
                  console_log(align);

                  next_token();
                  token = get_token();
                  console_log("token: " + token);

                  console_log("align Terminado");
                  
                  j=0;
                  break;

                default:
                  console_log("Default");
                  existsData = false;
                  break;
              }
            }
            else if (j== architecture.directives.length-1 && token != architecture.directives[j].name && token != null && token.search(/\:$/) == -1)
            {
              creator_memory_prereset() ;
              return ret;
            }

          }
        }

        creator_memory_prereset() ;
        return ret;
}

/* Compile text segment */
function code_segment_compiler()
{
  var ret = {
          errorcode: "",
          token: "",
          type: "",
          update: "",
          status: "ok"
        } ;

        var existsInstruction = true;

        next_token();
        var instInit = tokenIndex;

        while(existsInstruction){
          token = get_token();

          for(var i = 0; i < architecture.directives.length; i++){
            if(token == architecture.directives[i].name && architecture.directives[i].action == "global_symbol"){
              next_token(); // .globl *main*
              next_token();
              token = get_token();
            }
            else if(token == architecture.directives[i].name){

              if (typeof app !== "undefined")
                  app._data.instructions = instructions;

              console_log("token: " + token);
              for(var i = 0; i < instructions.length; i++){
                if(instructions[i].Label != ""){
                  instructions_tag.push({tag: instructions[i].Label, addr: parseInt(instructions[i].Address, 16)});
                  tag_instructions[parseInt(instructions[i].Address, 16)] = instructions[i].Label;
                }
              }

              return ret;
            }
          }

          var label = "";
          var validTagPC = true;

          if(token == null){
            break;
          }

          console_log("token: " + token);

          var found = false;
          var end = false;

          if (token.search(/\:$/) != -1)
          {
              if (token.length === 1){
                  return packCompileError('m0', "Empty label", 'error', "danger") ;
              }

        var ret1 = creator_memory_findaddress_bytag(token.substring(0, token.length-1));
        if (ret1.exit == 1)
        {
                  return packCompileError('m1', token.substring(0,token.length-1), 'error', "danger") ;
        }

              for (var i = 0; i < instructions.length; i++) {
                   if (instructions[i].Label == token.substring(0,token.length-1)) {
                       return packCompileError('m1', token.substring(0,token.length-1), 'error', "danger") ;
                   }
              }

              label = token.substring(0,token.length-1);
              next_token();
              instInit = tokenIndex;
              token = get_token();

              if (token != null)
        {
                  var re = new RegExp(",+$");
                  token = token.replace(re, "");
              }
              else
        {
                  var instIndex;
                  for (var i = 0; i < architecture.instructions.length; i++) {
                    if (architecture.instructions[i].name == "nop") {
                        instIndex = i;
                    }
                  }
                  instruction_compiler("nop", "nop", label, tokenIndex, false, 0, instInit, instIndex, false);
                  end = true;
                  found = true;
              }
          }

          var re = new RegExp(",+$");

          if(token != null){
            token = token.replace(re, "");
            console_log("token: " + token)
            var stopFor = false;
          }


          for(var i = 0; i < architecture.instructions.length && stopFor === false && end === false; i++){
            if(architecture.instructions[i].name != token){
              continue;
            }

            else{
              var instruction = "";
              var userInstruction = "";

              var numFields = 0;
              found = true;

              for (var j = 0; j < architecture.instructions[i].fields.length; j++){
                if(architecture.instructions[i].fields[j].type != "cop"){
                  numFields++;
                }
              }
              console_log(numFields);

              instruction = instruction + token;
              userInstruction = userInstruction + token;

              //var new_ins = 0;

              for (var j = 0; j < numFields - 1; j++){
                next_token();
                token = get_token();
                console_log("token: " + token);

                if(token != null){
                  var re = new RegExp(",+$");
                  token = token.replace(re, "");
                  instruction = instruction + " " + token;
                  userInstruction = userInstruction + " " + token;
                }
              }

              console_log(instruction);
              console_log(label);

              ret = instruction_compiler(instruction, userInstruction, label, tokenIndex, false, 0, instInit, i, false);
              if (ret.status != 'ok'){
                  return ret ;
              }

              next_token();
              instInit = tokenIndex; //PRUEBA
              stopFor = true;
            }
          }

          if(!found){
            var resultPseudo = -3;
            var instruction = "";
            var numToken = 0;
            var exists = false;
            var inst = token;

            console_log("token: " + token)

            for (var i = 0; i < architecture.pseudoinstructions.length && exists === false; i++){
              if(architecture.pseudoinstructions[i].name == token){
                numToken = architecture.pseudoinstructions[i].fields.length;
                console_log(numToken)
                exists = true;
                instruction = instruction + token;

                for (var i = 0; i < numToken; i++){
                  next_token();
                  token = get_token();

                  if(token != null){
                    var re = new RegExp(",+$");
                    token = token.replace(re, "");
                  }

                  instruction = instruction + " " + token;
                }
                resultPseudo = pseudoinstruction_compiler(instruction, label, tokenIndex);
                console_log(resultPseudo);

                if (resultPseudo.status != 'ok') {
                  return resultPseudo;
                }
              }
            }

            //TODO: revisar funcionamiento
            if(resultPseudo == -3){
              for (var i = 0; i < architecture.components.length; i++){
                for (var j = 0; j < architecture.components[i].elements.length; j++){
                  var re = new RegExp(architecture.components[i].elements[j].name.join('|')); //TODO: check

                  if(token.search(re) != -1){
                    existsInstruction = false;
                    //tokenIndex = 0;
                    //nEnters = 0 ;
                    instructions = [];
                    pending_instructions = [];
                    pending_tags = [];
                    data_tag = [];
                    instructions_binary = [];
                    extern = [];
                    creator_memory_clear() ;
                    data = [];
                 // ret = packCompileError('m26', (textarea_assembly_editor.posFromIndex(tokenIndex).line) + 1,
                 //                        'error', "danger") ;
                    ret = packCompileError('m26', nEnters+1, 'error', "danger") ;

                    return ret;
                  }
                }
              }



              existsInstruction = false;
              //tokenIndex = 0;
              //nEnters = 0 ;
              instructions = [];
              pending_instructions = [];
              pending_tags = [];
              data_tag = [];
              instructions_binary = [];
              extern = [];
              creator_memory_clear() ;
              data = [];

              ret = packCompileError('m2', token, 'error', "danger");
              return ret;
            }

            if(resultPseudo == -2){


              existsInstruction = false;
              //tokenIndex = 0;
              //nEnters = 0 ;
              instructions = [];
              pending_instructions = [];
              pending_tags = [];
              data_tag = [];
              instructions_binary = [];
              extern = [];
              data = [];
              creator_memory_clear() ;

              //PRUEBA para dar error con mas detalle
              ret = packCompileError('m2', token, 'error', "danger");

              return ret;
            }

            if(resultPseudo == -1){
              existsInstruction = false;
              //tokenIndex = 0;
              //nEnters = 0 ;
              instructions = [];
              pending_instructions = [];
              pending_tags = [];
              data_tag = [];
              instructions_binary = [];
              extern = [];
              data = [];
              creator_memory_clear() ;
              ret = packCompileError('m24', "", 'error', "danger") ;
              return ret;
            }

            next_token();
            instInit = tokenIndex; //PRUEBA

          }
        }

        token = get_token();
        console_log("token: " + token);


        if (typeof app !== "undefined")
            app._data.instructions = instructions;

        for(var i = 0; i < instructions.length; i++){
          if(instructions[i].Label != ""){
            instructions_tag.push({tag: instructions[i].Label, addr: parseInt(instructions[i].Address, 16)});
            tag_instructions[parseInt(instructions[i].Address, 16)] = instructions[i].Label;
          }
        }

        return ret;
}

/* Compile instruction */
function instruction_compiler ( instruction, userInstruction, label, line, pending, pendingAddress, instInit, instIndex, isPseudo )
{
  var ret = {
          errorcode: "",
          token: "",
          type: "",
          update: "",
          status: "ok"
        } ;


  if(instIndex == null){
    instIndex = 0;
  }
  console_log(instruction);
  console_log(instIndex);
  var re = new RegExp("^ +");
  var oriInstruction = instruction.replace(re, "");

  re = new RegExp(" +", "g");
  oriInstruction = oriInstruction.replace(re, " ");

  var instructionParts = oriInstruction.split(' ');
  var validTagPC = true;
  var startBit;
  var stopBit;
  var resultPseudo = -3;

  console_log(label);
  console_log(line);

  var stopFor = false;

  for(var i = instIndex; i < architecture.instructions.length && stopFor === false; i++){
    if(architecture.instructions[i].name != instructionParts[0]){
      continue;
    }
    else{
      var auxSignature = architecture.instructions[i].signatureRaw;

      var tag = "";

      var binary = "";
      binary = binary.padStart(architecture.instructions[i].nwords * 32, "0");

      var instruction = architecture.instructions[i].signature_definition;
      var userInstruction = userInstruction;

      var signatureDef = architecture.instructions[i].signature_definition;
      signatureDef = signatureDef.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      re = new RegExp("[fF][0-9]+", "g");
      signatureDef = signatureDef.replace(re, "(.*?)");

      re = new RegExp(",", "g");
      var signature = architecture.instructions[i].signature.replace(re, " ");

      re = new RegExp(signatureDef+"$");
      var match = re.exec(signature);
      var signatureParts = [];
      for(var j = 1; j < match.length; j++){
        signatureParts.push(match[j]);
      }

      match = re.exec(architecture.instructions[i].signatureRaw);
      var signatureRawParts = [];
      for(var j = 1; j < match.length; j++){
        signatureRawParts.push(match[j]);
      }

      console_log(signatureParts);
      console_log(signatureRawParts);

      re = new RegExp(signatureDef+"$");
      console_log(re);
      if(oriInstruction.search(re) == -1){
        if(isPseudo === false){
          console_log(get_token())

          tokenIndex = instInit;
          token = get_token();

          console_log("token: " + token);
        }
        else{
          token = instructionParts[0];
        }

        var resultPseudo = null;
        var instruction = "";
        var numToken = 0;

        console_log("token: " + token)

        for(var i = i + 1; i < architecture.instructions.length; i++){
          if(architecture.instructions[i].name == token){

            var index = i;
            numToken = architecture.instructions[i].fields.length;
            instruction = instruction + token;

            for (var a = 1; a < numToken; a++){
              if(architecture.instructions[i].fields[a].type != "cop"){
                if(isPseudo === false){
                  next_token();
                  token = get_token();

                  if(token != null){
                    var re = new RegExp(",+$");
                    token = token.replace(re, "");
                  }
                }
                else{
                  token = instructionParts[a];
                }

                instruction = instruction + " " + token;
                console_log(instruction);
              }
            }
            if(isPseudo === false){
              ret = instruction_compiler(instruction, instruction, label, line, pending, pendingAddress, instInit, index, false);
            }
            else{
              ret = instruction_compiler(instruction, userInstruction, label, line, pending, pendingAddress, instInit, index, false);
            }
            return ret;
          }
        }




        for (var i = 0; i < architecture.pseudoinstructions.length; i++){
          if(architecture.pseudoinstructions[i].name == token){
            numToken = architecture.pseudoinstructions[i].fields.length;

            instruction = instruction + token;

            for (var i = 0; i < numToken; i++){
              next_token();
              token = get_token();

              if(token != null){
                var re = new RegExp(",+$");
                token = token.replace(re, "");
              }

              instruction = instruction + " " + token;
            }
            console_log(instruction);
            resultPseudo = pseudoinstruction_compiler(instruction, label, tokenIndex);

            console_log(resultPseudo)

            if (resultPseudo.status == 'ok') {
                return resultPseudo ;
            }
            if (resultPseudo.errorcode === 3) {
                return resultPseudo ;
            }
          }
        }
      }

      if (resultPseudo == null) {
          return packCompileError('m3', auxSignature, 'error', "danger") ;
      }

      console_log(oriInstruction);
      console_log(re)
      match = re.exec(oriInstruction);
      instructionParts = [];
      if (match != null) {
          for (var j = 1; j < match.length; j++) {
               instructionParts.push(match[j]);
          }
      }
      else {
        return packCompileError('m3', auxSignature, 'error', "danger") ;
      }

      console_log(instructionParts);

      //PRUEBA
      re = new RegExp("[fF][0-9]+");
      while(instruction.search(re) != -1){
        re = new RegExp("[fF]([0-9]+)");
        var match = re.exec(instruction);
        re = new RegExp("[fF][0-9]+");
        instruction = instruction.replace(re, "Field"+match[1]);
      }


      for(var j = 0; j < signatureParts.length; j++){
        console_log(signatureParts[j]);
        switch(signatureParts[j]) {
          case "INT-Reg":
            token = instructionParts[j];

            console_log("token: " + token);

            var validReg = false;

            for(var a = 0; a < architecture.instructions[i].fields.length; a++){
              if(architecture.instructions[i].fields[a].name == signatureRawParts[j]){
                for(var z = 0; z < architecture_hash.length; z++){
                  for(var w = 0; w < architecture.components[z].elements.length; w++){
                    if(architecture.components[z].elements[w].name.includes(token) !== false && architecture.components[z].type == "int_registers"){ //TODO:check
                      validReg = true;

                      fieldsLength = architecture.instructions[i].fields[a].startbit - architecture.instructions[i].fields[a].stopbit + 1;
                      var reg = w;

                      if (reg.toString(2).length > fieldsLength) {
                          return packCompileError('m12', token, 'error', "danger") ;
                      }

                      console_log(reg)
                      console_log((reg.toString(2)).padStart(fieldsLength, "0"))
                      console_log(binary)
                      console_log(binary.length)
                      console_log(architecture.instructions[i].fields[a].startbit + 1)
                      console_log(binary.length - (architecture.instructions[i].fields[a].startbit + 1))

                      binary = binary.substring(0, binary.length - (architecture.instructions[i].fields[a].startbit + 1)) + (reg.toString(2)).padStart(fieldsLength, "0") + binary.substring(binary.length - (architecture.instructions[i].fields[a].stopbit ), binary.length);

                      console_log(binary);

                      re = RegExp("Field[0-9]+");
                      instruction = instruction.replace(re, token);
                    }

                    else if(z == architecture_hash.length-1 && w == architecture.components[z].elements.length-1 && validReg === false){
                      return packCompileError('m4', token, 'error', "danger") ;
                    }
                  }
                }
              }
            }

            break;

          case "SFP-Reg":
            token = instructionParts[j];

            console_log("token: " + token);

            var validReg = false;
            var regNum = 0;

            for(var a = 0; a < architecture.instructions[i].fields.length; a++){
              if(architecture.instructions[i].fields[a].name == signatureRawParts[j]){
                for(var z = 0; z < architecture_hash.length; z++){
                  if (architecture.components[z].double_precision_type == "linked")
                  {
                    for(var w = 0; w < architecture.components[z].elements.length; w++){
                      if(architecture.components[z].elements[w].name.includes(token) !==false && architecture.components[z].type == "fp_registers" && architecture.components[z].double_precision === false){ //TODO:check
                        validReg = true;
                        regNum++;

                        fieldsLength = architecture.instructions[i].fields[a].startbit - architecture.instructions[i].fields[a].stopbit + 1;
                        var reg = w;

                        if(reg.toString(2).length > fieldsLength){

                          return packCompileError('m12', token, 'error', "danger") ;
                        }

                        binary = binary.substring(0, binary.length - (architecture.instructions[i].fields[a].startbit + 1)) + (reg.toString(2)).padStart(fieldsLength, "0") + binary.substring(binary.length - (architecture.instructions[i].fields[a].stopbit ), binary.length);
                        //re = RegExp("[fF][0-9]+");
                        re = RegExp("Field[0-9]+");
                        console_log(instruction);
                        instruction = instruction.replace(re, token);
                        console_log(instruction);
                      }
                      else if(z == architecture_hash.length-1 && w == architecture.components[z].elements.length-1 && validReg === false){
                        return packCompileError('m4', token, 'error', "danger") ;
                      }
                      if(architecture.components[z].type == "fp_registers" && architecture.components[z].double_precision === false){
                        regNum++;
                      }
                    }
                  }
                  else{
                    for(var w = 0; w < architecture.components[z].elements.length; w++){
                      if(architecture.components[z].elements[w].name.includes(token) !== false && architecture.components[z].type == "fp_registers"){ //TODO:check
                        validReg = true;
                        regNum++;

                        fieldsLength = architecture.instructions[i].fields[a].startbit - architecture.instructions[i].fields[a].stopbit + 1;
                        var reg = w;

                        if(reg.toString(2).length > fieldsLength){

                          return packCompileError('m12', token, 'error', "danger") ;
                        }

                        binary = binary.substring(0, binary.length - (architecture.instructions[i].fields[a].startbit + 1)) + (reg.toString(2)).padStart(fieldsLength, "0") + binary.substring(binary.length - (architecture.instructions[i].fields[a].stopbit ), binary.length);
                        //re = RegExp("[fF][0-9]+");
                        re = RegExp("Field[0-9]+");
                        console_log(instruction);
                        instruction = instruction.replace(re, token);
                        console_log(instruction);
                      }
                      else if(z == architecture_hash.length-1 && w == architecture.components[z].elements.length-1 && validReg === false){
                        return packCompileError('m4', token, 'error', "danger") ;
                      }
                      if(architecture.components[z].type == "fp_registers" && architecture.components[z].double_precision === false){
                        regNum++;
                      }
                    }
                  }
                }
              }
            }

            break;

          case "DFP-Reg":
            token = instructionParts[j];

            console_log("token: " + token);

            var validReg = false;
            var regNum = 0;

            for(var a = 0; a < architecture.instructions[i].fields.length; a++){
              if(architecture.instructions[i].fields[a].name == signatureRawParts[j]){
                for(var z = 0; z < architecture_hash.length; z++){
                  if (architecture.components[z].double_precision_type == "linked")
                  {
                    for(var w = 0; w < architecture.components[z].elements.length; w++){
                      if(architecture.components[z].elements[w].name.includes(token) !== false && architecture.components[z].type == "fp_registers" && architecture.components[z].double_precision === true){ //TODO:check
                        validReg = true;
                        regNum++;

                        fieldsLength = architecture.instructions[i].fields[a].startbit - architecture.instructions[i].fields[a].stopbit + 1;
                        var reg = w;

                        if(reg.toString(2).length > fieldsLength){

                          return packCompileError('m12', token, 'error', "danger") ;
                        }

                        binary = binary.substring(0, binary.length - (architecture.instructions[i].fields[a].startbit + 1)) + (reg.toString(2)).padStart(fieldsLength, "0") + binary.substring(binary.length - (architecture.instructions[i].fields[a].stopbit ), binary.length);
                        //re = RegExp("[fF][0-9]+");
                        re = RegExp("Field[0-9]+");
                        instruction = instruction.replace(re, token);
                      }
                      else if(z == architecture_hash.length-1 && w == architecture.components[z].elements.length-1 && validReg === false){
                        return packCompileError('m4', token, 'error', "danger") ;
                      }
                      if(architecture.components[z].type == "fp_registers" && architecture.components[z].double_precision === true){
                        regNum++;
                      }
                    }
                  }
                  else{
                    for(var w = 0; w < architecture.components[z].elements.length; w++){
                      if(architecture.components[z].elements[w].name.includes(token) !== false && architecture.components[z].type == "fp_registers"){ //TODO:check
                        validReg = true;
                        regNum++;

                        fieldsLength = architecture.instructions[i].fields[a].startbit - architecture.instructions[i].fields[a].stopbit + 1;
                        var reg = w;

                        if(reg.toString(2).length > fieldsLength){

                          return packCompileError('m12', token, 'error', "danger") ;
                        }

                        binary = binary.substring(0, binary.length - (architecture.instructions[i].fields[a].startbit + 1)) + (reg.toString(2)).padStart(fieldsLength, "0") + binary.substring(binary.length - (architecture.instructions[i].fields[a].stopbit ), binary.length);
                        //re = RegExp("[fF][0-9]+");
                        re = RegExp("Field[0-9]+");
                        instruction = instruction.replace(re, token);
                      }
                      else if(z == architecture_hash.length-1 && w == architecture.components[z].elements.length-1 && validReg === false){
                        return packCompileError('m4', token, 'error', "danger") ;
                      }
                      if(architecture.components[z].type == "fp_registers" && architecture.components[z].double_precision === true){
                        regNum++;
                      }
                    }
                  }
                }
              }
            }

            break;

          case "Ctrl-Reg":
            token = instructionParts[j];

            console_log("token: " + token)

            var validReg = false;
            var regNum = 0;

            for(var a = 0; a < architecture.instructions[i].fields.length; a++){
              if(architecture.instructions[i].fields[a].name == signatureRawParts[j]){
                for(var z = 0; z < architecture_hash.length; z++){
                  for(var w = 0; w < architecture.components[z].elements.length; w++){
                    if(architecture.components[z].elements[w].name.includes(token) !== false && architecture.components[z].type == "ctr_registers"){ //TODO: check
                      validReg = true;
                      regNum++;

                      fieldsLength = architecture.instructions[i].fields[a].startbit - architecture.instructions[i].fields[a].stopbit + 1;
                      var reg = w;

                      if(reg.toString(2).length > fieldsLength){

                        return packCompileError('m12', token, 'error', "danger") ;
                      }

                      binary = binary.substring(0, binary.length - (architecture.instructions[i].fields[a].startbit + 1)) + (reg.toString(2)).padStart(fieldsLength, "0") + binary.substring(binary.length - (architecture.instructions[i].fields[a].stopbit ), binary.length);
                      //re = RegExp("[fF][0-9]+");
                      re = RegExp("Field[0-9]+");
                      instruction = instruction.replace(re, token);
                    }
                    else if(z == architecture_hash.length-1 && w == architecture.components[z].elements.length-1 && validReg === false){
                      return packCompileError('m4', token, 'error', "danger") ;
                    }
                    if(architecture.components[z].type == "ctr_registers"){
                      regNum++;
                    }
                  }
                }
              }
            }

            break;

          case "inm-signed":
            token = instructionParts[j];
            var token_user = "";

            console_log("token: " + token);

            for(var a = 0; a < architecture.instructions[i].fields.length; a++){
              if(architecture.instructions[i].fields[a].name == signatureRawParts[j]){

                fieldsLength = getFieldLength(architecture.instructions[i].separated, architecture.instructions[i].fields[a].startbit, architecture.instructions[i].fields[a].stopbit, a);

                var inm;

                if(token.match(/^0x/)){
                  var value = token.split("x");
                  if(value[1].length*4 > fieldsLength){
                    resultPseudo = pseudoinstruction_compiler(oriInstruction, label, line);

                    console_log(resultPseudo);

                    if (resultPseudo.status != 'ok'){
                        return resultPseudo ;
                    }
                  }

                  if(isNaN(parseInt(token, 16)) === true){
                    return packCompileError('m6', token, 'error', "danger") ;
                  }

                  inm = (parseInt(token, 16)).toString(2);
                }
                else if (token.match(/^(\d)+\.(\d)+/)){
                  if(float2bin(parseFloat(token)).length > fieldsLength){
                    resultPseudo = pseudoinstruction_compiler(oriInstruction, label, line);

                    console_log(resultPseudo);

                    if (resultPseudo.status != 'ok'){
                        return resultPseudo ;
                    }
                  }

                  if (isNaN(parseFloat(token)) === true) {
                      return packCompileError('m6', token, 'error', "danger") ;
                  }

                  inm = float2bin(parseFloat(token, 16));
                }
                else if(token.match(/^\'(.*?)\'$/)){
                  var re = /^\'(.*?)\'$/;
                  console_log(re);
                  var match = re.exec(token);
                  console_log(match);
                  var asciiCode = match[1].charCodeAt(0);
                  console_log(asciiCode);

                  re = RegExp("Field[0-9]+");
                  instruction = instruction.replace(re, asciiCode);

                  inm = (asciiCode >>> 0).toString(2);
                }
                else if(isNaN(parseInt(token))){
                  validTagPC = false;
                  startBit = architecture.instructions[i].fields[a].startbit;
                  stopBit = architecture.instructions[i].fields[a].stopbit;
                }
                else {

                  var comNumPos = Math.pow(2, fieldsLength-1);
                  var comNumNeg = comNumPos * (-1);
                  comNumPos = comNumPos -1;

                  console_log(comNumPos);
                  console_log(comNumNeg);

                  if(parseInt(token, 10) > comNumPos || parseInt(token, 10) < comNumNeg){
                    console_log(oriInstruction)
                    console_log(label)
                    console_log(line)
                    resultPseudo = pseudoinstruction_compiler(oriInstruction, label, line);
                    console_log(resultPseudo);

                    if (resultPseudo.status != 'ok'){
                        return resultPseudo ;
                    }
                  }

                  if (isNaN(parseInt(token)) === true && resultPseudo == -3) {
                      return packCompileError('m6', token, 'error', "danger") ;
                  }

                  inm = (parseInt(token, 10) >>> 0).toString(2);
                  inm = inm.substring(inm.length - fieldsLength ,inm.length);
                }
                if(validTagPC === true){
                  console_log(inm.length);
                  if (inm.length > (architecture.instructions[i].fields[a].startbit - architecture.instructions[i].fields[a].stopbit + 1)) {

                      return packCompileError('m12', token, 'error', "danger") ;
                  }

                  binary = generateBinary(architecture.instructions[i].separated, architecture.instructions[i].fields[a].startbit,architecture.instructions[i].fields[a].stopbit,binary, inm,fieldsLength, a);
                }

                //re = RegExp("[fF][0-9]+");
                re = RegExp("Field[0-9]+");
                instruction = instruction.replace(re, token);
              }
            }

            break;

          case "inm-unsigned":
            token = instructionParts[j];
            var token_user = "";

            console_log("token: " + token);

            for(var a = 0; a < architecture.instructions[i].fields.length; a++){
              if(architecture.instructions[i].fields[a].name == signatureRawParts[j]){

                if (!architecture.instructions[i].separated || !architecture.instructions[i].separated[a])
                  fieldsLength = architecture.instructions[i].fields[a].startbit - architecture.instructions[i].fields[a].stopbit + 1;
                else {
                  fieldsLength = architecture.instructions[i].fields[a].startbit
                    .map((b, iii) => b - architecture.instructions[i].fields[a].stopbit[iii]+1)
                    .reduce((old, newV) => old+newV);
                }

                //fieldsLength = architecture.instructions[i].fields[a].startbit - architecture.instructions[i].fields[a].stopbit + 1;
                fieldsLength = getFieldLength(architecture.instructions[i].separated, architecture.instructions[i].fields[a].startbit, architecture.instructions[i].fields[a].stopbit, a);

                var inm;

                if(token.match(/^0x/)){
                  var value = token.split("x");
                  if (value[1].length*4 > fieldsLength)
                  {
                      resultPseudo = pseudoinstruction_compiler(oriInstruction, label, line);

                      console_log(resultPseudo);

                      if (resultPseudo.status != 'ok'){
                          return resultPseudo ;
                      }
                  }

                  if (isNaN(parseInt(token, 16)) === true) {
                      return packCompileError('m6', token, 'error', "danger") ;
                  }

                  inm = (parseInt(token, 16)).toString(2);
                }
                else if (token.match(/^(\d)+\.(\d)+/))
                {
                  if (float2bin(parseFloat(token)).length > fieldsLength) {
                      resultPseudo = pseudoinstruction_compiler(oriInstruction, label, line);
                      console_log(resultPseudo);
                      if (resultPseudo.status != 'ok') {
                          return resultPseudo ;
                      }
                  }

                  if (isNaN(parseFloat(token)) === true) {
                      return packCompileError('m6', token, 'error', "danger") ;
                  }

                  inm = float2bin(parseFloat(token, 16));
                }
                else if(token.match(/^\'(.*?)\'$/)) {
                  var re = /^\'(.*?)\'$/;
                  console_log(re);
                  var match = re.exec(token);
                  console_log(match);
                  var asciiCode = match[1].charCodeAt(0);
                  console_log(asciiCode);

                  re = RegExp("Field[0-9]+");
                  instruction = instruction.replace(re, asciiCode);

                  inm = (asciiCode >>> 0).toString(2);
                }
                else if(isNaN(parseInt(token))){
                  validTagPC = false;
                  startBit = architecture.instructions[i].fields[a].startbit;
                  stopBit = architecture.instructions[i].fields[a].stopbit;
                }
                else {

                  var comNumPos = Math.pow(2, fieldsLength);

                  console_log(comNumPos);

                  if(parseInt(token, 10) > comNumPos){
                    console_log(oriInstruction)
                    console_log(label)
                    console_log(line)
                    resultPseudo = pseudoinstruction_compiler(oriInstruction, label, line);
                    console_log(resultPseudo);
                    if (resultPseudo.status != 'ok') {
                        return resultPseudo ;
                    }
                  }

                  if (isNaN(parseInt(token)) === true && resultPseudo == -3) {
                      return packCompileError('m6', token, 'error', "danger") ;
                  }

                  inm = (parseInt(token, 10) >>> 0).toString(2);
                  inm = inm.substring(inm.length - fieldsLength ,inm.length);
                }
                if(validTagPC === true){
                  console_log(inm.length);
                  if (inm.length > (architecture.instructions[i].fields[a].startbit - architecture.instructions[i].fields[a].stopbit + 1)) {
                     return packCompileError('m12', token, 'error', "danger") ;
                  }

                  binary = generateBinary(architecture.instructions[i].separated, architecture.instructions[i].fields[a].startbit,architecture.instructions[i].fields[a].stopbit,binary, inm,fieldsLength, a);
                }

                //re = RegExp("[fF][0-9]+");
                re = RegExp("Field[0-9]+");
                instruction = instruction.replace(re, token);
              }
            }

            break;

          case "address":
            token = instructionParts[j];

            console_log("token: " + token)

            for(var a = 0; a < architecture.instructions[i].fields.length; a++){
              if(architecture.instructions[i].fields[a].name == signatureRawParts[j]){
                //aqui
                fieldsLength = getFieldLength(architecture.instructions[i].separated, architecture.instructions[i].fields[a].startbit, architecture.instructions[i].fields[a].stopbit, a);

                if(token.match(/^0x/)){
                  var value = token.split("x");

                  if (value[1].length*4 > fieldsLength) {
                     return packCompileError('m8', token, 'error', "danger") ;
                  }

                  if (isNaN(parseInt(token, 16)) === true) {
                      return packCompileError('m9', token, 'error', "danger") ;
                  }

                  addr = (parseInt(token, 16)).toString(2);
                  //binary = binary.substring(0, binary.length - (architecture.instructions[i].fields[a].startbit + 1)) + addr.padStart(fieldsLength, "0") + binary.substring(binary.length - (architecture.instructions[i].fields[a].stopbit ), binary.length);
                  binary = generateBinary(architecture.instructions[i].separated, architecture.instructions[i].fields[a].startbit,architecture.instructions[i].fields[a].stopbit,binary, inm,fieldsLength, a);
                  //re = RegExp("[fF][0-9]+");
                  re = RegExp("Field[0-9]+");
                  instruction = instruction.replace(re, token);
                }
                else{
                  var validTag = false;
                  startBit = architecture.instructions[i].fields[a].startbit;
                  stopBit = architecture.instructions[i].fields[a].stopbit;
                }
              }
            }

            break;

          case "offset_bytes":
            token = instructionParts[j];
            var token_user = "";

            console_log("token: " + token);

            for(var a = 0; a < architecture.instructions[i].fields.length; a++){
              if(architecture.instructions[i].fields[a].name == signatureRawParts[j]){
                  fieldsLength = getFieldLength(architecture.instructions[i].separated, architecture.instructions[i].fields[a].startbit, architecture.instructions[i].fields[a].stopbit, a);

                var inm;

                if(token.match(/^0x/))
                {
                   var value = token.split("x");
                   if (value[1].length*4 > fieldsLength)
                   {
                      resultPseudo = pseudoinstruction_compiler(oriInstruction, label, line);
                      console_log(resultPseudo);
                      if (resultPseudo.status != 'ok'){
                          return resultPseudo ;
                      }
                   }

                   if (isNaN(parseInt(token, 16)) === true) {
                       return packCompileError('m6', token, 'error', "danger") ;
                   }

                   inm = (parseInt(token, 16)).toString(2);
                }
                else if (token.match(/^(\d)+\.(\d)+/)){
                  if (float2bin(parseFloat(token)).length > fieldsLength)
                  {
                     resultPseudo = pseudoinstruction_compiler(oriInstruction, label, line);
                     console_log(resultPseudo);
                     if (resultPseudo.status != 'ok'){
                         return resultPseudo ;
                     }
                  }

                  if (isNaN(parseFloat(token)) === true) {
                      return packCompileError('m6', token, 'error', "danger") ;
                  }

                  inm = float2bin(parseFloat(token, 16));
                }
                else if(isNaN(parseInt(token))){
                  validTagPC = false;
                  startBit = architecture.instructions[i].fields[a].startbit;
                  stopBit = architecture.instructions[i].fields[a].stopbit;
                }
                else {

                  var comNumPos = Math.pow(2, fieldsLength-1);
                  var comNumNeg = comNumPos * (-1);
                  comNumPos = comNumPos -1;

                  console_log(comNumPos);
                  console_log(comNumNeg);

                  if (parseInt(token, 10) > comNumPos || parseInt(token, 10) < comNumNeg)
                  {
                      console_log(oriInstruction)
                      console_log(label)
                      console_log(line)
                      resultPseudo = pseudoinstruction_compiler(oriInstruction, label, line);
                      console_log(resultPseudo);
                      if (resultPseudo.status != 'ok') {
                          return resultPseudo ;
                      }
                   }

                  if (isNaN(parseInt(token)) === true && resultPseudo == -3) {
                     return packCompileError('m6', token, 'error', "danger") ;
                  }

                  inm = (parseInt(token, 10) >>> 0).toString(2);
                  inm = inm.substring(inm.length - fieldsLength ,inm.length);
                }
                if(validTagPC === true){
                  if(inm.length > (architecture.instructions[i].fields[a].startbit - architecture.instructions[i].fields[a].stopbit + 1)){
                    return packCompileError('m12', token, 'error', "danger") ;
                  }

                  //binary = binary.substring(0, binary.length - (architecture.instructions[i].fields[a].startbit + 1)) + inm.padStart(fieldsLength, "0") + binary.substring(binary.length - (architecture.instructions[i].fields[a].stopbit ), binary.length);
                  binary = generateBinary(architecture.instructions[i].separated, architecture.instructions[i].fields[a].startbit,architecture.instructions[i].fields[a].stopbit,binary, inm,fieldsLength, a);
                }

                //re = RegExp("[fF][0-9]+");
                re = RegExp("Field[0-9]+");
                console_log(instruction);
                instruction = instruction.replace(re, token);
                console_log(instruction);
              }
            }

            break;

          case "offset_words":
            token = instructionParts[j];
            var token_user = "";

            console_log("token: " + token);

            for(var a = 0; a < architecture.instructions[i].fields.length; a++){
              if(architecture.instructions[i].fields[a].name == signatureRawParts[j]){
                fieldsLength = getFieldLength(architecture.instructions[i].separated, architecture.instructions[i].fields[a].startbit, architecture.instructions[i].fields[a].stopbit, a);

                var inm;

                if(token.match(/^0x/)){
                  var value = token.split("x");
                  if (value[1].length*4 > fieldsLength)
                  {
                     resultPseudo = pseudoinstruction_compiler(oriInstruction, label, line);
                     console_log(resultPseudo);
                     if (resultPseudo.status != 'ok'){
                         return resultPseudo ;
                     }
                  }

                  if (isNaN(parseInt(token, 16)) === true) {
                     return packCompileError('m6', token, 'error', "danger") ;
                  }

                  inm = (parseInt(token, 16)).toString(2);
                }
                else if (token.match(/^(\d)+\.(\d)+/)){
                  if (float2bin(parseFloat(token)).length > fieldsLength)
                  {
                     resultPseudo = pseudoinstruction_compiler(oriInstruction, label, line);
                     console_log(resultPseudo);
                     if (resultPseudo.status != 'ok'){
                         return resultPseudo ;
                     }
                  }

                  if (isNaN(parseFloat(token)) === true) {
                      return packCompileError('m6', token, 'error', "danger") ;
                  }

                  inm = float2bin(parseFloat(token, 16));
                }
                else if(isNaN(parseInt(token))){
                  validTagPC = false;
                  startBit = architecture.instructions[i].fields[a].startbit;
                  stopBit = architecture.instructions[i].fields[a].stopbit;
                }
                else{

                  var comNumPos = Math.pow(2, fieldsLength-1);
                  var comNumNeg = comNumPos * (-1);
                  comNumPos = comNumPos -1;

                  console_log(comNumPos);
                  console_log(comNumNeg);

                  if (parseInt(token, 10) > comNumPos || parseInt(token, 10) < comNumNeg)
                  {
                      console_log(oriInstruction)
                      console_log(label)
                      console_log(line)
                      resultPseudo = pseudoinstruction_compiler(oriInstruction, label, line);
                      console_log(resultPseudo);
                      if (resultPseudo.status != 'ok'){
                          return resultPseudo ;
                      }
                  }

                  if (isNaN(parseInt(token)) === true && resultPseudo == -3) {
                      return packCompileError('m6', token, 'error', "danger") ;
                  }

                  inm = (parseInt(token, 10) >>> 0).toString(2);
                  inm = inm.substring(inm.length - fieldsLength ,inm.length);

                }
                if(validTagPC === true){
                  if(inm.length > (architecture.instructions[i].fields[a].startbit - architecture.instructions[i].fields[a].stopbit + 1)){
                      return packCompileError('m12', token, 'error', "danger") ;
                  }
                  //binary = binary.substring(0, binary.length - (architecture.instructions[i].fields[a].startbit + 1)) + inm.padStart(fieldsLength, "0") + binary.substring(binary.length - (architecture.instructions[i].fields[a].stopbit ), binary.length);
                  binary = generateBinary(architecture.instructions[i].separated, architecture.instructions[i].fields[a].startbit,architecture.instructions[i].fields[a].stopbit,binary, inm,fieldsLength, a);
                }

                //re = RegExp("[fF][0-9]+");
                re = RegExp("Field[0-9]+");
                console_log(instruction);
                instruction = instruction.replace(re, token);
                console_log(instruction);
              }
            }

            break;

          default:
            token = instructionParts[j];

            console_log("token: " + token);

            for(var a = 0; a < architecture.instructions[i].fields.length; a++){
              console_log(architecture.instructions[i].fields[a].name);
              if(architecture.instructions[i].fields[a].name == signatureRawParts[j]){
                // Si el co es un array hay que separarlo
                /**/
                if (typeof(architecture.instructions[i].fields[a].startbit) == 'object') {
                    fieldsLength = architecture.instructions[i].fields[a].startbit.reduce((t, cv, ind) => {
                      t = !ind ? 0 : t;
                      t+(cv-architecture.instructions[i].fields[a].stopbit[ind]+1)
                    });
                    console_log(architecture.instructions[i].co.join("").padStart(fieldsLength, "0"));
                    // aqui_ahora
                } else {
                  fieldsLength = architecture.instructions[i].fields[a].startbit - architecture.instructions[i].fields[a].stopbit + 1;
                  console_log((architecture.instructions[i].co).padStart(fieldsLength, "0"));
                  binary = binary.substring(0, binary.length - (architecture.instructions[i].fields[a].startbit + 1)) + (architecture.instructions[i].co).padStart(fieldsLength, "0") + binary.substring(binary.length - (architecture.instructions[i].fields[a].stopbit), binary.length);
                }

                console_log(binary);

                //re = RegExp("[fF][0-9]+");
                re = RegExp("Field[0-9]+");
                console_log(instruction);
                instruction = instruction.replace(re, token);
                console_log(instruction);
              }
              if(architecture.instructions[i].fields[a].type == "cop"){
                fieldsLength = architecture.instructions[i].fields[a].startbit - architecture.instructions[i].fields[a].stopbit + 1;

                binary = binary.substring(0, binary.length - (architecture.instructions[i].fields[a].startbit + 1)) + (architecture.instructions[i].fields[a].valueField).padStart(fieldsLength, "0") + binary.substring(binary.length - (architecture.instructions[i].fields[a].stopbit ), binary.length);
              }
            }

          break;
        }
      }

      if(validTagPC === false && resultPseudo == -3){
        console_log("pendiente");


        pc=pc+(architecture.instructions[i].nwords*4); //PRUEBA



        var padding = "";
        padding = padding.padStart((architecture.instructions[i].nwords*32)-(binary.length), "0");
        binary = binary + padding;

        var hex = bin2hex(binary);
        var auxAddr = address;

        console_log(binary);
        console_log(bin2hex(binary));

        pending_instructions.push({address: address, instruction: instruction, signature: signatureParts, signatureRaw: signatureRawParts, Label: label, binary: binary, startBit: startBit, stopBit: stopBit, visible: true, line: nEnters});

        if(pending === false){
          instructions.push({ Break: null, Address: "0x" + address.toString(16), Label: label , loaded: instruction, user: userInstruction, _rowVariant: '', visible: true, hide: false});
          instructions_binary.push({ Break: null, Address: "0x" + address.toString(16), Label: label , loaded: binary, user: null, _rowVariant: '', visible: false});

          address = address + (4*architecture.instructions[i].nwords);
        }
        else{
          for(var pos = 0; pos < instructions.length; pos++){
            if(parseInt(instructions[pos].Address, 16) > pendingAddress){
              instructions.splice(pos, 0, { Break: null, Address: "0x" + pendingAddress.toString(16), Label: label , loaded: instruction, user: userInstruction, _rowVariant: '', visible: true, hide: false});
              instructions_binary.splice(pos, 0, { Break: null, Address: "0x" + pendingAddress.toString(16), Label: label , loaded: binary, user: null, _rowVariant: '', visible: false});

              auxAddr = pendingAddress;
              break;
            }
          }
        }

        console_log(address.toString(16));
        console_log(instructions);

        stopFor = true;
        break;
      }

      else{
        if(resultPseudo == -3){
          console_log("no pendiente");


          pc=pc+(architecture.instructions[i].nwords*4); //Prueba


          var padding = "";
          padding = padding.padStart((architecture.instructions[i].nwords*32)-(binary.length), "0");

          binary = binary + padding;
          var hex = bin2hex(binary);
          var auxAddr = address;

          console_log(binary);
          console_log(bin2hex(binary));

          if(pending === false){
            instructions.push({ Break: null, Address: "0x" + address.toString(16), Label: label , loaded: instruction, user: userInstruction, _rowVariant: '', visible: true, hide: false});
            instructions_binary.push({ Break: null, Address: "0x" + address.toString(16), Label: label , loaded: binary, user: null, _rowVariant: '', visible: false});

            address = address + (4*architecture.instructions[i].nwords);
          }
          else{
            for(var pos = 0; pos < instructions.length; pos++){
              if(parseInt(instructions[pos].Address, 16) > pendingAddress){
                instructions.splice(pos, 0, { Break: null, Address: "0x" + pendingAddress.toString(16), Label: label , loaded: instruction, user: userInstruction, _rowVariant: '', visible: true, hide: false});
                instructions_binary.splice(pos, 0, { Break: null, Address: "0x" + pendingAddress.toString(16), Label: label , loaded: binary, user: null, _rowVariant: '', visible: false});

                auxAddr = pendingAddress;
                break;
              }
            }
          }

          stopFor = true;

          console_log(address.toString(16));
          console_log(instructions);
        }
      }
    }
  }

  return ret;
}

/*Compile pseudoinstructions*/
function pseudoinstruction_compiler ( instruction, label, line )
{
  var ret = {
          errorcode: "",
          token: "",
          type: "",
          update: "",
          status: "ok"
        } ;

  var re = /\' \'/;
  instruction = instruction.replace(re, "'\0'");
  var re = /\'\\n\'/;
  instruction = instruction.replace(re, "10");
  console_log(instruction);
  var re = /\'\\t\'/;
  instruction = instruction.replace(re, "9");
  console_log(instruction);

  var instructionParts = instruction.split(' ');
  var found = false;

  var re = /\'\0\'/;
  instruction = instruction.replace(re, "' '");
  console_log(instruction);


  for (var i = 0; i < instructionParts.length; i++) {
    instructionParts[i] = instructionParts[i].replace(re, "' '");
  }

  console_log(instructionParts);

  var auxSignature;

  for (var i = 0; i < architecture.pseudoinstructions.length; i++){
    console_log(architecture.pseudoinstructions[i].name);
    if(architecture.pseudoinstructions[i].name != instructionParts[0]){
      continue;
    }

    else{
      found = true;

      var signatureDef = architecture.pseudoinstructions[i].signature_definition;
      signatureDef = signatureDef.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      re = new RegExp("[fF][0-9]+", "g");
      signatureDef = signatureDef.replace(re, "(.*?)");


      var signatureParts = architecture.pseudoinstructions[i].signature.split(',');
      var signatureRawParts = architecture.pseudoinstructions[i].signatureRaw.split(' ');
      var definition = architecture.pseudoinstructions[i].definition;

      auxSignature = architecture.pseudoinstructions[i].signatureRaw;

      console_log(signatureDef);
      console_log(instruction);
      console_log(instructionParts);

      if(instructionParts.length < (architecture.pseudoinstructions[i].fields.length + 1)){
        for (var j = 0; j < ((architecture.pseudoinstructions[i].fields.length + 1)-instructionParts.length ); j++){
          next_token();
          token = get_token();

          console_log("token: " + token);

          if(token != null){
            var re = new RegExp(",+$");
            token = token.replace(re, "");
          }

          instruction = instruction + " " + token;
        }

        instructionParts = instruction.split(' ');
      }

      console_log(instruction);

      re = new RegExp(signatureDef+"$");
      console_log(re)
      if (instruction.search(re) == -1 && i == architecture.pseudoinstructions.length-1) {
          return packCompileError('m3', auxSignature, 'error', "danger") ;
      }

      if(instruction.search(re) == -1 && i < architecture.pseudoinstructions.length-1){
        found = false;
      }

      if(found === true){
        re = /aliasDouble\((.*)\)/;
        for(var a = 0; a < architecture.pseudoinstructions[i].fields.length && definition.search(re) != -1; a++){
          re = new RegExp(architecture.pseudoinstructions[i].fields[a].name,"g");
          console_log(instructionParts[a+1]);
          instructionParts[a+1] = instructionParts[a+1].replace("$","");
          definition = definition.replace(re, instructionParts[a+1]);
        }

        /*Replace DFP of SPF*/
        re = /aliasDouble\((.*)\)/;
        console_log(re);
        while (definition.search(re) != -1){
          var match = re.exec(definition);
          var args = match[1].split(";");
          var aux = "";

          for(var b = 0; b < architecture.components[3].elements.length; b++){
            console_log(architecture.components[3].elements[b].name);
            if(architecture.components[3].elements[b].name.includes(args[0]) !== false){
              aux = architecture.components[3].elements[b].simple_reg[args[1]];
              console_log(aux);
              break;
            }
          }
          console_log(aux);

          definition = definition.replace(re, aux);
          console_log(definition);

        }

        for (var j = 1; j < signatureRawParts.length; j++){
          var aux = signatureRawParts[j].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          re = new RegExp(aux,"g");
          definition = definition.replace(re, instructionParts[j]);
        }

        re = new RegExp("\n","g");
        definition = definition.replace(re, "");

        console_log(definition);
        console_log(signatureParts);

        re = /Field.(\d).\((.*?)\).(.*?)[=<>;\s]/;
        while (definition.search(re) != -1){
          var match = re.exec(definition);
          console_log(match);

          var code;

          if(instructionParts[match[1]].match(/^\'(.*?)\'$/)){
            var re = /^\'(.*?)\'$/;
            console_log(re);
            var match2 = re.exec(instructionParts[match[1]]);
            console_log(match2);
            var asciiCode = match2[1].charCodeAt(0);
            console_log(asciiCode);
            console_log("value = field('" + asciiCode +"', '(" + match[2] + ")', '" + match[3] + "')");
            code = "value = field('" + asciiCode +"', '(" + match[2] + ")', '" + match[3] + "')";
          }
          else{
            console_log("value = field('" + instructionParts[match[1]] +"', '(" + match[2] + ")', '" + match[3] + "')");
            code = "value = field('" + instructionParts[match[1]] +"', '(" + match[2] + ")', '" + match[3] + "')";
          }

          var value;
          try{
            eval(code);
          }
          catch(e){
            if (e instanceof SyntaxError){
              return packCompileError('m5', token, 'error', "danger") ;
            }
          }

          if (value == -1) {
              return packCompileError('m5', token, 'error', "danger") ;
          }

          definition = definition.replace("Field." + match[1] + ".(" + match[2]+ ")." + match[3], value);

          re = /Field.(\d).\((.*?)\).(.*?)[;\s]/;
        }


        re = /Field.(\d).SIZE[=<>;\s]/g;
        if (definition.search(re) != -1){
          var match = re.exec(definition);
          console_log(match);

          var code;

          if(instructionParts[match[1]].match(/^\'(.*?)\'$/)){
            var re = /^\'(.*?)\'$/;
            console_log(re);
            var match2 = re.exec(instructionParts[match[1]]);
            console_log(match2);
            var asciiCode = match2[1].charCodeAt(0);
            console_log(asciiCode);
            console_log("value = field('" + asciiCode +"', 'SIZE', null)");
            code = "value = field('" + asciiCode +"', 'SIZE', null)";
          }
          else{
            console_log("value = field('" + instructionParts[match[1]] +"', 'SIZE', null)");
            code = "value = field('" + instructionParts[match[1]] +"', 'SIZE', null)";
          }

          var value;
          try{
            eval(code);
          }
          catch(e){
            if (e instanceof SyntaxError){
              return packCompileError('m5', token, 'error', "danger") ;
            }
          }

          if(value == -1){
            return packCompileError('m5', token, 'error', "danger") ;
          }

          console_log(value);
          console_log("Field." + match[1] + ".SIZE");

          definition = definition.replace("Field." + match[1] + ".SIZE", value);
        }

        console_log(definition);

        re = /reg\.pc/
        console_log(re);
        while (definition.search(re) != -1){
          definition = definition.replace(re, "pc"); //PRUEBA
          console_log(definition);
        }

        re = /no_ret_op\{([^}]*)\};/;
        console_log(re);
        while (definition.search(re) != -1){
          var match2 = re.exec(definition);

          console_log(match2[1]);

          eval(match2[1]);

          definition = definition.replace(re, '');
          console_log(definition);
        }

        console_log(definition);

        re = /op\{([^}]*)\}/;
        console_log(re);
        while (definition.search(re) != -1){
          var match2 = re.exec(definition);
          var result;

          console_log(match2[1]);

          eval("result=" + match2[1]);

          definition = definition.replace(re, result);
          console_log(definition);
        }

        console_log(definition);

        var stop_while = 0;
        while(definition.match(/\'(.*?)\'/) && stop_while === 0){
          var re = /\'(.*?)\'/;
          if (typeof match !== "undefined")
          {
            var match2 = re.exec(instructionParts[match[1]]);
            console_log(match2);
            var asciiCode = match2[1].charCodeAt(0);
            console_log(asciiCode);
            definition = definition.replace(re, asciiCode)
          }
          else{
            stop_while = 1;
          }
        }

        console_log(definition);

        console_log(instruction);
        var re = new RegExp("'","g");
        instruction = instruction.replace(re, '"');
        console_log(instruction);

        var re = /{([^}]*)}/g;
        var code = re.exec(definition);

        if(code != null){
          while(code != null){
            var instructions = code[1].split(";");
            console_log(instructions);

            for (var j = 0; j < instructions.length-1; j++){
              var aux;
              if(j === 0){
                aux = "ret=instruction_compiler('" + instructions[j] + "','" + instruction + "','" + label + "'," + line + ", false, 0, null, null, true)\nif(ret.status != 'ok'){error = true}";
              }
              else{
                aux = "ret=instruction_compiler('" + instructions[j] + "','', ''," + line + ", false, 0, null, null, true)\nif(ret.status != 'ok'){error = true}";
              }
              definition = definition.replace(instructions[j]+";", aux+";\n");
            }
            code = re.exec(definition);
          }
        }
        else{
          var instructions = definition.split(";");

          for (var j = 0; j < instructions.length-1; j++){
            var aux;
            if(j == 0){
              aux = "ret=instruction_compiler('" + instructions[j] + "','" + instruction + "','" + label + "'," + line + ", false, 0, null, null, true)\nif(ret.status != 'ok'){error = true}";
            }
            else{
              aux = "ret=instruction_compiler('" + instructions[j] + "','', ''," + line + ", false, 0, null, null, true)\nif(ret.status != 'ok'){error = true}";
            }
            definition = definition.replace(instructions[j]+";", aux+";\n");
          }
        }

        try{
          var error = false;
          console_log(definition);
          eval(definition);
          if(error === true){
            console_log("Error pseudo");
            //return packCompileError('m13', "Error pseudoinstruction", 'error', "danger") ;
            return ret;
          }
          console_log("Fin pseudo");
          return ret;
        }
        catch(e){
          if (e instanceof SyntaxError) {
            return packCompileError('m13', "", 'error', "danger") ;
          }
        }
      }

    }
  }

  if (!found) {
      return packCompileError('m3', auxSignature, 'error', "danger") ;
  }

  return ret;
}


/* Get pseudoinstruction fields */
function field ( field, action, type )
{
  console_log(field);
  console_log(action);
  console_log(type);

  if (action == "SIZE")
  {
      console_log("SIZE");

      if (field.match(/^0x/)){
          var value = field.split("x");
          return value[1].length*4;
      }
      else if (field.match(/^([\-\d])+\.(\d)+/)){
          return float2bin(parseFloat(field)).length;
      }
      else if (field.match(/^([\-\d])+/)){
          var numAux = parseInt(field, 10);
          return (bi_intToBigInt(numAux,10).toString(2)).length;
      }
      else
      {
      var ret = creator_memory_findaddress_bytag(field) ;
      if (ret.exit === 1) {
              var numAux = ret.value ;
              return (numAux.toString(2)).length;
    }
      }
  }

  re = /\((.*?)\)/;
  if (action.search(re) != -1){
    var match = re.exec(action);
    var bits = match[1].split(",");
    var startBit = parseInt(bits[0]);
    var endBit = parseInt(bits[1]);

    if(field.match(/^0x/) && (type == "int" || type == "float")){
      var binNum = (parseInt(field, 16).toString(2));
      binNum = binNum.padStart(32, '0');
      binNum = binNum.substring(31-startBit, 32-endBit);
      var hexNum = "0x" + bin2hex(binNum);
      return hexNum;
    }
    else if(field.match(/^0x/) && (type == "double")){
      var binNum = double2bin(hex2double(field));
      binNum = binNum.padStart(64, '0');
      binNum = binNum.substring(63-startBit, 64-endBit);
      var hexNum = "0x" + bin2hex(binNum);
      return hexNum;
    }

    //if (Number.isInteger(field) === false)
    if (isNaN(field) === true)
    {
      var ret = creator_memory_findaddress_bytag(field) ;
      if (ret.exit === 1) {
        field = ret.value ;
      }
      if (ret.exit === 0) {
        return -1;
      }
    }

    if(type == "int"){
      var binNum = (parseInt(field, 10) >>> 0).toString(2);
      binNum = binNum.padStart(32, '0');
      binNum = binNum.substring(31-startBit, 32-endBit);
      var hexNum = "0x" + bin2hex(binNum);
      return hexNum;
    }
    else if (type == "float"){
      var binNum = float2bin(parseFloat(field));
      console_log(binNum);
      binNum = binNum.padStart(32, '0');
      binNum = binNum.substring(31-startBit, 32-endBit);
      var hexNum = "0x" + bin2hex(binNum);
      return hexNum;
    }
    else if (type == "double"){
      var binNum = double2bin(parseFloat(field));
      console_log(binNum);
      binNum = binNum.padStart(64, '0');
      binNum = binNum.substring(63-startBit, 64-endBit);
      var hexNum = "0x" + bin2hex(binNum);
      return hexNum;
    }

  }
  return -1;
}


/**
 * method in charge of return the length of the value. The most use are whene the field are fragment
 * this funciton is create with the intention of reduce errors on the code in case of add new fragments field
 * @return {int} the size of the field
*/
function getFieldLength(separated, startbit, stopbit,a)
{
    if (startbit == stopbit) console_log("Warning: startbit equal to stopBit, please check the achitecture definitions");
  let fieldsLength;
  if (!separated || !separated[a])
    fieldsLength = startbit - stopbit + 1;
  else
    fieldsLength = startbit
      .map((b, i) => b - stopbit[i]+1)
      .reduce((old, newV) => old+newV);
  return fieldsLength;
}

/**
 * method in charge of return the binary instruction after add the inmediate value of the instruction
 * @return {string} the new binary update
*/
function generateBinary(separated, startbit, stopbit, binary, inm,fieldsLenght, a)
{
  if (!separated ||!separated[a]){
      binary = binary.substring(0, binary.length - (startbit + 1)) + inm.padStart(fieldsLength, "0") + binary.substring(binary.length - (stopbit ), binary.length);
  }
  else 
  {
    // check if the value fit on the first segment
    let myInm = inm;
    for (let i = startbit.length-1; i >= 0;  i--) {
      let sb = startbit[i],
      stb = stopbit[i],
      diff = sb - stb+1;
      if (myInm.length <= diff) {
        binary = binary.substring(0, binary.length - (sb+1)) +
        myInm.padStart(diff, "0") +
        binary.substring((binary.length - stb), binary.length);
        break;
      } 
      else {
        let tmpinm = inm.substring(myInm.length - diff, myInm.length);
        binary = binary.substring(0, binary.length - (sb+1)) + tmpinm.padStart(diff, "0") + binary.substring(binary.length - stb, binary.length);
        myInm = myInm.substring(0,(myInm.length-diff));
      }
    }
  }
  return binary;
}


function binaryStringToInt( b ) {
    return parseInt(b, 2);
}


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
 * Execution
 */

var execution_index     = 0;
var execution_mode      = 0; // 0: instruction by instruction, 1: run program
var run_program         = 0; // 0: stopped, 1: running, 2: stopped-by-breakpoint, 3: stopped-by-mutex-read
var execution_init      = 1;
var instructions_packed = 100;


function packExecute ( error, err_msg, err_type, draw )
{
  var ret = {} ;

  ret.error    = error ;
  ret.msg      = err_msg ;
  ret.type     = err_type ;
  ret.draw     = draw ;

  return ret ;
}

function execute_instruction ( )
{
  var draw = {
    space:   [],
    info:    [],
    success: [],
    warning: [],
    danger:  [],
    flash:   []
  } ;

  var error = 0;
  var index;

  do
  {
    console_log(execution_index);
    //console_log(architecture.components[0].elements[0].value); //TODO
    console_log(readRegister(0, 0));

    if (instructions.length === 0) {
      return packExecute(true, 'No instructions in memory', 'danger', null);
    }
    if (execution_index < -1) {
      return packExecute(true, 'The program has finished', 'warning', null);
    }
    if (execution_index == -1) {
      return packExecute(true, 'The program has finished with errors', 'danger', null);
    }
    else if (run_program === 3) {
      return packExecute(false, '', 'info', null);
    }

    //Search a main tag
    if (execution_init === 1)
    {
      for (var i = 0; i < instructions.length; i++)
      {
        if (instructions[i].Label == architecture.arch_conf[5].value) {
          //draw.success.push(execution_index) ;
          //architecture.components[0].elements[0].value = bi_intToBigInt(instructions[i].Address, 10); //TODO
          writeRegister(bi_intToBigInt(instructions[i].Address, 10), 0, 0);
          execution_init = 0;
          break;
        }
        else if (i == instructions.length-1) {
          execution_index = -1;
          return packExecute(true, 'Label "'+ architecture.arch_conf[5].value +'" not found', 'danger', null);
        }
      }
    }

    //Get execution index by PC
    get_execution_index (draw);


    //Ask interruption before execute intruction
    var i_reg = crex_findReg_bytag ("event_cause");
    if (i_reg.match != 0)
    {
      var i_reg_value = readRegister(i_reg.indexComp, i_reg.indexElem);
      if (i_reg_value != 0)
      {
        console.log("Interruption detected");
        //TODO: Print badget on instruction
        draw.warning.push(execution_index);

        //Save register PC (in EPC), STATUS
        var epc_reg = crex_findReg_bytag ("exception_program_counter");
        var pc_reg  = crex_findReg_bytag ("program_counter");

        var pc_reg_value = readRegister(pc_reg.indexComp, pc_reg.indexElem);
        writeRegister(pc_reg_value, epc_reg.indexComp, epc_reg.indexElem);

        //TODO: get new PC
        var handler_addres = 0;

        //Load in PC new PC (associated handler) and modify execution_index
        writeRegister(handler_addres, pc_reg.indexComp, pc_reg.indexElem);
        get_execution_index (draw);

        //Reset CAUSE register
        console.log(i_reg);
        writeRegister(0, i_reg.indexComp, i_reg.indexElem);
      }
    }


    var instructionExec = instructions[execution_index].loaded;
    var instructionExecParts = instructionExec.split(' ');

    var signatureDef;
    var signatureParts;
    var signatureRawParts;

    var binary;
    var nwords;
    var auxDef;
    var type;

    //Search the instruction to execute
    //TODO: move the instruction identification to the compiler stage, binary not
    for (var i = 0; i < architecture.instructions.length; i++) {
      var auxSig = architecture.instructions[i].signatureRaw.split(' ');

      var coStartbit;
      var coStopbit;

      var numCop = 0;
      var numCopCorrect = 0;

      for (var y = 0; y < architecture.instructions[i].fields.length; y++) {
        if(architecture.instructions[i].fields[y].type == "co")
        {
          coStartbit = 31 - parseInt(architecture.instructions[i].fields[y].startbit);
          coStopbit = 32 - parseInt(architecture.instructions[i].fields[y].stopbit);
        }
      }

      if(architecture.instructions[i].co == instructionExecParts[0].substring(coStartbit,coStopbit))
      {
        if(architecture.instructions[i].cop != null && architecture.instructions[i].cop != '')
        {
          for (var j = 0; j < architecture.instructions[i].fields.length; j++)
          {
            if (architecture.instructions[i].fields[j].type == "cop")
            {
              numCop++;
              if (architecture.instructions[i].fields[j].valueField == instructionExecParts[0].substring(((architecture.instructions[i].nwords*31) - architecture.instructions[i].fields[j].startbit), ((architecture.instructions[i].nwords*32) - architecture.instructions[i].fields[j].stopbit))) {
                numCopCorrect++;
              }
            }
          }
          if(numCop != numCopCorrect){
            continue;
          }
        }

        var instruction_loaded    = architecture.instructions[i].signature_definition;
        var instruction_fields    = architecture.instructions[i].fields;
        var instruction_nwords    = architecture.instructions[i].nwords;   

        for (var f = 0; f < instruction_fields.length; f++) 
        {
          re = new RegExp("[Ff]"+f);
          var res = instruction_loaded.search(re);

          if (res != -1)
          {
            var value = null;
            re = new RegExp("[Ff]"+f, "g");
            switch(instruction_fields[f].type)
            {
              case "co":
                value = instruction_fields[f].name;
                break;

              //TODO: unify register type by register file on architecture
              case "INT-Reg":
                var bin = instructionExec.substring(((instruction_nwords*31) - instruction_fields[f].startbit), ((instruction_nwords*32) - instruction_fields[f].stopbit));
                value = get_register_binary ("int_registers", bin);
                break; 
              case "SFP-Reg":
                var bin = instructionExec.substring(((instruction_nwords*31) - instruction_fields[f].startbit), ((instruction_nwords*32) - instruction_fields[f].stopbit));
                value = get_register_binary ("fp_registers", bin);
                break; 
              case "DFP-Reg":
                var bin = instructionExec.substring(((instruction_nwords*31) - instruction_fields[f].startbit), ((instruction_nwords*32) - instruction_fields[f].stopbit));
                value = get_register_binary ("fp_registers", bin);
                break; 
              case "Ctrl-Reg":
                var bin = instructionExec.substring(((instruction_nwords*31) - instruction_fields[f].startbit), ((instruction_nwords*32) - instruction_fields[f].stopbit));
                value = get_register_binary ("ctrl_registers", bin);
                break; 

              case "inm-signed":
              case "inm-unsigned":
              case "address":
              case "offset_bytes":
              case "offset_words":
                var bin = "";

                //Get binary
                if(architecture.instructions[i].separated && architecture.instructions[i].separated[f] === true){
                  for (var sep_index = 0; sep_index < architecture.instructions[i].fields[f].startbit.length; sep_index++) {
                    bin = bin + instructionExec.substring(((instruction_nwords*31) - instruction_fields[f].startbit[sep_index]), ((instruction_nwords*32) - instruction_fields[f].stopbit[sep_index]))
                  }
                }
                else{
                  bin = instructionExec.substring(((instruction_nwords*31) - instruction_fields[f].startbit), ((instruction_nwords*32) - instruction_fields[f].stopbit))
                }

                // value = get_number_binary(bin) ;
                value     = parseInt(bin, 2).toString(16) ;
                value_len = Math.abs(instruction_fields[f].startbit - instruction_fields[f].stopbit) ;
                value     = '0x' + value.padStart(value_len/4, '0') ;
                break; 

              default:
                break
            }
            instruction_loaded = instruction_loaded.replace(re, value);
          }
        }

        instructionExec = instruction_loaded;
        instructionExecParts = instructionExec.split(' ');

        binary = true;
      }

      if (architecture.instructions[i].name == instructionExecParts[0] && instructionExecParts.length == auxSig.length)
      {
        type = architecture.instructions[i].type;
        signatureDef = architecture.instructions[i].signature_definition;

        signatureDef = signatureDef.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        re = new RegExp("[fF][0-9]+", "g");
        signatureDef = signatureDef.replace(re, "(.*?)");

        re = new RegExp(",", "g");
        var signature = architecture.instructions[i].signature.replace(re, " ");

        re = new RegExp(signatureDef+"$");
        var match = re.exec(signature);
        var signatureParts = [];
        for(var j = 1; j < match.length; j++){
          signatureParts.push(match[j]);
        }

        match = re.exec(architecture.instructions[i].signatureRaw);
        var signatureRawParts = [];
        for(var j = 1; j < match.length; j++){
          signatureRawParts.push(match[j]);
        }

        console_log(signatureParts);
        console_log(signatureRawParts);

        auxDef = architecture.instructions[i].definition;
        nwords = architecture.instructions[i].nwords;
        binary = false;
        break;
      }
    }
    //END TODO

    //Increase PC
    var pc_reg = crex_findReg_bytag ("program_counter");
    word_size = parseInt(architecture.arch_conf[1].value) / 8;
    writeRegister(readRegister(pc_reg.indexComp, pc_reg.indexElem) + (nwords * word_size), 0,0);
    console_log(auxDef);


    // preload
    if (typeof instructions[execution_index].preload === "undefined")
    {
      //writeRegister and readRegister
      var readings_description = "";
      var writings_description = "";

      //TODO: move to the compilation stage
      re = new RegExp(signatureDef+"$");
      var match = re.exec(instructionExec);
      instructionExecParts = [];

      for(var j = 1; j < match.length; j++){
        instructionExecParts.push(match[j]);
      }
      //END TODO

      console_log(instructionExecParts);

      var var_readings_definitions      = {};
      var var_readings_definitions_prev = {};
      var var_readings_definitions_name = {};
      var var_writings_definitions      = {};

      // Generate all registers, values, etc. readings
      for (var i = 1; i < signatureRawParts.length; i++)
      {
        if (signatureParts[i] == "INT-Reg" || signatureParts[i] == "SFP-Reg" || signatureParts[i] == "DFP-Reg" || signatureParts[i] == "Ctrl-Reg")
        {
          for (var j = 0; j < architecture.components.length; j++)
          {
            for (var z = architecture.components[j].elements.length-1; z >= 0; z--)
            {
              if (architecture.components[j].elements[z].name.includes(instructionExecParts[i]))
              {
                var_readings_definitions[signatureRawParts[i]]      = "var " + signatureRawParts[i] + "      = readRegister ("+j+" ,"+z+", \""+ signatureParts[i] + "\");\n"
                var_readings_definitions_prev[signatureRawParts[i]] = "var " + signatureRawParts[i] + "_prev = readRegister ("+j+" ,"+z+", \""+ signatureParts[i] + "\");\n"
                var_readings_definitions_name[signatureRawParts[i]] = "var " + signatureRawParts[i] + "_name = '" + instructionExecParts[i] + "';\n";

                re = new RegExp( "(?:\\W|^)(((" + signatureRawParts[i] +") *=)[^=])", "g");
                //If the register is in the left hand than '=' then write register always
                if(auxDef.search(re) != -1){
                  var_writings_definitions[signatureRawParts[i]]  = "writeRegister("+ signatureRawParts[i] +", "+j+", "+z+", \""+ signatureParts[i] + "\");\n";
                }
                //Write register only if value is diferent
                else{
                  var_writings_definitions[signatureRawParts[i]]  = "if(" + signatureRawParts[i] + " != " + signatureRawParts[i] + "_prev)" +
                                                                    " { writeRegister("+ signatureRawParts[i]+" ,"+j+" ,"+z+", \""+ signatureParts[i] + "\"); }\n";
                }
              }
            }
          }
        }
        else{

          /////////TODO: inm-signed
          if ( signatureParts[i] == "offset_words" )
          {
            if (instructionExecParts[i].startsWith("0x"))
            {
              var value     = parseInt(instructionExecParts[i]);
              var nbits     = 4 * (instructionExecParts[i].length - 2) ; // 0xFFC -> 12 bits
              var value_bin = value.toString(2).padStart(nbits, '0') ;   // value_bin = '111111111100'

              // TODO: replace 32 with bits in architecture...
              if (value_bin[0] == '1') {
                value_bin = ''.padStart(32 - nbits, '1') + value_bin ;   // value_bin = '1111...111' + '111111111100' ;
              }
              else {
                value_bin = ''.padStart(32 - nbits, '0') + value_bin ;   // value_bin = '0000...000' + '011111111100' ;
              }
              value = parseInt(value_bin, 2) >> 0 ;
              instructionExecParts[i] = value ;

              console_log(instructionExecParts[i]);
            }
          }
          /////////

          var_readings_definitions[signatureRawParts[i]] = "var " + signatureRawParts[i] + " = " + instructionExecParts[i] + ";\n";
        }
      }

      for (var elto in var_readings_definitions){
         readings_description = readings_description + var_readings_definitions[elto];
      }
      for (var elto in var_readings_definitions_prev){
         readings_description = readings_description + var_readings_definitions_prev[elto];
      }
      for (var elto in var_readings_definitions_name){
         readings_description = readings_description + var_readings_definitions_name[elto];
      }
      for (var elto in var_writings_definitions){
         writings_description = writings_description + var_writings_definitions[elto];
      }

      // writeRegister and readRegister direcly named include into the definition
      for (var i = 0; i < architecture.components.length; i++)
      {
        for (var j = architecture.components[i].elements.length-1; j >= 0; j--)
        {
          var clean_name = clean_string(architecture.components[i].elements[j].name[0], 'reg_');
          var clean_aliases = architecture.components[i].elements[j].name.map((x)=> clean_string(x, 'reg_')).join('|');

          re = new RegExp( "(?:\\W|^)(((" + clean_aliases +") *=)[^=])", "g");
          if (auxDef.search(re) != -1){
            re = new RegExp("(" + clean_aliases + ")");
            var reg_name = re.exec(auxDef)[0];
            clean_name = clean_string(reg_name, 'reg_');
            writings_description = writings_description+"\nwriteRegister("+ clean_name +", "+i+", "+j+", \""+ signatureParts[i] + "\");";
          }

          re = new RegExp("([^a-zA-Z0-9])(?:" + clean_aliases + ")");
          if (auxDef.search(re) != -1){
            re = new RegExp("(" + clean_aliases + ")");
            var reg_name = re.exec(auxDef)[0];
            clean_name = clean_string(reg_name, 'reg_');
            readings_description = readings_description + "var " + clean_name + "      = readRegister("+i+" ,"+j+", \""+ signatureParts[i] + "\");\n"
            readings_description = readings_description + "var " + clean_name + "_name = '" + clean_name + "';\n";
          }
        }
      }

      auxDef =  "\n/* Read all instruction fields */\n" +
                 readings_description +
                "\n/* Original instruction definition */\n" +
                 auxDef +
                "\n\n/* Modify values */\n" +
                 writings_description;

      // DEBUG
      console_log(" ................................. " +
                  "instructions[" + execution_index + "]:\n" +
                   auxDef + "\n" +
                  " ................................. ");

      // preload instruction
      eval("instructions[" + execution_index + "].preload = function(elto) { " +
           "   try {\n" +
               auxDef.replace(/this./g,"elto.") + "\n" +
           "   }\n" +
           "   catch(e){\n" +
           "     throw e;\n" +
           "   }\n" +
           "}; ") ;
    }


    try {
      var result = instructions[execution_index].preload(this);
      if ( (typeof result != "undefined") && (result.error) ) {
        return result;
      }
    }
    catch ( e )
    {
      var msg = '' ;
      if (e instanceof SyntaxError)
        msg = 'The definition of the instruction contains errors, please review it' + e.stack ; //TODO
      else msg = e.msg ;

      console_log("Error: " + e.stack);
      error = 1;
      draw.danger.push(execution_index) ;
      execution_index = -1;

      return packExecute(true, msg, 'danger', draw) ;
    }

    // Refresh stats
    stats_update(type) ;

    // Refresh power consumption
    clk_cycles_update(type) ;

    // Execution error
    if (execution_index == -1){
      error = 1;
      return packExecute(false, '', 'info', null); //CHECK
    }

    // Next instruction to execute
    if (error !== 1 && execution_index < instructions.length)
    {
      for (var i = 0; i < instructions.length; i++)
      {
        var pc_reg = crex_findReg_bytag ("program_counter");
        var pc_reg_value = readRegister(pc_reg.indexComp, pc_reg.indexElem);
        if (parseInt(instructions[i].Address, 16) == pc_reg_value) {
          execution_index = i;
          draw.success.push(execution_index) ;
          break;
        }
        else if ((i == instructions.length-1) && (run_program === 3)){
          execution_index = instructions.length+1;
        }
        else if (i == instructions.length-1){
          draw.space.push(execution_index) ;
          execution_index = instructions.length+1;
        }
      }
    }

    if ((execution_index >= instructions.length) && (run_program === 3))
    {
      for (var i = 0; i < instructions.length; i++) {
        draw.space.push(i);
      }
      draw.info=[];
      return packExecute(false, 'The execution of the program has finished', 'success', draw); //CHECK
    }
    else if ((execution_index >= instructions.length) && (run_program != 3))
    {
      for (var i = 0; i < instructions.length; i++){
        draw.space.push(i) ;
      }
      draw.info=[];
      execution_index = -2;
      return packExecute(false, 'The execution of the program has finished', 'success', draw);
    }
    else{
      if (error !== 1) {
        draw.success.push(execution_index);
      }
    }
    console_log(execution_index) ;
  }
  while(instructions[execution_index].hide === true) ;

  return packExecute(false, null, null, draw) ;
}

function executeProgramOneShot ( limit_n_instructions )
{
  var ret = null;

  // Google Analytics
  creator_ga('execute', 'execute.run');

  // execute program
  for (var i=0; i<limit_n_instructions; i++)
  {
    ret = execute_instruction();

    if (ret.error === true){
      return ret;
    }
    if (execution_index < -1) {
      return ret;
    }
  }

  return packExecute(true, '"ERROR:" number of instruction limit reached :-(', null, null) ;
}

function reset ()
{
  // Google Analytics
  creator_ga('execute', 'execute.reset');

  execution_index = 0;
  execution_init = 1;
  run_program = 0;

  // Reset stats
  stats_reset();

  //Power consumption reset
  clk_cycles_reset();

  // Reset console
  keyboard = '' ;
  display  = '' ;

  for (var i = 0; i < architecture_hash.length; i++)
  {
    for (var j = 0; j < architecture.components[i].elements.length; j++)
    {
      if (architecture.components[i].double_precision === false || (architecture.components[i].double_precision === true && architecture.components[i].double_precision_type == "extended"))
      {
        architecture.components[i].elements[j].value = architecture.components[i].elements[j].default_value;
      }

      else{
        var aux_value;
        var aux_sim1;
        var aux_sim2;

        for (var a = 0; a < architecture_hash.length; a++)
        {
          for (var b = 0; b < architecture.components[a].elements.length; b++)
          {
            if (architecture.components[a].elements[b].name.includes(architecture.components[i].elements[j].simple_reg[0]) !== false){
              aux_sim1 = bin2hex(float2bin(bi_BigIntTofloat(architecture.components[a].elements[b].default_value)));
            }
            if (architecture.components[a].elements[b].name.includes(architecture.components[i].elements[j].simple_reg[1]) !== false){
              aux_sim2 = bin2hex(float2bin(bi_BigIntTofloat(architecture.components[a].elements[b].default_value)));
            }
          }
        }

        aux_value = aux_sim1 + aux_sim2;
        architecture.components[i].elements[j].value = bi_floatToBigInt(hex2double("0x" + aux_value)); //TODO: no estoy seguro
      }
    }
  }

  architecture.memory_layout[4].value = backup_stack_address;
  architecture.memory_layout[3].value = backup_data_address;

  // reset memory
  creator_memory_reset() ;

  //Stack Reset
  creator_callstack_reset();
  track_stack_reset();

  return true ;
}

//Exit syscall
function creator_executor_exit ( error )
{
  // Google Analytics
  creator_ga('execute', 'execute.exit');

  if (error)
  {
    execution_index = -1;
  }
  else
  {
    execution_index = instructions.length + 1;
  }
}




/*
 * Auxiliar functions
 */

//Get execution index by PC
function get_execution_index ( draw )
{
  var pc_reg = crex_findReg_bytag ("program_counter");
  var pc_reg_value = readRegister(pc_reg.indexComp, pc_reg.indexElem);
  for (var i = 0; i < instructions.length; i++)
  {
    if (parseInt(instructions[i].Address, 16) == pc_reg_value) 
    {
      execution_index = i;

      console_log(instructions[execution_index].hide);
      console_log(execution_index);
      console_log(instructions[i].Address);

      if (instructions[execution_index].hide === false) {
        draw.info.push(execution_index);
      }
    }
    else{
      if (instructions[execution_index].hide === false) {
        draw.space.push(i);
      }
    }
  }

  return i;
}

function crex_show_notification ( msg, level )
{
  if (typeof window !== "undefined")
    show_notification(msg, level);
  else console.log(level.toUpperCase() + ": " + msg);
}

// Modify the stack limit
function writeStackLimit ( stackLimit )
{
  var draw = {
    space:   [],
    info:    [],
    success: [],
    warning: [],
    danger:  [],
    flash:   []
  } ;
  
  if (stackLimit == null) {
      return ;
  }
  if (stackLimit <= parseInt(architecture.memory_layout[3].value) && stackLimit >= parseInt(parseInt(architecture.memory_layout[2].value)))
  {
    draw.danger.push(execution_index);
    throw packExecute(true, 'Stack pointer cannot be placed in the data segment', 'danger', null);
  }
  else if(stackLimit <= parseInt(architecture.memory_layout[1].value) && stackLimit >= parseInt(architecture.memory_layout[0].value))
  {
    draw.danger.push(execution_index);
    throw packExecute(true, 'Stack pointer cannot be placed in the text segment', 'danger', null);
  }
  else
  {
    var diff = parseInt(architecture.memory_layout[4].value) - stackLimit ;
    if (diff > 0) {
      creator_memory_zerofill(stackLimit, diff) ;
    }

    track_stack_setsp(stackLimit);
    architecture.memory_layout[4].value = "0x" + (stackLimit.toString(16)).padStart(8, "0").toUpperCase();
  }
}


/*
 * Stats
 */

var totalStats = 0;
var stats_value = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
var stats = [
              { type: 'Arithmetic floating point', number_instructions: 0, percentage: 0 },
              { type: 'Arithmetic integer', number_instructions: 0, percentage: 0},
              { type: 'Comparison', number_instructions: 0, percentage: 0 },
              { type: 'Conditional bifurcation', number_instructions: 0, percentage: 0},
              { type: 'Control', number_instructions: 0, percentage: 0},
              { type: 'Function call', number_instructions: 0, percentage: 0},
              { type: 'I/O', number_instructions: 0, percentage: 0},
              { type: 'Logic', number_instructions: 0, percentage: 0, abbreviation: "Log"},
              { type: 'Memory access', number_instructions: 0, percentage: 0},
              { type: 'Other', number_instructions: 0, percentage: 0},
              { type: 'Syscall', number_instructions: 0, percentage: 0},
              { type: 'Transfer between registers', number_instructions: 0, percentage: 0},
              { type: 'Unconditional bifurcation', number_instructions: 0, percentage: 0},
            ];


function stats_update ( type )
{
  for (var i = 0; i < stats.length; i++)
  {
    if (type == stats[i].type)
    {
      stats[i].number_instructions++;
      stats_value[i] ++;

      totalStats++;
      if (typeof app !== "undefined") {
        app._data.totalStats++;
      }
    }
  }

  for (var i = 0; i < stats.length; i++){
    stats[i].percentage = ((stats[i].number_instructions/totalStats)*100).toFixed(2);
  }
}

function stats_reset ( )
{
  totalStats = 0 ;
  if (typeof app !== "undefined") {
    app._data.totalStats = 0 ;
  }

  for (var i = 0; i < stats.length; i++)
  {
    stats[i].percentage = 0;

    stats[i].number_instructions = 0;
    stats_value[i] = 0;
  }
}


/*
 * CLK Cycles
 */

var total_clk_cycles = 0;
var clk_cycles_value =  [
                          {
                            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                          }
                        ];
var clk_cycles =  [
                    { type: 'Arithmetic floating point', clk_cycles: 0, percentage: 0 },
                    { type: 'Arithmetic integer', clk_cycles: 0, percentage: 0},
                    { type: 'Comparison', clk_cycles: 0, percentage: 0 },
                    { type: 'Conditional bifurcation', clk_cycles: 0, percentage: 0},
                    { type: 'Control', clk_cycles: 0, percentage: 0},
                    { type: 'Function call', clk_cycles: 0, percentage: 0},
                    { type: 'I/O', clk_cycles: 0, percentage: 0},
                    { type: 'Logic', clk_cycles: 0, percentage: 0, abbreviation: "Log"},
                    { type: 'Memory access', clk_cycles: 0, percentage: 0},
                    { type: 'Other', clk_cycles: 0, percentage: 0},
                    { type: 'Syscall', clk_cycles: 0, percentage: 0},
                    { type: 'Transfer between registers', clk_cycles: 0, percentage: 0},
                    { type: 'Unconditional bifurcation', clk_cycles: 0, percentage: 0},
                  ];

function clk_cycles_update ( type )
{
  for (var i = 0; i < clk_cycles.length; i++)
  {
    if (type == clk_cycles[i].type)
    {
      clk_cycles[i].clk_cycles++;

      //Update CLK Cycles plot
      clk_cycles_value[0].data[i] ++;
      
      total_clk_cycles++;
      if (typeof app !== "undefined") {
        app._data.total_clk_cycles++;
      }
    }
  }

  //CLK Cycles
  for (var i = 0; i < stats.length; i++){
    clk_cycles[i].percentage = ((clk_cycles[i].clk_cycles/total_clk_cycles)*100).toFixed(2);
  }
}

function clk_cycles_reset ( )
{
  total_clk_cycles = 0 ;
  if (typeof app !== "undefined") {
    app._data.total_clk_cycles = 0 ;
  }

  for (var i = 0; i < clk_cycles.length; i++)
  {
    clk_cycles[i].percentage = 0;

    //Update CLK Cycles plot
    clk_cycles_value[0].data[i] = 0;
  }
}


/*
 * I/O
 */

var keyboard = '' ;
var display = '' ;

//Keyboard

function display_print ( info )
{
  if (typeof app !== "undefined")
    app._data.display += info ;
  else process.stdout.write(info + '\n') ;

  display += info ;
}


function kbd_read_char ( keystroke, params )
{
  var value = keystroke.charCodeAt(0);
  writeRegister(value, params.indexComp, params.indexElem);

  return value ;
}

function kbd_read_int ( keystroke, params )
{
  var value = parseInt(keystroke) ;
  writeRegister(value, params.indexComp, params.indexElem);

  return value ;
}

function kbd_read_float ( keystroke, params )
{
  var value = parseFloat(keystroke, 10) ;
  writeRegister(value, params.indexComp, params.indexElem, "SFP-Reg");

  return value ;
}

function kbd_read_double ( keystroke, params )
{
  var value = parseFloat(keystroke, 10) ;
  writeRegister(value, params.indexComp, params.indexElem, "DFP-Reg");

  return value ;
}

function kbd_read_string ( keystroke, params )
{
  var value = "";
  var neltos = readRegister ( params.indexComp2, params.indexElem2 );
  for (var i = 0; (i < neltos) && (i < keystroke.length); i++) {
    value = value + keystroke.charAt(i);
  }

  var neltos = readRegister ( params.indexComp, params.indexElem );
  writeMemory(value, parseInt(neltos), "string") ;

  return value ;
}


function keyboard_read ( fn_post_read, fn_post_params)
{
  var draw = {
    space:   [],
    info:    [],
    success: [],
    warning: [],
    danger:  [],
    flash:   []
  } ;

  // CL
  if (typeof app === "undefined")
  {
    var readlineSync = require('readline-sync') ;
    var keystroke    = readlineSync.question(' > ') ;

    var value = fn_post_read(keystroke, fn_post_params) ;
    keyboard = keyboard + " " + value;

    return packExecute(false, 'The data has been uploaded', 'danger', null);
  }

  // UI
  app._data.enter = false;

  if (3 === run_program) {
    setTimeout(keyboard_read, 1000, fn_post_read, fn_post_params);
    return;
  }

  fn_post_read(app._data.keyboard, fn_post_params) ;

  app._data.keyboard = "";
  app._data.enter = null;

  show_notification('The data has been uploaded', 'info') ;

  if (execution_index >= instructions.length)
  {
    for (var i = 0; i < instructions.length; i++){
      draw.space.push(i) ;
    }

    execution_index = -2;
    return packExecute(true, 'The execution of the program has finished', 'success', null);
  }

  if (run_program === 1) {
    //uielto_toolbar_btngroup.methods.execute_program();
    $("#playExecution").trigger("click");
  }
}


/*
 *  Execute binary
 */

function get_register_binary (type, bin)
{
  for (var i = 0; i < architecture.components.length; i++)
  {
    if(architecture.components[i].type == type)
    {
      for (var j = 0; j < architecture.components[i].elements.length; j++)
      {
        var len = bin.length;
        if((j.toString(2)).padStart(len, "0") == bin){
          return architecture.components[i].elements[j].name[0];
        }
      }
    }
  }

  return null;
}


function get_number_binary (bin)
{
  return "0x" + bin2hex(bin);
}

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


// load components

function load_architecture ( arch_str )
{
    var ret = {} ;

    arch_obj = JSON.parse(arch_str) ;
    ret = load_arch_select(arch_obj) ;

    return ret ;
}

function load_library ( lib_str )
{
    var ret = {
                'status': 'ok',
                'msg':    ''
              } ;

    code_binary   = lib_str ;
    update_binary = JSON.parse(code_binary) ;

    return ret ;
}

// compilation

function assembly_compile ( code )
{
    var ret = {} ;

    code_assembly = code ;
    ret = assembly_compiler() ;
    switch (ret.status)
    {
        case "error":
         var code_assembly_segment = code_assembly.split('\n') ;
         ret.msg += "\n\n" ;
         if (ret.line > 0)
             ret.msg += "  " + (ret.line+0) + " " + code_assembly_segment[ret.line - 1] + "\n" ;
             ret.msg += "->" + (ret.line+1) + " " + code_assembly_segment[ret.line] + "\n" ;
         if (ret.line < code_assembly_segment.length - 1)
             ret.msg += "  " + (ret.line+2) + " " + code_assembly_segment[ret.line + 1] + "\n" ;
             break;

        case "warning":
             ret.msg = 'warning: ' + ret.token ;
             break;

        case "ok":
             ret.msg = 'Compilation completed successfully' ;
             break;

        default:
             ret.msg = 'Unknow assembly compiler code :-/' ;
             break;
    }
    
    return ret ;
}

// execution

function execute_program ( limit_n_instructions )
{
    var ret = {} ;
    ret = executeProgramOneShot(limit_n_instructions) ;
    if (ret.error === true)
    {
        ret.status = "ko" ;
        return ret ;
    }

    ret.status = "ok" ;
    return ret ;
}

// state management

function get_state ( )
{
    var ret = {
                'status': 'ok',
                'msg':    ''
              } ;

    var c_name      = '' ;
    var e_name      = '' ;
    var elto_value  = null ;
    var elto_dvalue = null ;
    var elto_string = null ;

    // dump registers
    for (var i=0; i<architecture.components.length; i++)
    {
        c_name = architecture.components[i].name ;
        if (typeof c_name == "undefined") {
            return ret ;
        }
        c_name = c_name.split(' ').map(i => i.charAt(0)).join('').toLowerCase() ;

        for (var j=0; j<architecture.components[i].elements.length; j++)
        {
            // get value
            e_name      = architecture.components[i].elements[j].name ;
            elto_value  = architecture.components[i].elements[j].value ;

            //get default value
            if (architecture.components[i].double_precision === true && architecture.components[i].double_precision_type == "linked")
            {
                var aux_value;
                var aux_sim1;
                var aux_sim2;

                for (var a = 0; a < architecture_hash.length; a++) {
                  for (var b = 0; b < architecture.components[a].elements.length; b++) {
                    if(architecture.components[a].elements[b].name == architecture.components[i].elements[j].simple_reg[0]){
                      aux_sim1 = bin2hex(float2bin(bi_BigIntTofloat(architecture.components[a].elements[b].default_value)));
                    }
                    if(architecture.components[a].elements[b].name == architecture.components[i].elements[j].simple_reg[1]){
                      aux_sim2 = bin2hex(float2bin(bi_BigIntTofloat(architecture.components[a].elements[b].default_value)));
                    }
                  }
                }

                aux_value = aux_sim1 + aux_sim2;
                elto_dvalue = hex2double("0x" + aux_value);
            }
            else{
              elto_dvalue = architecture.components[i].elements[j].default_value ;
            }

            // skip default results
            if (typeof elto_dvalue == "undefined") {
                continue ;
            }
            if (elto_value == elto_dvalue) {
                continue ;
            }

            // value != default value => dumpt it
            elto_string = "0x" + elto_value.toString(16) ;
            if (architecture.components[i].type == "fp_registers") 
            {
                if(architecture.components[i].double_precision === false){
                  elto_string = "0x" + bin2hex(float2bin(bi_BigIntTofloat(elto_value))) ;
                }
                if (architecture.components[i].double_precision === true) {
                  elto_string = "0x" + bin2hex(double2bin(bi_BigIntTodouble(elto_value))) ;
                }
            }

            ret.msg = ret.msg + c_name + "[" + e_name + "]:" + elto_string + "; ";
        }
    }

    // dump memory
    var addrs = main_memory_get_addresses() ;
    for (var i=0; i<addrs.length; i++)
    {
      if(addrs[i] >= parseInt(architecture.memory_layout[3].value)){
        continue;
      }

      elto_value  = main_memory_read_value(addrs[i]) ;
      elto_dvalue = main_memory_read_default_value(addrs[i]) ;

      if (elto_value != elto_dvalue)
      {
        addr_string = "0x" + parseInt(addrs[i]).toString(16) ;
        elto_string = "0x" + elto_value ;
        ret.msg = ret.msg + "memory[" + addr_string + "]" + ":" + elto_string + "; ";
      }
    }
    

    // dump keyboard
    ret.msg = ret.msg + "keyboard[0x0]" + ":'" + encodeURIComponent(keyboard) + "'; ";

    // dump display
    ret.msg = ret.msg + "display[0x0]"  + ":'" + encodeURIComponent(display)  + "'; ";

    return ret ;
}

function compare_states ( ref_state, alt_state )
{
    var ret = {
                'status': 'ok',
                'msg':    ''
              } ;

    ref_state_arr = ref_state.split('\n')
      .map(function(s) { return s.replace(/^\s*|\s*$/g, ""); })
      .filter(function(x) { return x; });
    if (ref_state_arr.length > 0)
         ref_state = ref_state_arr[ref_state_arr.length-1];
    else ref_state = '' ;

    alt_state_arr = alt_state.split('\n')
      .map(function(s) { return s.replace(/^\s*|\s*$/g, ""); })
      .filter(function(x) { return x; });
    if (alt_state_arr.length > 0)
         alt_state = alt_state_arr[alt_state_arr.length-1];
    else alt_state = '' ;

    // 1) check equals
    if (ref_state == alt_state) {
        //ret.msg = "Equals" ;
        return ret ;
    }

    // 2) check m_alt included within m_ref
    var m_ref = {} ;
    if (ref_state.includes(';')) {
        ref_state.split(';').map(function(i) {
                         var parts = i.split(':') ;
                                     if (parts.length !== 2) {
                                         return ;
                                     }

                         m_ref[parts[0].trim()] = parts[1].trim() ;
                                 }) ;
    }

    var m_alt = {} ;
    if (alt_state.includes(';')) {
        alt_state.split(';').map(function(i) {
                             var parts = i.split(':') ;
                                     if (parts.length != 2) {
                                         return ;
                                     }

                         m_alt[parts[0].trim()] = parts[1].trim() ;
                                 }) ;
    }

    ret.msg = "Different: " ;
    for (var elto in m_ref)
    {
         if (m_alt[elto] != m_ref[elto])
         {
             if (typeof m_alt[elto] === "undefined")
                  ret.msg += elto + "=" + m_ref[elto] + " is not available. " ;
             else ret.msg += elto + "=" + m_ref[elto] + " is =" + m_alt[elto] + ". " ;

             ret.status = "ko" ;
         }
    }

    // last) is different...
    if (ret.status != "ko") {
        ret.msg = "" ;
    }

    return ret ;
}

// help

function help_instructions ( )
{
    var o = '' ;
    var m = null ;

    // describe instructions
    o += 'name;\t\tsignature;\t\twords;\t\ttype\n' ;
    for (var i=0; i<architecture.instructions.length; i++)
    {
         m = architecture.instructions[i] ;

         o += m.name +         ';\t' + ((m.name.length         <  7) ? '\t' : '') ;
         o += m.signatureRaw + ';\t' + ((m.signatureRaw.length < 15) ? '\t' : '') ;
         o += m.nwords +       ';\t' + ((m.nwords.length       <  7) ? '\t' : '') ;
         o += m.type + '\n' ;
    }

    return o ;
}

function help_pseudoins ( )
{
    var o = '' ;
    var m = null ;

    // describe pseudoinstructions
    o += 'name;\t\tsignature;\t\twords\n' ;
    for (var i=0; i<architecture.pseudoinstructions.length; i++)
    {
         m = architecture.pseudoinstructions[i] ;

         o += m.name +         ';\t' + ((m.name.length         <  7) ? '\t' : '') ;
         o += m.signatureRaw + ';\t' + ((m.signatureRaw.length < 15) ? '\t' : '') ;
         o += m.nwords + '\n' ;
    }

    return o ;
}


//
// Module interface
//

module.exports.load_architecture = load_architecture ;
module.exports.load_library      = load_library ;

module.exports.assembly_compile  = assembly_compile ;
module.exports.execute_program   = execute_program ;

module.exports.get_state         = get_state ;
module.exports.compare_states    = compare_states ;

module.exports.help_instructions = help_instructions ;
module.exports.help_pseudoins    = help_pseudoins ;

