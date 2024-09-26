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
//  (1/3) Prepare context for compiling and loading
//
//  Auxiliar function tree for crasm_prepare_context ( CU_data, asm_source )
//   * crasm_prepare_context_firmware           ( context, CU_data )
//   * crasm_prepare_context_pseudoinstructions ( context, CU_data )
//

function crasm_prepare_oc ( elto, aux )
{
	elto.oc = {
                     value:         '',    // "begin {...}" has no 'co/oc' field
                     asm_start_bit: [ 0 ], // initial value to 0:0 to skip this field by default
                     asm_stop_bit:  [ 0 ]
                  } ;

        // set elto.oc.value
	if (typeof aux.co !== "undefined") {
	     elto.oc.value = aux.co ;
        }

        // IF empty 'oc' -> return default elto...
        if (0 == elto.oc.value.length) {
            return elto ;
        }

        // IF NO fields -> return elto...
	if (typeof aux.fields == "undefined") {
            return elto ;
        }

        // IF start/stop bit in fields[i].co -> copy + return elto
	let m = 0 ;
        for (let k=0; k<aux.fields.length; k++)
        {
	     if (typeof aux.fields[k].type == "undefined") {
                 continue ;
             }
	     if (aux.fields[k].type != "co") {
                 continue ;
             }
             if (typeof aux.fields[k].valueField == "undefined") {
                 continue ;
             }

             // copy start/stop bits...
	     elto.oc.asm_start_bit[m] = parseInt(aux.fields[k].bits_start) ;
             elto.oc.asm_stop_bit [m] = parseInt(aux.fields[k].bits_stop) ;
	     m = m + 1 ;

             elto.oc.value = elto.oc.value + aux.fields[k].valueField ;

             // translate bit to index...
             elto.oc.asm_n_bits = wsasm_order2index_startstop(elto.oc.asm_start_bit, elto.oc.asm_stop_bit) ;
        }

        return elto ;
}

function crasm_prepare_eoc ( elto, aux )
{
	elto.eoc = {
                      value:         '',    // "begin {...}" has no 'cop/eoc' field
                      asm_start_bit: [ 0 ], // initial value to 0:0 to skip this field by default
                      asm_stop_bit:  [ 0 ]
                   } ;

        // elto.eoc.value
	if (typeof aux.cop !== "undefined") {
	     elto.eoc.value = aux.cop ;
        }

        // IF empty 'eoc' -> return elto...
        if (0 == elto.eoc.value.length) {
	    elto.eoc.asm_start_bit[0] = elto.eoc.asm_stop_bit[0] + 1 ; // in order to skip empty eoc
            elto.eoc.asm_n_bits       = 0 ;
            return elto ;
        }

        // IF NO fields -> return elto...
	if (typeof aux.fields == "undefined") {
            return elto ;
        }

        // IF start/stop bit in fields[i].co -> copy + return elto
	let m = 0 ;
        for (let k=0; k<aux.fields.length; k++)
        {
	     if (typeof aux.fields[k].type == "undefined") {
                 continue ;
             }
	     if (aux.fields[k].type != "cop") {
                 continue ;
             }

             // copy start/stop bits...
	     elto.eoc.asm_start_bit[m] = parseInt(aux.fields[k].bits_start) ;
             elto.eoc.asm_stop_bit [m] = parseInt(aux.fields[k].bits_stop) ;
	     m = m + 1 ;

             elto.eoc.value = elto.eoc.value + aux.fields[k].valueField ;

             // translate bit to index...
             elto.eoc.asm_n_bits = wsasm_order2index_startstop(elto.eoc.asm_start_bit, elto.eoc.asm_stop_bit) ;
        }

        return elto ;
}


