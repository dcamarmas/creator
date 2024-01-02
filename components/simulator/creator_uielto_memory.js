
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


  /* jshint esversion: 6 */

  var uielto_memory = {

  props:    {
              main_memory:        { type: Array,   required: true },
              memory_segment:     { type: String,  required: true },
              track_stack_names:  { type: Array,   required: true }, // TODO: optional
              callee_subrutine:   { type: String,  required: true }, // TODO: optional
              caller_subrutine:   { type: String,  required: true },  // TODO: optional
              stack_total_list:   { type: Number,  required: true },
              main_memory_busy:   { type: Boolean, required: true }
            },

  data:     function () {
              return {
                //Memory view
                mem_representation: "data_memory",
                mem_representation_options: [
                  { text: 'Data', value: 'data_memory' },
                  { text: 'Text', value: 'instructions_memory' },
                  { text: 'Stack', value: 'stack_memory'}
                ]
              }
            },

  methods:  {
                   
            },

  template: ' <b-container fluid align-h="center" class="mx-0 my-3 px-2">' +
            '   <b-row cols-xl="2" cols-lg="1" cols-md="2" cols-sm="1" cols-xs="1" cols="1">' +
            '     <b-col align-h="center" class="px-2">' +
            '       <div class="border m-1 py-1 px-2">' +
            '         <b-badge variant="light" class="h6 groupLabelling border mx-2 my-0">Main memory segment</b-badge>' +
            '         <b-form-group class="mb-2" v-slot="{ ariaDescribedby }" >' +
            '           <b-form-radio-group' +
            '             id="btn-radios-1"' +
            '             class="w-100"' +
            '             v-model="mem_representation"' +
            '             :options="mem_representation_options"' +
            '             button-variant="outline-secondary"' +
            '             size="sm"' +
            '             :aria-describedby="ariaDescribedby"' +
            '             name="radios-btn-default"' +
            '             buttons' +
            '           ></b-form-radio-group>' +
            '         </b-form-group>' +
            '       </div >' +
            '     </b-col>' +
            '' +
            '     <b-col></b-col>' +
            '   </b-row>' +
            '' +
            '   <b-row cols="1">' +
            '     <b-col align-h="center" class="px-2">' +
            '       <table-mem class="my-2"' +
            '                  :main_memory="main_memory"' +
            '                  :memory_segment="mem_representation"' +
            '                  :track_stack_names="track_stack_names" ' +
            '                  :callee_subrutine="callee_subrutine" ' +
            '                  :caller_subrutine="caller_subrutine"' +
            '                  :stack_total_list="stack_total_list"' +
            '                  :main_memory_busy="main_memory_busy">' +
            '       </table-mem>' +
            '     </b-col>' +
            '   </b-row>' +
            '' +
            ' </b-container>'
  }

  Vue.component('memory', uielto_memory) ;

