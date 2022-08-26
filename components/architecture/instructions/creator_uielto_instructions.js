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

  var uielto_instructions = {

    props:      {
                  instructions:                     { type: Array,  required: true }
                },

    data:       function () {
                  return {
                    //Instructions table fields
                    instructions_fields: ['name', 'co', 'cop', 'nwords', 'properties', 'signatureRaw', 'fields', 'definition', 'actions'],
                  }
                },

    methods:    {
                  //Show instruction fields modal
                  view_instructions_modal(name, index, button){
                    app._data.modal_field_instruction.title = "Fields of " + name;
                    app._data.modal_field_instruction.index       = index;
                    app._data.modal_field_instruction.instruction = Object.assign({}, architecture.instructions[index]);

                    this.$root.$emit('bv::show::modal', 'fields_instructions', button);
                  },














                  //Show edit instruction modal
                  edit_instructions_modal(name, index, button){
                    /*app._data.modal_edit_instruction.nameent = name;
                    for (var i = 0; i < architecture.instructions.length; i++) {
                      if(name == architecture.instructions[i].name && co == architecture.instructions[i].co && cop == architecture.instructions[i].cop){
                        app._data.modal_edit_instruction.name = architecture.instructions[i].name;
                        app._data.modal_edit_instruction.type = architecture.instructions[i].type;
                        app._data.modal_edit_instruction.cop = architecture.instructions[i].cop;
                        app._data.modal_edit_instruction.co = architecture.instructions[i].co;
                        app._data.modal_edit_instruction.co = architecture.instructions[i].co;
                        app._data.modal_edit_instruction.cop = architecture.instructions[i].cop;
                        app._data.modal_edit_instruction.nwords = architecture.instructions[i].nwords;
                        app._data.modal_edit_instruction.numfields = architecture.instructions[i].fields.length;
                        app._data.modal_edit_instruction.numfieldsAux = architecture.instructions[i].fields.length;
                        app._data.modal_edit_instruction.signature_definition= architecture.instructions[i].signature_definition;
                        app._data.modal_edit_instruction.definition = architecture.instructions[i].definition;
                        app._data.modal_edit_instruction.help = architecture.instructions[i].help;
                        app._data.modal_edit_instruction.separated = [];
                        app._data.modal_edit_instruction.properties = architecture.instructions[i].properties;

                        for (var j = 0; j < architecture.instructions[i].fields.length; j++) {
                          app._data.modal_edit_instruction.nameField [j]= architecture.instructions[i].fields[j].name;
                          app._data.modal_edit_instruction.typeField[j] = architecture.instructions[i].fields[j].type;
                          //app._data.modal_edit_instruction.startBitField[j] = architecture.instructions[i].fields[j].startbit;
                          //app._data.modal_edit_instruction.stopBitField[j] = architecture.instructions[i].fields[j].stopbit;
                          if (typeof(architecture.instructions[i].separated) === 'undefined' || !architecture.instructions[i].separated[j]) {
                            app._data.modal_edit_instruction.startBitField[j] = architecture.instructions[i].fields[j].startbit;
                            app._data.modal_edit_instruction.stopBitField[j] = architecture.instructions[i].fields[j].stopbit;
                            app._data.modal_edit_instruction.separated.push(false);
                          }
                          else {
                            app._data.modal_edit_instruction.startBitField[j] = [...architecture.instructions[i].fields[j].startbit];
                            app._data.modal_edit_instruction.stopBitField[j] =  [...architecture.instructions[i].fields[j].stopbit];
                            app._data.modal_edit_instruction.separated.push(true);
                          }
                          app._data.modal_edit_instruction.valueField[j] = architecture.instructions[i].fields[j].valueField;
                        }
                        this.generate_signature();
                        break;
                      }
                    }*/

                    app._data.modal_edit_instruction.title       = "Edit  " + name;
                    app._data.modal_edit_instruction.index       = index;
                    app._data.modal_edit_instruction.instruction = Object.assign({}, architecture.instructions[index]);
                    app._data.modal_edit_instruction.numfields   = app._data.modal_edit_instruction.instruction.fields.length;

                    this.$root.$emit('bv::show::modal', 'edit_instructions', button);
                  },










                  //Show delete instruction modal
                  delete_instructions_modal(name, index, button){
                    app._data.modal_delete_instruction.title = "Delete " + name;
                    app._data.modal_delete_instruction.index = index;
                    this.$root.$emit('bv::show::modal', 'delete_instructions', button);
                  },









                  //Generate the instruction signature
                  /*generate_signature(){ //TODO
                    var signature = app._data.form_instruction.signature_definition;

                    var re = new RegExp("^ +");
                    app._data.form_instruction.signature_definition= app._data.form_instruction.signature_definition.replace(re, "");

                    re = new RegExp(" +", "g");
                    app._data.form_instruction.signature_definition = app._data.form_instruction.signature_definition.replace(re, " ");

                    re = new RegExp("^ +");
                    signature= signature.replace(re, "");

                    re = new RegExp(" +", "g");
                    signature = signature.replace(re, " ");

                    for (var z = 0; z < app._data.form_instruction.numfields; z++){
                      re = new RegExp("[Ff]"+z, "g");

                      if(z == 0){
                        signature = signature.replace(re, app._data.form_instruction.name);
                      }
                      else{
                        signature = signature.replace(re, app._data.form_instruction.typeField[z]);
                      }
                    }

                    re = new RegExp(" ", "g");
                    signature = signature.replace(re , ",");

                    var signatureRaw = app._data.form_instruction.signature_definition;

                    re = new RegExp("^ +");
                    signatureRaw= signatureRaw.replace(re, "");

                    re = new RegExp(" +", "g");
                    signatureRaw = signatureRaw.replace(re, " ");

                    for (var z = 0; z < app._data.form_instruction.numfields; z++){
                      re = new RegExp("[Ff]"+z, "g");
                      signatureRaw = signatureRaw.replace(re, app._data.form_instruction.nameField[z]);
                    }

                    app._data.form_instruction.signature = signature;
                    app._data.form_instruction.signatureRaw = signatureRaw;
                  },*/
                },

    template:   '<div>' +
                '  <br>' +
                '  <span class="h6">Instruction set:</span>' +
                '  <br>' +
                '  <b-button class="btn btn-outline-secondary btn-sm buttonBackground h-100" ' +
                '            id="newInstructionBtn" ' +
                '            v-b-modal.new_instructions> ' +
                '    <span class="fas fa-plus-circle"></span>' +
                '    New instruction' +
                '  </b-button>' +
                '' +
                '  <b-button class="btn btn-outline-danger btn-sm buttonBackground h-100" ' +
                '            id="resetInstructions" ' +
                '            v-b-modal.reset_instructions> ' +
                '    <span class="fas fa-power-off"></span> ' +
                '    Reset Instructions' +
                '  </b-button>' +
                '' +
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
                '' +
                '      <template v-slot:cell(actions)="row">' +
                '        <b-button @click.stop="edit_instructions_modal(row.item.name, row.index, $event.target)" ' +
                '                  class="btn btn-outline-secondary btn-sm buttonBackground h-100">' +
                '          <span class="far fa-edit"></span>' +
                '          Edit' +
                '        </b-button>' +
                '        <b-button @click.stop="delete_instructions_modal(row.item.name, row.index, $event.target)" ' +
                '                  class="btn btn-outline-danger btn-sm buttonBackground h-100">' +
                '          <span class="far fa-trash-alt"></span>' +
                '          Delete' +
                '        </b-button> ' +
                '      </template>' +
                '    </b-table>' +
                '  </div> ' +
                '</div>'

  }

  Vue.component('instructions', uielto_instructions) ;