
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

  var uielto_arch_conf = {

    props:      {
                  arch_conf:                  { type: Array,  required: true }
                },

    data:       function () {
                  return {
                    //Architecture configuration table fields
                    arch_fields: ['field', 'value']
                  }
                },

    methods:    {
                  
                },

    template:   '<div class="col-lg-12 col-sm-12 row memoryLayoutDiv mx-0 px-0">' +
                '' +
                '  <div class="col-lg-3 col-sm-12 "></div>' +
                '' +
                '  <!-- Architecture configuration table -->' +
                '  <div class="col-lg-12 col-sm-12 mt-3">' +
                '    <b-table small :items="arch_conf" ' +
                '             :fields="arch_fields" ' +
                '             class="text-center" ' +
                '             sticky-header="60vh"> ' +
                '' +
                '      <!-- For each instruction -->' +
                '' +
                '      <template v-slot:cell(field)="row">' +
                '        <span>{{row.item.name}}</span>' +
                '      </template>' +
                '' +
                '      <template v-slot:cell(value)="row">' +
                '        <span v-if="row.item.name == \'Name\' || row.item.name == \'Bits\' || row.item.name == \'Description\' || row.item.name == \'Main Function\'">' +
                '          {{row.item.value}}' +
                '        </span>' +
                '        <span v-if="row.item.value == \'big_endian\'">' +
                '          Big Endian' +
                '        </span>' +
                '        <span v-if="row.item.value == \'little_endian\'">' +
                '          Little Endian' +
                '        </span>' +
                '        <span v-if="row.item.value == \'0\'">' +
                '          Disabled' +
                '        </span>' +
                '        <span v-if="row.item.value == \'1\'">' +
                '          Enabled' +
                '        </span>' +
                '      </template>' +
                '    </b-table>' +
                '  </div> ' +
                '' +
                '  <div class="col-lg-3 col-sm-12 "></div>' +
                '' +
                '</div>'

  }

  Vue.component('arch-conf', uielto_arch_conf) ;