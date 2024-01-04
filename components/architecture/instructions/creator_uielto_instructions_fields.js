
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

  var uielto_instructions_fields = {

    props:      {
                  id:                             { type: String, required: true },
                  title:                          { type: String, required: true },
                  index:                          { type: Number, required: true },
                  instruction:                    { type: Object, required: true }  
                },

    data:       function () {
                  return {
                    //Allow instruction with fractioned fields
                    fragmet_data:["inm-signed", "inm-unsigned", "address", "offset_bytes", "offset_words"]
                  }
                },

    methods:    {
                  
                },

    template:   '<b-modal :id ="id" ' +
                '         size="lg" ' +
                '         :title="title" ' +
                '         hide-footer>' +
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
                '      <div>' +
                '        <div v-for="(item, field_index) in instruction.fields">' +
                '          <div class="col-lg-14 col-sm-14 row">' +
                '            <div class="col-lg-1 col-1 fields">' +
                '              <span class="h6">Field {{field_index}}</span>' +
                '            </div>' +
                '            <div class="col-lg-2 col-2 fields">' +
                '              <b-form-group>' +
                '                <b-form-input type="text" ' +
                '                              v-model="instruction.fields[field_index].name" ' +
                '                              required ' +
                '                              size="sm" ' +
                '                              v-if="(field_index) != 0" ' +
                '                              disabled ' +
                '                              title="Field name">' +
                '                </b-form-input>' +
                '                <b-form-input type="text" ' +
                '                              v-model="instruction.fields[field_index].name = instruction.name" ' +
                '                              required ' +
                '                              size="sm" ' +
                '                              v-if="(field_index) == 0"  ' +
                '                              disabled ' +
                '                              title="Field name">' +
                '                </b-form-input>' +
                '              </b-form-group>' +
                '            </div>' +
                '' +
                '            <div class="col-lg-2 col-2 fields">' +
                '              <b-form-group>' +
                '                <b-form-input type="text" ' +
                '                              v-model="instruction.fields[field_index].type" ' +
                '                              required ' +
                '                              size="sm" ' +
                '                              disabled ' +
                '                              title="Field type">' +
                '                </b-form-input>' +
                '              </b-form-group>' +
                '            </div>' +
                '            <div class="col-lg-1 col-1 fields"' +
                '                 v-if="typeof(instruction.separated) !== \'undefined\'">' +
                '                <b-form-checkbox :id="\'view-fragment-\'+ i"' +
                '                                 v-model="instruction.separated[field_index]"' +
                '                                 v-if="fragmet_data.indexOf(instruction.separated[field_index]) !== -1"' +
                '                                 class="ml-3"' +
                '                                 disabled>' +
                '            </div>' +
                '' +
                '            <!-- start bit description -->' +
                '            <div class="col-lg-2 col-2 fields">' +
                '              <b-form-group>' +
                '                <b-form-input v-model="true"' +
                '                              type="number"' +
                '                              min="0"' +
                '                              :max="32 * instruction.nwords - 1"' +
                '                              v-model="instruction.fields[field_index].startbit"' +
                '                              required ' +
                '                              size="sm"' +
                '                              disabled' +
                '                              v-if="typeof(instruction.fields[field_index].startbit) !== \'object\'"' +
                '                              title="Field start bit">' +
                '                </b-form-input>' +
                '                <b-form-input v-else ' +
                '                              v-for="(j, ind) in instruction.fields[field_index].startbit"' +
                '                              type="number" ' +
                '                              min="0" ' +
                '                              :max="32 * instruction.nwords - 1"' +
                '                              v-model="instruction.fields[field_index].startbit[ind]" ' +
                '                              required' +
                '                              class="mb-2"' +
                '                              disabled' +
                '                              title="Field start bit">' +
                '              </b-form-group>' +
                '            </div>' +
                '' +
                '            <!-- stop bit description -->' +
                '            <div class="col-lg-2 col-2 fields">' +
                '              <b-form-group>' +
                '                <b-form-input type="number"' +
                '                              min="0"' +
                '                              :max="32 * instruction.nwords - 1"' +
                '                              v-model="instruction.fields[field_index].stopbit"' +
                '                              required' +
                '                              size="sm"' +
                '                              disabled' +
                '                              v-if="typeof(instruction.fields[field_index].stopbit) !== \'object\'"' +
                '                              title="Field end bit">' +
                '                </b-form-input>' +
                '                <b-form-input v-else v-for="(j, ind) in instruction.fields[field_index].stopbit"' +
                '                              type="number" min="0" :max="32 * instruction.nwords - 1"' +
                '                              v-model="instruction.fields[field_index].stopbit[ind]"' +
                '                              required' +
                '                              class="mb-2"' +
                '                              disabled' +
                '                              title="Field end bit">' +
                '                </b-form-input>' +
                '                ' +
                '              </b-form-group>' +
                '            </div>' +
                '' +
                '            <div class="col-lg-2 col-2 fields" v-if="instruction.fields[field_index].type == \'co\'">' +
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
                '            <div class="col-lg-2 col-2 fields" v-if="instruction.fields[field_index].type == \'cop\'">' +
                '              <b-form-group>' +
                '                <b-form-input type="text" ' +
                '                              v-on:input="debounce(\'instruction.fields[field_index].valueField\', $event)" ' +
                '                              v-model="instruction.fields[field_index].valueField" ' +
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