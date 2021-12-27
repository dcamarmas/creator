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

  var uielto_instructions_fields = {

        props:      {
                      id:                             { type: String, required: true },
                      title:                          { type: String, required: true },
                      instruction:                    { type: Object, required: true }  
                    },

        data:       function () {
                      return {
                        //Allow instruction with fractioned fields
                        fragmet_data:["inm-signed", "inm-unsigned", "address", "offset_bytes", "offset_words"]
                      }
                    },

        methods:    {
                      //Clean instruction form
                      clean_form(){
                        app._data.formInstruction.name = '';
                        app._data.formInstruction.type = '';
                        app._data.formInstruction.co = '';
                        app._data.formInstruction.cop = '';
                        app._data.formInstruction.nwords = 1;
                        app._data.formInstruction.numfields = "1";
                        app._data.formInstruction.numfieldsAux = "1";
                        app._data.formInstruction.nameField = [];
                        app._data.formInstruction.properties = [];
                        app._data.formInstruction.typeField = [];
                        app._data.formInstruction.startBitField = [];
                        app._data.formInstruction.stopBitField = [];
                        app._data.formInstruction.valueField = [];
                        app._data.formInstruction.separated = [];
                        app._data.formInstruction.assignedCop = false;
                        app._data.formInstruction.signature ='';
                        app._data.formInstruction.signatureRaw = '';
                        app._data.formInstruction.signature_definition = '';
                        app._data.formInstruction.definition = '';
                        app._data.formInstruction.help = '';
                      },
                    },

        template:   '<b-modal :id ="id" ' +
                    '         size="lg" ' +
                    '         :title="title" ' +
                    '         hide-footer' +
                    '         @hidden="clean_form">' +
                    '  <b-form>' +
                    '    <div id="viewFields" >' +
                    '      <div class="col-lg-14 col-sm-14 row">' +
                    '        <div class="col-lg-1 col-1 fields">' +
                    '          ' +
                    '        </div>' +
                    '        <div class="col-lg-2 col-2 fields">' +
                    '          <span class="h6">Name:</span>' +
                    '        </div>' +
                    '        <div class="col-lg-2 col-2 fields">' +
                    '          <span class="h6">Type</span>' +
                    '        </div>' +
                    '          <div class="col-lg-1 col-1 fields">' +
                    '            <span class="h6">Break</span>' +
                    '          </div>' +
                    '        <div class="col-lg-2 col-2 fields">' +
                    '          <span class="h6">Start Bit</span>' +
                    '        </div>' +
                    '        <div class="col-lg-2 col-2 fields">' +
                    '          <span class="h6">End Bit</span>' +
                    '        </div>' +
                    '        <div class="col-lg-2 col-2 fields">' +
                    '          <span class="h6">Value</span>' +
                    '        </div>' +
                    '      </div>' +
                    '' +
                    '      <div v-if="isNaN(parseInt(instruction.numfieldsAux)) == false">' +
                    '        <div v-for="i in parseInt(instruction.numfieldsAux)">' +
                    '          <div class="col-lg-14 col-sm-14 row">' +
                    '            <div class="col-lg-1 col-1 fields">' +
                    '              <span class="h6">Field {{i-1}}</span>' +
                    '            </div>' +
                    '            <div class="col-lg-2 col-2 fields">' +
                    '              <b-form-group>' +
                    '                <b-form-input type="text" ' +
                    '                              v-model="instruction.nameField[i-1]" ' +
                    '                              required ' +
                    '                              size="sm" ' +
                    '                              v-if="(i-1) != 0" ' +
                    '                              disabled ' +
                    '                              title="Field name">' +
                    '                </b-form-input>' +
                    '                <b-form-input type="text" ' +
                    '                              v-model="instruction.nameField[i-1]=instruction.name" ' +
                    '                              required ' +
                    '                              size="sm" ' +
                    '                              v-if="(i-1) == 0"  ' +
                    '                              disabled ' +
                    '                              title="Field name">' +
                    '                </b-form-input>' +
                    '              </b-form-group>' +
                    '            </div>' +
                    '            <div class="col-lg-2 col-2 fields">' +
                    '              <b-form-group>' +
                    '                <b-form-input type="text" ' +
                    '                              v-model="instruction.typeField[i-1]" ' +
                    '                              required ' +
                    '                              size="sm" ' +
                    '                              disabled ' +
                    '                              title="Field type">' +
                    '                </b-form-input>' +
                    '              </b-form-group>' +
                    '            </div>' +
                    '            <div class="col-lg-1 col-1 fields">' +
                    '                <b-form-checkbox :id="\'view-fragment-\'+ i"' +
                    '                                 v-model="instruction.separated[i-1]"' +
                    '                                 v-if="fragmet_data.indexOf(instruction.typeField[i-1]) !== -1"' +
                    '                                 class="ml-3"' +
                    '                                 disabled>' +
                    '            </div>' +
                    '            <!-- start bit description -->' +
                    '            <div class="col-lg-2 col-2 fields">' +
                    '              <b-form-group>' +
                    '                <b-form-input :value="true"' +
                    '                              type="number"' +
                    '                              min="0"' +
                    '                              :max="32 * instruction.nwords - 1"' +
                    '                              v-model="instruction.startBitField[i-1]"' +
                    '                              required ' +
                    '                              size="sm"' +
                    '                              disabled' +
                    '                              v-if="typeof(instruction.startBitField[i-1]) !== \'object\'"' +
                    '                              title="Field start bit">' +
                    '                </b-form-input>' +
                    '                <b-form-input v-else ' +
                    '                              v-for="(j, ind) in instruction.startBitField[i-1]"' +
                    '                              type="number" ' +
                    '                              min="0" ' +
                    '                              :max="32 * instruction.nwords - 1"' +
                    '                              v-model="instruction.startBitField[i-1][ind]" ' +
                    '                              required' +
                    '                              class="mb-2"' +
                    '                              disabled' +
                    '                              title="Field start bit">' +
                    '              </b-form-group>' +
                    '            </div>' +
                    '            <!-- stop bit description -->' +
                    '            <div class="col-lg-2 col-2 fields">' +
                    '              <b-form-group>' +
                    '                <b-form-input type="number"' +
                    '                              min="0"' +
                    '                              :max="32 * instruction.nwords - 1"' +
                    '                              v-model="instruction.stopBitField[i-1]"' +
                    '                              required' +
                    '                              size="sm"' +
                    '                              disabled' +
                    '                              v-if="typeof(instruction.stopBitField[i-1]) !== \'object\'"' +
                    '                              title="Field end bit">' +
                    '                </b-form-input>' +
                    '                <b-form-input v-else v-for="(j, ind) in instruction.stopBitField[i-1]"' +
                    '                              type="number" min="0" :max="32 * instruction.nwords - 1"' +
                    '                              v-model="instruction.stopBitField[i-1][ind]"' +
                    '                              required' +
                    '                              class="mb-2"' +
                    '                              disabled' +
                    '                              title="Field end bit">' +
                    '                </b-form-input>' +
                    '                ' +
                    '              </b-form-group>' +
                    '            </div>' +
                    '            <div class="col-lg-2 col-2 fields" v-if="instruction.typeField[i-1] == \'co\'">' +
                    '              <b-form-group>' +
                    '                <b-form-input type="text" ' +
                    '                              v-model="instruction.co" ' +
                    '                              required ' +
                    '                              size="sm" ' +
                    '                              disabled ' +
                    '                              title="Instruction CO">' +
                    '                </b-form-input>' +
                    '              </b-form-group>' +
                    '            </div>' +
                    '            <div class="col-lg-2 col-2 fields" v-if="instruction.typeField[i-1] == \'cop\'">' +
                    '              <b-form-group>' +
                    '                <b-form-input type="text" ' +
                    '                              v-on:input="debounce(\'instruction.valueField[\'+i+\'-1]\', $event)" ' +
                    '                              :value="instruction.valueField[i-1]" ' +
                    '                              required ' +
                    '                              size="sm" ' +
                    '                              disabled ' +
                    '                              title="Field value">' +
                    '                </b-form-input>' +
                    '              </b-form-group>' +
                    '            </div>' +
                    '          </div>' +
                    '        </div>' +
                    '      </div>' +
                    '    </div>' +
                    '  </b-form>' +
                    '</b-modal>'

  }

  Vue.component('instructions-fields', uielto_instructions_fields) ;