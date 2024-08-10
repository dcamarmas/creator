/*
 *  Copyright 2015-2024 Diego Camarmas Alonso, Saul Alonso Monsalve, Javier Prieto Cepeda, Felix Garcia Carballeira, Alejandro Calderon Mateos
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
// Auxiliar function(s)
//

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
// API functions
//

function crasm_compile ( )
{
     var ret = {
             errorcode: "",
             token: "",
             type: "",
             update: "",
             status: "ok"
         } ;

     /* clear memory content */
     creator_memory_clear() ;
     if (typeof app != "undefined") {
         app._data.instructions = [] ;
     }

     /* compile and load */
     ret = crasm_compile_more() ;

     /* if no error then reset user interface */
     if (null == ret.error) {
         uielto_toolbar_btngroup.methods.reset(true) ;
     }

     return ret;
}

function crasm_compile_more ( )
{
     var ret = {
             errorcode: "",
             token: "",
             type: "",
             update: "",
             status: "ok"
         } ;

     instructions     = [] ;
     instructions_tag = [] ;
     elto_inst        = {} ;
     tag_instructions = {} ;
     i = 0;
     j = 0;
     ins_loaded = "" ;
     ins_user   = "" ;


     /* Google Analytics */
     creator_ga('compile', 'compile.binary');


     /* Memory layout */
     architecture.memory_layout[4].value = backup_stack_address;
     architecture.memory_layout[3].value = backup_data_address;

     sim_segments['.data'].begin  = parseInt(architecture.memory_layout[2].value) ;
     sim_segments['.data'].end    = parseInt(architecture.memory_layout[3].value) ;
     sim_segments['.text'].begin  = parseInt(architecture.memory_layout[0].value) ;
     sim_segments['.text'].end    = parseInt(architecture.memory_layout[1].value) ;
     sim_segments['.stack'].begin = parseInt(architecture.memory_layout[4].value) ;
     sim_segments['.stack'].end   = parseInt(architecture.memory_layout[5].value) ;

     for (i = 0; i < architecture.components.length; i++)
     {
          for (j = 0; j < architecture.components[i].elements.length; j++)
          {
               if (architecture.components[i].elements[j].properties.includes("program_counter"))
               {
                   architecture.components[i].elements[j].value          = bi_intToBigInt(sim_segments['.text'].begin, 10) ;
                   architecture.components[i].elements[j].default_value  = bi_intToBigInt(sim_segments['.text'].begin, 10) ;
               }
               if (architecture.components[i].elements[j].properties.includes("stack_pointer"))
               {
                   architecture.components[i].elements[j].value         = bi_intToBigInt(sim_segments['.stack'].begin, 10) ;
                   architecture.components[i].elements[j].default_value = bi_intToBigInt(sim_segments['.stack'].begin, 10) ;
               }
          }
     }

     // Initialize stack
     writeMemory("00", parseInt(sim_segments['.stack'].begin), "word") ;


     /* Reset stats */
     totalStats = 0;
     for (i = 0; i < stats.length; i++)
     {
          stats[i].percentage = 0;
          stats[i].number_instructions = 0;
          stats_value[i] = 0;
     }


     /* Enter the compilated instructions in the text segment */
     code_assembly = '' ;
     if (typeof textarea_assembly_editor != "undefined") {
         code_assembly = textarea_assembly_editor.getValue();
     }

     ret = crasm_src2mem(architecture, code_assembly, {}) ;
     if (ret.error != null) {
         return packCompileError("m0", ret.error, 'error', "danger") ;
     }

     // <DEBUG>: print memory elements at the javascript console
     // main_memory.forEach((element) => console.log(element)) ;
     // </DEBUG>


     /* Save binary */
     if (typeof app != "undefined") {
         instructions = app._data.instructions ;
     }

     for (var i=0; i<ret.obj.length; i++)
     {
          // skip if not instructions...
          if (ret.obj[i].datatype != "instruction") {
              continue ;
          }

          // check if scrambled content...
          if (ret.obj[i].scrambled)
          {
              ins_loaded = "***" ;
              ins_user   = "***" ;
          }
          else
          {
              ins_loaded = ret.obj[i].source_bin ;             // TODO: pseudo vs instruction...
              ins_user   = ret.obj[i].track_source.join(' ') ; // TODO: pseudo vs instruction...
          }

          // add new element for CREATOR ui...
          elto_inst  = {
                          Break:       null,
                          Address:     "0x" + ret.obj[i].elto_ptr.toString(16),
                          Label:       ret.obj[i].labels.join(' '),
                          loaded:      ins_loaded,
                          user:        ins_user,
                          _rowVariant: '',
                          visible:     true,
                          hide:        false
                       } ;

          instructions.push(elto_inst);
     }


     /* Save tags */
     for (let key in ret.labels_asm)
     {
          instructions_tag.push({
                                   tag:  key,
                                   addr: parseInt(ret.labels_asm[key], 16)
                                });
     }


     // save current value as default values for reset()...
     creator_memory_prereset() ;

     return ret;
}


