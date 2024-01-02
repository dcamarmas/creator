
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

  var uielto_pseudoinstructions_fields = {

        props:      {
                      id:                             { type: String, required: true },
                      title:                          { type: String, required: true },
                      index:                          { type: Number, required: true },
                      pseudoinstruction:              { type: Object, required: true }  
                    },

        data:       function () {
                      return {
                        
                      }
                    },

        methods:    {

                    },

        template:   '<b-modal :id ="id"' +
                    '         size="lg"' +
                    '         :title="title" ' +
                    '         hide-footer>' +
                    '  <b-form>' +
                    '    <div id="viewFieldsPseudo">' +
                    '      <div class="col-lg-12 col-sm-12 row">' +
                    '        <div class="col-lg-4 col-4 fields">' +
                    '' +
                    '        </div>' +
                    '        <div class="col-lg-4 col-4 fields">' +
                    '          <span class="h6">Name:</span>' +
                    '        </div>' +
                    '        <div class="col-lg-4 col-4 fields">' +
                    '          <span class="h6">Type</span>' +
                    '        </div>' +
                    '      </div>' +
                    '' +
                    '      <div>  ' +
                    '        <div v-for="(item, field_index) in pseudoinstruction.fields">' +
                    '          <div class="col-lg-12 col-sm-12 row">' +
                    '            <div class="col-lg-4 col-4 fields">' +
                    '              <span class="h6">Field {{field_index}}</span>' +
                    '            </div>' +
                    '            <div class="col-lg-4 col-4 fields">' +
                    '              <b-form-group>' +
                    '                <b-form-input type="text" ' +
                    '                              v-model="pseudoinstruction.fields[field_index].name" ' +
                    '                              required ' +
                    '                              size="sm" ' +
                    '                              disabled ' +
                    '                              title="Field name">' +
                    '                </b-form-input>' +
                    '              </b-form-group>' +
                    '            </div>' +
                    '            <div class="col-lg-4 col-4 fields">' +
                    '              <b-form-group>' +
                    '                <b-form-input v-model="pseudoinstruction.fields[field_index].type" ' +
                    '                              required ' +
                    '                              type="text" ' +
                    '                              size="sm" ' +
                    '                              disabled ' +
                    '                              title="Field type">' +
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