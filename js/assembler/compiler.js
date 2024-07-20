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


function crasm_src2mem ( datosCU, asm_source, options )
{
     var context = null ;
     var ret = {
                  error: 'UNKNOWN 2'
               } ;

     try
     {
         context = crasm_prepare_context(datosCU, options) ;
	 if (context.error != null) {
	     return context;
	 }

         context = wsasm_prepare_source(context, asm_source) ;
	 if (context.error != null) {
	     return context;
	 }

         ret = wsasm_src2obj(context) ;
	 if (ret.error != null) {
	     return ret;
	 }

         ret = crasm_obj2mem(ret) ;
	 if (ret.error != null) {
	     return ret;
	 }
     }
     catch (e)
     {
         console.log("ERROR on 'crasm_src2mem' function :-(") ;
         console.log("Details:\n " + e) ;
         console.log("Stack:\n"    + e.stack) ;

	 ret.error = "Compilation error found !<br>" +
                     "Please review your assembly code and try another way to write your algorithm.<br>" +
                     "<br>" +
                     e.toString() ;
     }

     return ret ;
}


//
// TODO: next functions is for debugging at the javascript console
//

function crasm_compile ( )
{
     var ret = {
                  error: ''
               } ;

     // get assembly code from textarea...
     code_assembly = '' ;
     if (typeof textarea_assembly_editor != "undefined") {
             code_assembly = textarea_assembly_editor.getValue();
     }

     // clear main_memory...
     creator_memory_clear() ;

     // compile and load into main_memory...
     ret = crasm_src2mem(architecture, code_assembly, {}) ;
     if (ret.error != null) {
         return packCompileError("m0", ret.error, 'error', "danger") ;
     }

     // print memory elements at the javascript console
     main_memory.forEach((element) => console.log(element)) ;

     return ret ;
}