function crasm_prepare_context_firmware ( context, CU_data )
{
           let elto = null ;
	   let aux  = null ;
           let start_bit = [] ;
           let stop_bit  = [] ;
           let lower_bit = 0 ;
           let w_n_bits  = 0 ;
           let w_index   = 0 ;
           let n_bits    = 0 ;
	   let sigraw_split = [] ;

	   // Fill 'firmware'
	   for (let i=0; i<CU_data.instructions.length; i++)
           {
		aux = CU_data.instructions[i];

                // elto: initial fields...
                elto = {} ;

                elto.name                 = aux.name.toLowerCase() ;
		elto.isPseudoinstruction  = false ;
		elto.nwords               = parseInt(aux.nwords) ;
		elto.oc                   = {} ;  // computed later
		elto.eoc                  = {} ;  // computed later
		elto.fields               = [] ;  // computed later
		elto.signature_type_str   = aux.name ;
		elto.signature_type_arr   = [] ;  // computed later
		elto.signature_size_str   = '' ;  // computed later
		elto.signature_size_arr   = [] ;  // computed later
	        elto.signature_raw        = aux.signatureRaw ;
		elto.signature            = aux.signature ; // TODO: aux.signature -> signature+

                // Find fields (co, cop, rs2, rs1, cop2, rd) in signature_raw ("mul rd rs1 rs2")
	        elto.signature_definition = [] ;
                sigraw_split = elto.signature_raw.split(' ') ;
                for (var m=0; m<aux.fields.length; m++)
                {
		     // skip co/cop fields for matching fields...
                     if (["co", "cop"].includes(aux.fields[m].type)) {
			 continue ;
		     }

                     for (var n=1; n<sigraw_split.length; n++)
                     {
                          if (sigraw_split[n] == aux.fields[m].name) {
	                      elto.signature_definition[m] = n - 1 ;
                          }
		     }
                }

		// TODO: AUX.signatureUser from elto.signature
		if (typeof aux.signatureUser !== "undefined")
                     elto.signature_type_str = aux.signatureUser ;
		else elto.signature_type_str = base_replaceAll(elto.signature, ',', ' ') ;

                // tooltip with details...
		elto["mc-start"] = 0 ;
		elto.microcode   = [] ;
		elto.help        = aux.help ;

                // fields: oc + eoc
                crasm_prepare_oc (elto, aux) ;
                crasm_prepare_eoc(elto, aux) ;

                // fields...
		if (typeof aux.fields !== "undefined") {
                    elto.fields_encoding = aux.fields ; // AUX.fields is not matching instruction fields but encoding fields
                }

		elto.signature_size_arr.push(elto.oc.value.length) ;

		let k = 0 ;
                for (let j=0; j<elto.fields_encoding.length; j++)
                {
		     // skip co/cop fields for matching fields...
                     if (["co", "cop"].includes(elto.fields_encoding[j].type)) {
			 continue ;
		     }

                     // translate from index to Fx...
		     k = elto.signature_definition[j] ;

                     // initial values...
                     start_bit    = [] ;
                     stop_bit     = [] ;
                     start_bit[0] = parseInt(elto.fields_encoding[j].startbit) ;
                     stop_bit[0]  = parseInt(elto.fields_encoding[j].stopbit) ;

                     // translate from startbit/stop_bit to asm_start_bit/asm_stop_bit...
                     n_bits = wsasm_order2index_startstop(start_bit, stop_bit) ;

                     // copy back the computed values
		     elto.fields[k] = elto.fields_encoding[j] ;
                     elto.fields[k].asm_start_bit = start_bit ;
                     elto.fields[k].asm_stop_bit  = stop_bit ;
                     elto.fields[k].asm_n_bits    = n_bits ;

                     if (elto.fields_encoding[j].type == "offset_words") {
                         elto.fields[k].address_type  = "rel" ;
                     }

		     elto.signature_size_arr.push(n_bits) ;
                }

		// <ADAPTOR>
                elto.signature_type_str = base_replaceAll(elto.signature_type_str, 'INT-Reg',      'reg') ;
                elto.signature_type_str = base_replaceAll(elto.signature_type_str, 'SFP-Reg',      'reg') ;
                elto.signature_type_str = base_replaceAll(elto.signature_type_str, 'DFP-Reg',      'reg') ;
                elto.signature_type_str = base_replaceAll(elto.signature_type_str, 'inm',          'imm') ;
                elto.signature_type_str = base_replaceAll(elto.signature_type_str, 'imm-unsigned', 'imm') ;
                elto.signature_type_str = base_replaceAll(elto.signature_type_str, 'imm-signed',   'imm') ;
                elto.signature_type_str = base_replaceAll(elto.signature_type_str, 'offset_words', 'imm') ;
		// </ADAPTOR>

                // elto: derived fields...
		elto.signature_size_str = elto.signature_size_arr.join(' ') ;
		elto.signature_type_arr = elto.signature_type_str.split(' ') ;
                elto.signature_user     = wsasm_make_signature_user(elto, '') ;

                // add elto to firmware
	   	if (typeof context.firmware[elto.name] === "undefined") {
	   	    context.firmware[elto.name] = [] ;
		}

	   	context.firmware[elto.name].push(elto) ;
	   }

	   return context ;
}

