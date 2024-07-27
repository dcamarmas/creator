/*
 *  Copyright 2015-2024 Saul Alonso Monsalve, Javier Prieto Cepeda, Felix Garcia Carballeira, Alejandro Calderon Mateos, Juan Banga Pardo, Diego Camarmas Alonso
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


/* jshint esversion: 9 */

//
// General auxiliar functions
//

	function base_replaceAll ( base_str, match, replacement )
	{
	    // ES12+
	    if (typeof base_str.replaceAll != "undefined") {
		return base_str.replaceAll(match, replacement) ;
	    }

	    // older javascript engines
	    return base_str.replace(new RegExp(base_escapeRegExp(match), 'g'), ()=>replacement);
	}

        function decimal2binary ( number, size )
        {
                var num_base2        = number.toString(2) ;
                var num_base2_length = num_base2.length ;

                if (num_base2_length > WORD_LENGTH) {
                    return [num_base2, size-num_base2_length, num_base2_length] ;
                }

                num_base2        = (number >>> 0).toString(2) ;
                num_base2_length = num_base2.length ;
                if (number >= 0) {
                    return [num_base2, size-num_base2_length, num_base2_length] ;
                }

                num_base2        = "1" + num_base2.replace(/^[1]+/g, "") ;
                num_base2_length = num_base2.length ;
                if (num_base2_length > size) {
                    return [num_base2, size-num_base2_length, num_base2_length] ;
                }

                num_base2 = "1".repeat(size - num_base2.length) + num_base2 ;
                return [num_base2, size-num_base2.length, num_base2_length] ;
        }

        function float2binary ( f, size )
        {
                var buf   = new ArrayBuffer(8) ;
                var float = new Float32Array(buf) ;
                var uint  = new Uint32Array(buf) ;

                float[0] = f ;
                return decimal2binary(uint[0], size) ;
        }

        control_sequences = {
                        'b':  '\b',
                        'f':  '\f',
                        'n':  '\n',
                        'r':  '\r',
                        't':  '\t',
                        'v':  '\v',
                        'a':  String.fromCharCode(0x0007),
                        "'":  '\'',
                        "\"": '\"',
                        '0':  '\0'
                     } ;

	function treatControlSequences ( possible_value )
	{
		var ret = {} ;
		ret.string = "" ;
		ret.error  = false ;

		for (var i=0; i<possible_value.length; i++)
		{
			if ("\\" != possible_value[i]) {
			    ret.string = ret.string + possible_value[i] ;
			    continue ;
			}

			i++ ;

			if (control_sequences[possible_value[i]] === "undefined") {
			    ret.string = "Unknown escape char" +
					 " '\\" + possible_value[i] + "'" ;
			    ret.error  = true ;
			    return ret ;
			}

			ret.string = ret.string + control_sequences[possible_value[i]] ;
		}

		return ret ;
	}

	function i18n_get_TagFor ( from_elto, base_msg )
	{
		return base_msg.toLowerCase() ;
	}


