
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

  var uielto_instruction_help = {
    
    props:      {
                  id:                       { type: String, required: true },
                  architecture_name:        { type: String, required: true },
                  architecture:             { type: Object, required: true },
                  architecture_guide:       { type: String, required: true },
                  instruction_help_size:    { type: Object, required: true }
                   
                },

    data:       function () {
                  return {
                    //Help Filter
                    instHelpFilter: null,

                    //Help table
                    insHelpFields: ['name']
                  }
                },

    methods:   {
                  get_width(){
                    return this._props.instruction_help_size + "vw"
                  }
                },

    template:   '<b-sidebar :id="id" sidebar-class="border-left border-info px-3 py-2" right shadow' + 
                '           title="Instruction Help"' +
                '           :width="get_width()">' +
                ' ' +
                ' <b-form-input id="filter-input"' +
                '               v-model="instHelpFilter"' +
                '               type="search"' +
                '               placeholder="Search instruction"' +
                '               size=sm' +
                ' ></b-form-input>' +
                ' ' +
                ' <br>' +
                ' <a v-if="architecture_guide !=\'\'" target="_blank" :href="architecture_guide"><span class="fas fa-file-pdf"></span> {{architecture_name}} Guide</a>' +
                ' <br>' +
                ' ' +
                ' <b-table small :items="architecture.instructions" ' +
                '                :fields="insHelpFields" ' +
                '                class="text-left help-scroll-y my-3"' +
                '                :filter="instHelpFilter"' +
                '                thead-class="d-none">' +
                ' ' +
                '   <template v-slot:cell(name)="row">' +
                '     <h4>{{row.item.name}}</h4>' +
                '     <em>{{row.item.signatureRaw}}</em>' +
                '     <br>' +
                '     {{row.item.help}}' +
                '   </template>' +
                ' ' +
                ' </b-table>' +
                ' ' +
                '</b-sidebar'
  }

  Vue.component('sidebar-instruction-help', uielto_instruction_help) ;