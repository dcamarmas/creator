
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

  var uielto_instructions = {

    props:      {
                  instructions:                     { type: Array,  required: true }
                },

    data:       function () {
                  return {
                    //Instructions table fields
                    instructions_fields: ['name', 'co', 'cop', 'nwords', 'signatureRaw', 'properties', 'clk_cycles', 'fields', 'definition'],
                  }
                },

    methods:    {
                  //Show instruction fields modal
                  view_instructions_modal(name, index, button)
                  {
                    app._data.modal_field_instruction.title       = "Fields of " + name;
                    app._data.modal_field_instruction.index       = index;
                    app._data.modal_field_instruction.instruction = structuredClone(architecture.instructions[index]);

                    this.$root.$emit('bv::show::modal', 'fields_instructions', button);
                  },
                },

    template:   '<div>' +
                '  <!-- Instruction set table -->' +
                '  <div class="col-lg-12 col-sm-12 mt-3">' +
                '    <b-table small :items="instructions" ' +
                '             :fields="instructions_fields" ' +
                '             class="text-center" ' +
                '             sticky-header="60vh"> ' +
                '' +
                '      <!-- Change the title of each column -->' +
                '      <template v-slot:head(cop)="row">' +
                '        Extended CO' +
                '      </template>' +
                '' +
                '      <template v-slot:head(signatureRaw)="row">' +
                '        Instruction syntax' +
                '      </template>' +
                '' +
                '      <!-- For each instruction -->' +
                '' +
                '      <template v-slot:cell(properties)="row">' +
                '        <b-badge class="m-1" v-for="propertie in row.item.properties" pill variant="primary">{{propertie}}</b-badge>' +
                '      </template>' +
                '' +
                '      <template v-slot:cell(signatureRaw)="row">' +
                '          {{row.item.signatureRaw}}' +
                '          <br>' +
                '          {{row.item.signature}}' +
                '      </template>' +
                '' +
                '      <template v-slot:cell(fields)="row">' +
                '        <b-button @click.stop="view_instructions_modal(row.item.name, row.index, $event.target)" ' +
                '                  class="btn btn-outline-secondary btn-sm buttonBackground h-100">' +
                '          View Fields' +
                '        </b-button>' +
                '      </template>' +
                '' +
                '      <template v-slot:cell(definition)="row">' +
                '        <b-form-textarea v-model="row.item.definition" ' +
                '                         disabled ' +
                '                         no-resize ' +
                '                         rows="1" ' +
                '                         max-rows="4"' +
                '                         title="Instruction Definition">' +
                '        </b-form-textarea>' +
                '      </template>' +
                '    </b-table>' +
                '  </div> ' +
                '</div>'

  }

  Vue.component('instructions', uielto_instructions) ;