function crasm_prepare_context_pseudoinstructions ( context, CU_data )
{
           let elto    = null ;
	   let initial = null ;
	   let finish  = null ;

	   // Fill pseudoinstructions
	   for (let i=0; i<CU_data.pseudoinstructions.length; i++)
	   {
		elto_i = CU_data.pseudoinstructions[i] ;

		if (typeof context.pseudoInstructions[elto_i.name] === "undefined")
                {
	 	    context.pseudoInstructions[elto_i.name] = 0 ;
		    if (typeof context.firmware[elto_i.name] === "undefined") {
		        context.firmware[elto_i.name] = [] ;
		    }
		}

		context.pseudoInstructions[elto_i.name]++;

                // initial elto fields...
                elto = {} ;

                elto.name                 = elto_i.name ;
	        elto.isPseudoinstruction  = true ;
	        elto.fields               = [] ;
	        elto.finish               = elto_i.definition ;
	        elto.signature            = elto_i.signature ;             // TODO: better use a canonical format (raw, def included)
	        elto.signature_type_str   = elto_i.signature.replace(/,/g," ") ;
	        elto.signature_raw        = elto_i.signatureRaw ;          // TODO: ??
	        elto.signature_definition = elto_i.signature_definition ;  // TODO: ??

                if (typeof elto.fields !== "undefined") {
		    elto.fields = elto.fields ;  // TODO: check fields are matching fields (without co/cop)
                                                 //       and not encoding fields (with co/cop)
		}

                // elto: derived fields...

		// <ADAPTOR>
                elto.finish             = base_replaceAll(elto.finish, ';', '') ;
                elto.finish             = base_replaceAll(elto.finish, '(', ' ( ') ;
                elto.finish             = base_replaceAll(elto.finish, ')', ' ) ') ;
                elto.finish             = base_replaceAll(elto.finish, '  ', ' ') ;

                elto.signature_type_str = base_replaceAll(elto.signature_type_str, 'INT-Reg',      'reg') ;
                elto.signature_type_str = base_replaceAll(elto.signature_type_str, 'SFP-Reg',      'reg') ;
                elto.signature_type_str = base_replaceAll(elto.signature_type_str, 'DFP-Reg',      'reg') ;
                elto.signature_type_str = base_replaceAll(elto.signature_type_str, 'inm',          'imm') ;
                elto.signature_type_str = base_replaceAll(elto.signature_type_str, 'imm-unsigned', 'imm') ;
                elto.signature_type_str = base_replaceAll(elto.signature_type_str, 'imm-signed',   'imm') ;
                elto.signature_type_str = base_replaceAll(elto.signature_type_str, 'offset_words', 'imm') ;
		// </ADAPTOR>

	        elto.signature_type_arr = elto.signature_type_str.split(' ') ;
		elto.signature_size_arr = Array(elto.signature_type_arr.length).fill(WORD_BYTES*BYTE_LENGTH);
		elto.signature_size_str = elto.signature_size_arr.join(' ') ;
                elto.signature_user     = wsasm_make_signature_user(elto, '') ;

                // TODO: signatureRaw for fields
	        var base_fields = elto_i.signatureRaw.split(' ') ;
                for (let j=1; j<base_fields.length; j++)
                {
	             elto.fields[j-1] = {} ;
	             elto.fields[j-1].name = base_fields[j] ;
                     // TODO: add more fields...
                }

                // add elto to firmware
                context.firmware[elto_i.name].push(elto) ;
	   }

	   return context ;
}


 /*
  *  Public API
  */

function crasm_prepare_context ( CU_data, options )
{
	   // Check arguments
           if (typeof CU_data == "undefined") {
               return { error: 'CU_data is undefined in crasm_prepare_context\n' } ;
           }

           // Initialize context...
           var context = {} ;
	   context.line           	= 1 ;      // here
	   context.error          	= null ;
	   context.i              	= 0 ;      // here
           context.text                 = '' ;     // here
	   context.tokens         	= [] ;
	   context.token_types    	= [] ;
	   context.t              	= 0 ;      // here
           context.comments             = [] ;
	   context.newlines       	= [] ;
	   context.registers      	= [] ;     // here
	   context.firmware             = {} ;     // here
	   context.pseudoInstructions	= [];      // here
	   context.stackRegister	= null ;
	   context.metadata	        = CU_data.metadata ; // TODO: add to "architecture JSON" metadata: {version,endian,...},
	   context.options              = {} ;     // here

           // Fill the assembler configuration
           context.options = wsasm_expand_options(options) ;

           if ( (typeof context.metadata != "undefined") && (typeof context.metadata.rel_mult != "undefined") )
                context.options.relative_offset_mult = parseInt(context.metadata.rel_mult) ; // TODO: get from CU_data.metadata.xxxxx
           else context.options.relative_offset_mult = WORD_BYTES ;

           if ( (typeof context.metadata != "undefined") && (typeof context.metadata.endian != "undefined") )
                context.options.endian = context.metadata.endian ;  // TODO: get from CU_data.metadata.xxxxx
           else context.options.endian = 'little' ;

	   // Fill register names
           for (i=0; i<CU_data.components.length; i++)
           {
               if ("int_registers" == CU_data.components[i].type)
               {
                   for (var j=0; j<CU_data.components[i].elements.length; j++)
                   {
                       for (var k=0; k<CU_data.components[i].elements[j].name.length; k++) {
                            context.registers[CU_data.components[i].elements[j].name[k]] = j ;
                       }
                   }
               }

               if ("fp_registers" == CU_data.components[i].type)
               {
                   for (var j=0; j<CU_data.components[i].elements.length; j++)
                   {
                       for (var k=0; k<CU_data.components[i].elements[j].name.length; k++) {
                            context.registers[CU_data.components[i].elements[j].name[k]] = j ;
                       }
                   }
               }

	       // TODO: other types of registers, and double-register naming...
           }

	   // Fill firmware
           context.oc_size_default = 7 ; // TODO: from architecture JSON ?

           context = crasm_prepare_context_firmware(context, CU_data) ;

	   // Fill pseudoinstructions
           context = crasm_prepare_context_pseudoinstructions(context, CU_data) ;

           // return context
	   return context ;
}

