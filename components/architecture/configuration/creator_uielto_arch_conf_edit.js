
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

  var uielto_arch_conf_edit = {

    props:      {
                  id:                             { type: String, required: true },
                  title:                          { type: String, required: true },
                  arch_field:                     { type: String, required: true },
                  arch_field_value:               { type: String, required: true },
                  arch_field_index:               { type: Number, required: true }
                  
                },

    data:       function () {
                  return {
                    //Data Format types
                    actionTypes:  [
                                    { value: "big_endian", text: 'Big Endian' },
                                    { value: "little_endian", text: 'Little Endian' }
                                  ],

                    //Modals architecture field
                    show_modal: false
                  }
                },

    methods:    {
                  //Verify all fields of modify architecture field
                  verify_edit_arch_field(evt, index)
                  {
                    evt.preventDefault();
                    if (!this._props.arch_field_value) {
                      show_notification('Please complete the fields', 'danger') ;
                    }
                    else {
                      this.edit_arch_field(index);
                    }
                  },

                  //Edit architecture field
                  edit_arch_field(index)
                  { 
                    this.show_modal = false;

                    architecture.arch_conf[index].value = this._props.arch_field_value;

                    if (index === 0) {
                      app._data.architecture_name = architecture.arch_conf[index].value;
                    }

                    show_notification('Architecture field correctly modified', 'success') ;
                  },

                  //Form validator
                  valid(value)
                  {
                    if(parseInt(value) !== 0){
                      if(!value){
                        return false;
                      }
                      else{
                        return true;
                      }
                    }
                    else{
                      return true;
                    }
                  }
                },

    template:   '<b-modal :id ="id" ' +
                '         :title = "title"' +
                '         ok-title="Save" ' +
                '         @ok="verify_edit_arch_field($event, arch_field_index)" ' +
                '         v-model="show_modal"> ' +
                '  <b-form>' +
                '' +
                '    <b-form-group v-if="arch_field == \'Name\' || arch_field == \'Main Function\'">' +
                '      <span>{{arch_field}}:</span>' +
                '      <b-form-input type="text" ' +
                '                    :state="valid(arch_field_value)" ' +
                '                    v-model="arch_field_value" ' +
                '                    required ' +
                '                    placeholder="Enter the new value" ' +
                '                    size="sm">' +
                '      </b-form-input>' +
                '' +
                '    </b-form-group>' +
                '    <b-form-group v-if="arch_field == \'Bits\'">' +
                '      <span>{{arch_field}}:</span>' +
                '      <b-form-input type="number" ' +
                '                    :state="valid(arch_field_value)" ' +
                '                    v-model="arch_field_value" ' +
                '                    required ' +
                '                    placeholder="Enter bits" ' +
                '                    size="sm" ' +
                '                    min="0">' +
                '      </b-form-input>' +
                '    </b-form-group>' +
                '' +
                '    </b-form-group>' +
                '    <b-form-group v-if="arch_field == \'Description\'">' +
                '      <span>{{arch_field}}:</span>' +
                '        <b-form-textarea v-model="arch_field_value" ' +
                '                         no-resize ' +
                '                         rows="1" ' +
                '                         max-rows="4"' +
                '                         title="Architecture Definition">' +
                '        </b-form-textarea>' +
                '    </b-form-group>' +
                '' +
                '    <b-form-group v-if="arch_field == \'Data Format\'">' +
                '      <span>{{arch_field}}:</span>' +
                '      <b-form-select :options="actionTypes" ' +
                '                     required ' +
                '                     v-model="arch_field_value" ' +
                '                     size="sm">' +
                '      </b-form-select>' +
                '    </b-form-group>' +
                '' +
                '    <b-form-group v-if="arch_field == \'Memory Alignment\' || arch_field == \'Passing Convention\' || arch_field == \'Sensitive Register Name\'">' +
                '      <span>{{arch_field}}:</span>' +
                '      <b-form-checkbox' +
                '                  required ' +
                '                  v-model="arch_field_value"' +
                '                  value="1"' +
                '                  unchecked-value="0">' +
                '      </b-form-checkbox>' +
                '    </b-form-group>' +
                '' +
                '  </b-form>' +
                '</b-modal>'

  }

  Vue.component('arch-conf-edit', uielto_arch_conf_edit) ;