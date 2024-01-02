
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

  var uielto_pseudoinstructions = {

        props:      {
                      pseudoinstructions:                     { type: Array,  required: true }
                    },

        data:       function () {
                      return {
                        //Pseudoinstructions table fields
                        pseudoinstructions_fields: ['name', 'nwords', 'signatureRaw', 'fields', 'definition', 'actions'],
                      }
                    },

        methods:    {
                      //Show pseudoinstruction fields modal
                      view_pseudoinstruction_modal(name, index, button)
                      {
                        app._data.modal_field_pseudoinstruction.title             = "Fields of " + name;
                        app._data.modal_field_pseudoinstruction.index             = index;
                        app._data.modal_field_pseudoinstruction.pseudoinstruction = structuredClone(architecture.pseudoinstructions[index]);

                        this.$root.$emit('bv::show::modal', 'fields_pseudoinstructions', button);
                      },

                      //Show edit pseudoinstruction modal
                      edit_pseudoinstruction_modal(name, index, button)
                      {
                        app._data.modal_edit_pseudoinstruction.title               = "Edit  " + name;
                        app._data.modal_edit_pseudoinstruction.index               = index;
                        app._data.modal_edit_pseudoinstruction.pseudoinstruction = structuredClone(architecture.pseudoinstructions[index]);

                        app._data.modal_edit_pseudoinstruction.number_fields       = app._data.modal_edit_pseudoinstruction.pseudoinstruction.fields.length;

                        this.$root.$emit('bv::show::modal', 'edit_pseudoinstructions', button);
                      },

                      //Show delete pseudoinstruction modal
                      delete_pseudoinstruction_modal(name, index, button)
                      {
                        app._data.modal_delete_pseudoinstruction.title = "Delete " + name;
                        app._data.modal_delete_pseudoinstruction.index = index;

                        this.$root.$emit('bv::show::modal', 'delete_pseudoinstructions', button);
                      },
                    },

        template:   '<div>' +
                    '  <br>' +
                    '  <span class="h6">Pseudoinstructions set:</span>' +
                    '  <br>' +
                    '  <b-button class="btn btn-outline-secondary btn-sm buttonBackground h-100" ' +
                    '            id="newPseudoinstructionsBtn" ' +
                    '            v-b-modal.new_pseudoinstructions> ' +
                    '    <span class="fas fa-plus-circle"></span> ' +
                    '    New Pseudoinstructions' +
                    '  </b-button>' +
                    '' +
                    '  <b-button class="btn btn-outline-danger btn-sm buttonBackground h-100" ' +
                    '            id="resetPseudoinstructions"' +
                    '            v-b-modal.reset_pseudoinstructions> ' +
                    '    <span class="fas fa-power-off"></span> ' +
                    '    Reset Pseudoinstructions' +
                    '  </b-button>' +
                    '' +
                    '  <!-- Pseudoinstruction set table -->' +
                    '  <div class="col-lg-12 col-sm-12 mt-3">' +
                    '    <b-table small ' +
                    '             :items="pseudoinstructions" ' +
                    '             :fields="pseudoinstructions_fields"' +
                    '             class="text-center" ' +
                    '             sticky-header="60vh">' +
                    '' +
                    '      <!-- Change the title of each column -->' +
                    '      <template v-slot:head(signatureRaw)="row">' +
                    '        Instruction syntax' +
                    '      </template>' +
                    '' +
                    '      <!-- For each pseudoinstruction -->' +
                    '' +
                    '      <template v-slot:cell(signatureRaw)="row">' +
                    '        {{row.item.signatureRaw}}' +
                    '        <br>' +
                    '        {{row.item.signature}}' +
                    '      </template>' +
                    '' +
                    '      <template v-slot:cell(fields)="row">' +
                    '        <b-button @click.stop="view_pseudoinstruction_modal(row.item.name, row.index, $event.target)" ' +
                    '                  class="btn btn-outline-secondary btn-sm buttonBackground h-100">' +
                    '          View Fields' +
                    '        </b-button>' +
                    '      </template>' +
                    '' +
                    '      <template v-slot:cell(definition)="row">' +
                    '        <b-form-textarea v-model="row.item.definition" ' +
                    '                         disabled ' +
                    '                         no-resize' +
                    '                         rows="1" ' +
                    '                         max-rows="4"' +
                    '                         title="Pseudoinstruction Definition">' +
                    '        </b-form-textarea>' +
                    '      </template>' +
                    '' +
                    '      <template v-slot:cell(actions)="row">' +
                    '        <b-button @click.stop="edit_pseudoinstruction_modal(row.item.name, row.index, $event.target)" ' +
                    '                  class="btn btn-outline-secondary btn-sm buttonBackground h-100">' +
                    '          <span class="far fa-edit"></span>' +
                    '          Edit' +
                    '        </b-button>' +
                    '        <b-button @click.stop="delete_pseudoinstruction_modal(row.item.name, row.index, $event.target)"' +
                    '                  class="btn btn-outline-danger btn-sm buttonBackground h-100">' +
                    '          <span class="far fa-trash-alt"></span>' +
                    '          Delete' +
                    '        </b-button> ' +
                    '      </template>' +
                    '    </b-table>' +
                    '  </div>' +
                    '</div>'

  }

  Vue.component('pseudoinstructions', uielto_pseudoinstructions) ;