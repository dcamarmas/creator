
/*
 *  Copyright 2018-2025 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos
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

  var uielto_registers = {

    props:      {
                  registers:                     { type: Array,   required: true },
                  register_file_index:           { type: Number,  required: true }
                },

    data:       function () {
                  return {
                    //Directives table fields
                    registers_fields: ['name', 'ID', 'nbits', 'default_value', 'properties'],
                  }
                },

    methods:    {
                  //Generate new register ID //TODO: improve the search
                  element_id(name, type, double)
                  {
                    var id = 0;
                    for(var i = 0; i < architecture.components.length; i++)
                    {
                      for(var j = 0; j < architecture.components[i].elements.length; j++)
                      {
                        if(architecture.components[i].elements[j].name == name){
                          return id;
                        }
                        if(architecture.components[i].type == type && architecture.components[i].double_precision == double){
                          id++;
                        }
                      }
                    }
                  },
                },

    template:   '<b-table  :items="registers" ' +
                '          class="text-center" ' +
                '          :fields="registers_fields" ' +
                '          v-if="registers.length > 0" ' +
                '          sticky-header>' +
                '' +
                '  <!-- For each register -->' +
                '' +
                '  <template v-slot:cell(name)="row">' +
                '    {{registers[row.index].name.join(\' | \')}}' +
                '  </template>' +
                '' +
                '  <template v-slot:cell(ID)="row">' +
                '    {{element_id(registers[row.index].name, architecture.components[register_file_index].type, architecture.components[register_file_index].double_precision)}}' +
                '  </template>' +
                '' +
                '  <template v-slot:cell(properties)="row">' +
                '    <b-badge class="m-1" v-for="propertie in registers[row.index].properties" pill variant="primary">{{propertie}}</b-badge>' +
                '  </template>' +
                '</b-table>'

  }

  Vue.component('registers', uielto_registers) ;