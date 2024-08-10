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
//  (3/3) Load JSON object to main memory
//

var align = 1 ; // TODO: now align is global in CREATOR :-(

function crasm_obj2mem  ( ret )
{
         var n_bytes   = 0 ;
         var valuebin  = '' ;

         var seg_name_old    = '' ;
         var seg_name        = '' ;
         var last_assig_word = {} ;
         var word_1 = 0 ;
         var word_2 = 0 ;

	 var gen_address = 0 ;
         var label = null ;

         ret.error = null ;
         ret.mp    = {} ;  // TIP: memory will be in creator_memory
         for (let i=0; i<ret.obj.length; i++)
         {
              // (1) detect new seg_name...
              seg_name = ret.obj[i].seg_name ;
	      if (seg_name_old != seg_name) {
                  seg_name_old = seg_name ;
	      }

              // ...update initial word address for this segment if needed...
              if (typeof last_assig_word[seg_name] == "undefined")
              {
                  gen_address = "0x" + ret.obj[i].elto_ptr.toString(16) ;
                  last_assig_word[seg_name] = gen_address ;
              }

              // ... and setup the working address for the new obj[i]
              gen_address = last_assig_word[seg_name] ; // recover last saved value if we switch to other segment

              // skip .byte to .half/.word/... alignment if needed
              if ((i != 0) && (ret.obj[i].seg_name == ret.obj[i-1].seg_name))
              {
                   word_1 = ret.obj[i].elto_ptr - (ret.obj[i-1].elto_ptr + ret.obj[i-1].byte_size) ;
                   if (word_1 > 0) {
		       gen_address = creator_memory_zerofill(parseInt(gen_address), word_1) ;
                   }
              }

              word_1 = (ret.obj[i].elto_ptr   / WORD_BYTES) >>> 0 ;
              word_2 = (parseInt(gen_address) / WORD_BYTES) >>> 0 ;
              if (word_1 > word_2) {
                  gen_address = "0x" + ret.obj[i].elto_ptr.toString(16) ;
              }

              // (2) if .align X then address of next elto must be multiple of 2^X
              if (wsasm_has_datatype_attr(ret.obj[i].datatype, "align")) {
		  align = Math.pow(2, parseInt(ret.obj[i].value)) ; // TODO
                  continue ; // skip align, already memory filled if needed
              }

                  label = null ;
	      if (typeof  ret.hash_labels_asm_rev[gen_address] != "undefined")
	          label = ret.hash_labels_asm_rev[gen_address] ;

              // (3) instructions and data...
              if ('instruction' == ret.obj[i].datatype)
              {
                    n_bytes  = ret.obj[i].binary.length / BYTE_LENGTH ;
                    valuebin = ret.obj[i].binary ;
		    valuehex = parseInt(valuebin, 2) ;
		    valuehex = valuehex.toString(16) ;
                    valuehex = valuehex.padStart(2*WORD_BYTES, '0') ;
		    addrhex  = parseInt(gen_address, 16) ;

                    var r = main_memory_storedata(addrhex, valuehex, n_bytes,
			                          label, ret.obj[i].source, valuehex, "instruction") ;
	            gen_address = "0x" + r.toString(16) ;
              }
              else if (wsasm_has_datatype_attr(ret.obj[i].datatype, "numeric"))
              {
                    n_bytes  = wsasm_get_datatype_size(ret.obj[i].datatype) ;
                    valuebin = ret.obj[i].value.padStart(n_bytes*BYTE_LENGTH, '0') ;
		    valuehex = parseInt(valuebin, 2) ;
		    addrhex  = parseInt(gen_address, 16) ;
		    dtype    = base_replaceAll(ret.obj[i].datatype, '.', '') ; // ".word" -> "word"

		    var r = creator_memory_data_compiler(addrhex, valuehex, n_bytes,
			                                 label,   valuehex, dtype) ;
                    if (r.msg != "") {
                        ret.error = r.msg ;
			return ret ;
                    }

	            gen_address = "0x" + r.data_address.toString(16) ;
              }
              else if (wsasm_has_datatype_attr(ret.obj[i].datatype, "string"))
              {
                    valueascii = '' ;
                    for (let j=0; j<ret.obj[i].value.length; j++) {
                         valueascii = valueascii + String.fromCharCode(ret.obj[i].value[j]) ;
                    }
		    addrhex = parseInt(gen_address, 16) ;

		    gen_address = creator_memory_storestring(valueascii, valueascii.length, addrhex,
			                                     label, "ascii", null);
              }
              else if (wsasm_has_datatype_attr(ret.obj[i].datatype, "space"))
              {
		    addrhex = parseInt(gen_address, 16) ;
		    gen_address = creator_memory_zerofill(addrhex, ret.obj[i].byte_size) ;
              }
              else if ("binary" == ret.obj[i].datatype)
              { 
                    n_bytes  = ret.obj[i].binary.length / BYTE_LENGTH ;
                    valuebin = ret.obj[i].binary ;
		    valuehex = parseInt(valuebin, 2) ;
		    valuehex = valuehex.toString(16) ;
                    valuehex = valuehex.padStart(2*WORD_BYTES, '0') ;
		    addrhex  = parseInt(gen_address, 16) ;

                    var r = main_memory_storedata(addrhex, valuehex, n_bytes,
			                          label, ret.obj[i].source, valuehex, "instruction") ;
	            gen_address = "0x" + r.toString(16) ;
              }

              // keep last assigned address
              last_assig_word[seg_name] = gen_address ;
         }

         // copy back the last asigned address
         for (let seg_name in last_assig_word) {
              ret.seg[seg_name].end = parseInt(last_assig_word[seg_name]) ;
         }

         return ret ;
}

