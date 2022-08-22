/*
 *  Copyright 2018-2022 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos
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
                      view_pseudoinstruction_modal(elem, index, button){
                        app._data.modalViewPseudoFields.title = "Fields of " + elem;

                        app._data.formPseudoinstruction.name = architecture.pseudoinstructions[index].name;
                        app._data.formPseudoinstruction.nwords = architecture.pseudoinstructions[index].nwords;
                        app._data.formPseudoinstruction.numfields = architecture.pseudoinstructions[index].fields.length;
                        app._data.formPseudoinstruction.numfieldsAux = architecture.pseudoinstructions[index].fields.length;

                        for (var j = 0; j < architecture.pseudoinstructions[index].fields.length; j++){
                          app._data.formPseudoinstruction.nameField[j] = architecture.pseudoinstructions[index].fields[j].name;
                          app._data.formPseudoinstruction.typeField[j] = architecture.pseudoinstructions[index].fields[j].type;
                          app._data.formPseudoinstruction.startBitField[j] = architecture.pseudoinstructions[index].fields[j].startbit;
                          app._data.formPseudoinstruction.stopBitField[j] = architecture.pseudoinstructions[index].fields[j].stopbit;
                        }

                        this.$root.$emit('bv::show::modal', 'fields_pseudoinstructions', button);
                      },

                      //Show edit pseudoinstruction modal
                      edit_pseudoinstruction_modal(elem, index, button){
                        app._data.modalEditPseudoinst.element = elem;
                        app._data.modalEditPseudoinst.index = index;

                        app._data.formPseudoinstruction.name = architecture.pseudoinstructions[index].name;
                        app._data.formPseudoinstruction.nwords = architecture.pseudoinstructions[index].nwords;
                        app._data.formPseudoinstruction.numfields = architecture.pseudoinstructions[index].fields.length;
                        app._data.formPseudoinstruction.numfieldsAux = architecture.pseudoinstructions[index].fields.length;
                        app._data.formPseudoinstruction.signature_definition = architecture.pseudoinstructions[index].signature_definition;
                        app._data.formPseudoinstruction.definition = architecture.pseudoinstructions[index].definition;
                        app._data.formPseudoinstruction.help = architecture.pseudoinstructions[index].help;

                        for (var j = 0; j < architecture.pseudoinstructions[index].fields.length; j++) {
                          app._data.formPseudoinstruction.nameField[j] = architecture.pseudoinstructions[index].fields[j].name;
                          app._data.formPseudoinstruction.typeField[j] = architecture.pseudoinstructions[index].fields[j].type;
                          app._data.formPseudoinstruction.startBitField[j] = architecture.pseudoinstructions[index].fields[j].startbit;
                          app._data.formPseudoinstruction.stopBitField[j] = architecture.pseudoinstructions[index].fields[j].stopbit;
                        }

                        this.generate_signature();

                        this.$root.$emit('bv::show::modal', 'edit_pseudoinstructions', button);
                      },

                      //Show delete pseudoinstruction modal
                      delete_pseudoinstruction_modal(elem, index, button){
                        app._data.modalDeletPseudoinst.index = index;
                        this.$root.$emit('bv::show::modal', 'delete_pseudoinstructions', button);
                      },

                      //Generate the pseudoinstruction signature
                      generate_signature(){
                        var signature = app._data.formPseudoinstruction.signature_definition;

                        var re = new RegExp("^ +");
                        app._data.formPseudoinstruction.signature_definition = app._data.formPseudoinstruction.signature_definition.replace(re, "");

                        re = new RegExp(" +", "g");
                        app._data.formPseudoinstruction.signature_definition = app._data.formPseudoinstruction.signature_definition.replace(re, " ");

                        re = new RegExp("^ +");
                        signature= signature.replace(re, "");

                        re = new RegExp(" +", "g");
                        signature = signature.replace(re, " ");

                        for (var z = 0; z < app._data.formPseudoinstruction.numfields; z++) {
                          re = new RegExp("[Ff]"+z, "g");

                          signature = signature.replace(re, app._data.formPseudoinstruction.typeField[z]);
                        }

                        re = new RegExp(" ", "g");
                        signature = signature.replace(re , ",");

                        var signatureRaw = app._data.formPseudoinstruction.signature_definition;

                        re = new RegExp("^ +");
                        signatureRaw= signatureRaw.replace(re, "");

                        re = new RegExp(" +", "g");
                        signatureRaw = signatureRaw.replace(re, " ");

                        for (var z = 0; z < app._data.formPseudoinstruction.numfields; z++) {
                          re = new RegExp("[Ff]"+z, "g");

                          signatureRaw = signatureRaw.replace(re, app._data.formPseudoinstruction.nameField[z]);
                        }

                        app._data.formPseudoinstruction.signature = signature;
                        app._data.formPseudoinstruction.signatureRaw = signatureRaw;
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