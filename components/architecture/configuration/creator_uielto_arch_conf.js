
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

  var uielto_arch_conf = {

    props:      {
                  arch_conf:                  { type: Array,  required: true }
                },

    data:       function () {
                  return {
                    //Architecture configuration table fields
                    arch_fields: ['field', 'value', 'actions']
                  }
                },

    methods:    {
                  //Show edit architecture field modal
                  edit_arch_field_modal(field, index, button)
                  {
                    app._data.modal_edit_arch_field.title = "Edit " + field; 
                    app._data.modal_edit_arch_field.field = field; 
                    app._data.modal_edit_arch_field.value = this._props.arch_conf[index].value; 
                    app._data.modal_edit_arch_field.index = index; 

                    this.$root.$emit('bv::show::modal', 'edit_arch_field', button);
                  },

                  //Show reset architecture field modal
                  reset_arch_field_modal(field, index, button)
                  {
                    app._data.modal_reset_arch_field.title = "Reset " + field; 
                    app._data.modal_reset_arch_field.index = index; 
                    
                    this.$root.$emit('bv::show::modal', 'reset_arch_field', button);
                  }
                  
                },

    template:   '<div class="col-lg-12 col-sm-12 row memoryLayoutDiv mx-0 px-0">' +
                '' +
                '  <div class="col-lg-12 col-sm-12">' +
                '    <span class="h6">Architecture general information:</span>' +
                '    <br>' +
                '  </div>' +
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
                '' +
                '      <template v-slot:cell(actions)="row">' +
                '        <b-button @click.stop="edit_arch_field_modal(row.item.name, row.index, $event.target)" ' +
                '                  class="btn btn-outline-secondary btn-sm buttonBackground h-100">' +
                '          <span class="far fa-edit"></span>' +
                '          Edit' +
                '        </b-button>' +
                '        <b-button @click.stop="reset_arch_field_modal(row.item.name, row.index, $event.target)" ' +
                '                  class="btn btn-outline-danger btn-sm buttonBackground h-100">' +
                '          <span class="far fa-trash-alt"></span>' +
                '          Reset' +
                '        </b-button> ' +
                '      </template>' +
                '    </b-table>' +
                '  </div> ' +
                '' +
                '  <div class="col-lg-3 col-sm-12 "></div>' +
                '' +
                '</div>'

  }

  Vue.component('arch-conf', uielto_arch_conf) ;