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

  var uielto_pseudoinstructions_fields = {

        props:      {
                      id:                             { type: String, required: true },
                      title:                          { type: String, required: true },
                      pseudoinstruction:              { type: Object, required: true }  
                    },

        data:       function () {
                      return {
                        
                      }
                    },

        methods:    {
                      //Clean instruction form
                      clean_form(){
                        app._data.formPseudoinstruction.name = '';
                        app._data.formPseudoinstruction.nwords = 1;
                        app._data.formPseudoinstruction.numfields = "0";
                        app._data.formPseudoinstruction.numfields = "0";
                        app._data.formPseudoinstruction.nameField = [];
                        app._data.formPseudoinstruction.typeField = [];
                        app._data.formPseudoinstruction.startBitField = [];
                        app._data.formPseudoinstruction.stopBitField = [];
                        app._data.formPseudoinstruction.signature ='';
                        app._data.formPseudoinstruction.signatureRaw = '';
                        app._data.formPseudoinstruction.signature_definition = '';
                        app._data.formPseudoinstruction.definition = '';
                        app._data.formPseudoinstruction.help = '';
                      },
                    },

        template:   '<b-modal :id ="id"' +
                    '         size="lg"' +
                    '         :title="title" ' +
                    '         hide-footer ' +
                    '         @hidden="clean_form">' +
                    '  <b-form>' +
                    '    <div id="viewFieldsPseudo">' +
                    '      <div class="col-lg-12 col-sm-12 row">' +
                    '        <div class="col-lg-2 col-2 fields">' +
                    '          ' +
                    '        </div>' +
                    '        <div class="col-lg-2 col-2 fields">' +
                    '          <span class="h6">Name:</span>' +
                    '        </div>' +
                    '        <div class="col-lg-2 col-2 fields">' +
                    '          <span class="h6">Type</span>' +
                    '        </div>' +
                    '        <div class="col-lg-2 col-2 fields">' +
                    '          <span class="h6">Start Bit</span>' +
                    '        </div>' +
                    '        <div class="col-lg-2 col-2 fields">' +
                    '          <span class="h6">End Bit</span>' +
                    '        </div>' +
                    '        <div class="col-lg-2 col-2 fields">' +
                    '' +
                    '        </div>' +
                    '      </div>' +
                    '' +
                    '      <div v-if="isNaN(parseInt(pseudoinstruction.numfieldsAux)) == false">  ' +
                    '        <div v-for="i in parseInt(pseudoinstruction.numfieldsAux)">' +
                    '          <div class="col-lg-12 col-sm-12 row">' +
                    '            <div class="col-lg-2 col-2 fields">' +
                    '              <span class="h6">Field {{i-1}}</span>' +
                    '            </div>' +
                    '            <div class="col-lg-2 col-2 fields">' +
                    '              <b-form-group>' +
                    '                <b-form-input type="text" ' +
                    '                              v-model="pseudoinstruction.nameField[i-1]" ' +
                    '                              required ' +
                    '                              size="sm" ' +
                    '                              disabled ' +
                    '                              title="Field name">' +
                    '                </b-form-input>' +
                    '              </b-form-group>' +
                    '            </div>' +
                    '            <div class="col-lg-2 col-2 fields">' +
                    '              <b-form-group>' +
                    '                <b-form-input v-model="pseudoinstruction.typeField[i-1]" ' +
                    '                              required ' +
                    '                              type="text" ' +
                    '                              size="sm" ' +
                    '                              disabled ' +
                    '                              title="Field type">' +
                    '                </b-form-input>' +
                    '              </b-form-group>' +
                    '            </div>' +
                    '            <div class="col-lg-2 col-2 fields">' +
                    '              <b-form-group>' +
                    '                <b-form-input type="number" ' +
                    '                              min="0" ' +
                    '                              :max="32 * pseudoinstruction.nwords - 1" ' +
                    '                              v-model="pseudoinstruction.startBitField[i-1]" ' +
                    '                              required ' +
                    '                              size="sm" ' +
                    '                              disabled ' +
                    '                              title="Field start bit">' +
                    '                </b-form-input>' +
                    '              </b-form-group>' +
                    '            </div>' +
                    '            <div class="col-lg-2 col-2 fields">' +
                    '              <b-form-group>' +
                    '                <b-form-input type="number" min="0" :max="32 * pseudoinstruction.nwords - 1" v-model="pseudoinstruction.stopBitField[i-1]" required size="sm" disabled title="Field end bit">' +
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

  Vue.component('pseudoinstructions-fields', uielto_pseudoinstructions_fields) ;