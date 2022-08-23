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

  var uielto_memory_layout_form = {

        props:      {
                      id:                             { type: String, required: true },
                      memory_layout:                  { type: Array , required: true }
                      
                    },

        data:       function () {
                      return {
                        //Modals memory layout
                        show_modal: false,
                      }
                    },

        methods:    {
                      //Check de memory layout changes
                      verify_edit_memory_layout(evt){
                        evt.preventDefault();

                        for(var i = 0; i < this._props.memory_layout.length; i++){
                          if (!this._props.memory_layout[i]) {
                            show_notification('Please complete all fields', 'danger') ;
                            return;
                          }

                          if(this._props.memory_layout[i] != "" && this._props.memory_layout[i] != null){
                            if(!isNaN(parseInt(this._props.memory_layout[i]))){
                              if (parseInt(this._props.memory_layout[i]) < 0) {
                                show_notification('The value can not be negative', 'danger') ;
                                return;
                              }
                            }
                            else {
                              show_notification('The value must be a number', 'danger') ;
                              return;
                            }
                          }

                          for (var j = i+1; j < this._props.memory_layout.length; j++) {
                            if (parseInt(this._props.memory_layout[i]) >= parseInt(this._props.memory_layout[j])) {
                                show_notification('The segment can not be overlap', 'danger') ;
                                return;
                            }
                          }
                        }

                        this.edit_memory_layout(name);
                      },

                      //Edit memory layout
                      edit_memory_layout(){

                        this.show_modal = false;

                        for(var i = 0; i < this._props.memory_layout.length; i++){
                          architecture.memory_layout[i].value = parseInt(this._props.memory_layout[i]);
                        }

                        app._data.architecture = architecture; //TODO: bidirectional

                        backup_stack_address = architecture.memory_layout[4].value;
                        backup_data_address = architecture.memory_layout[3].value;

                        show_notification('Memory layout correctly modified', 'success') ;
                      },

                      //Form validator
                      valid(value){
                        if(parseInt(value) != 0){
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
                      },
                    },

        template:   '<b-modal :id ="id" ' +
                    '         title="Change memory layout" ' +
                    '         ok-title="Change" ' +
                    '         @ok="verify_edit_memory_layout($event)"' +
                    '         v-model="show_modal"> ' +
                    '  <b-form>' +
                    '    <b-form-group label=".text Start:">' +
                    '      <b-form-input type="text" ' +
                    '                v-model="memory_layout[0]" ' +
                    '                :state="valid(memory_layout[0])" ' +
                    '                required ' +
                    '                size="sm" ' +
                    '                class="memoryLayoutForm">' +
                    '      </b-form-input>' +
                    '    </b-form-group>' +
                    '    <b-form-group label=".text End:">' +
                    '      <b-form-input type="text" ' +
                    '                v-model="memory_layout[1]" ' +
                    '                :state="valid(memory_layout[1])" ' +
                    '                required ' +
                    '                size="sm" ' +
                    '                class="memoryLayoutForm">' +
                    '      </b-form-input>' +
                    '    </b-form-group>' +
                    '    <b-form-group label=".data Start:">' +
                    '      <b-form-input type="text" ' +
                    '                v-model="memory_layout[2]" ' +
                    '                :state="valid(memory_layout[2])" ' +
                    '                required ' +
                    '                size="sm" ' +
                    '                class="memoryLayoutForm">' +
                    '      </b-form-input>' +
                    '    </b-form-group>' +
                    '    <b-form-group label=".data End:">' +
                    '      <b-form-input type="text" ' +
                    '                v-model="memory_layout[3]" ' +
                    '                :state="valid(memory_layout[3])" ' +
                    '                required ' +
                    '                size="sm" ' +
                    '                class="memoryLayoutForm">' +
                    '      </b-form-input>' +
                    '    </b-form-group>' +
                    '    <b-form-group label=".stack End:">' +
                    '      <b-form-input type="text" ' +
                    '                v-model="memory_layout[4]" ' +
                    '                :state="valid(memory_layout[4])" ' +
                    '                required ' +
                    '                size="sm" ' +
                    '                class="memoryLayoutForm">' +
                    '      </b-form-input>' +
                    '    </b-form-group>' +
                    '    <b-form-group label=".stack Start:">' +
                    '      <b-form-input type="text" ' +
                    '                v-model="memory_layout[5]"' +
                    '                :state="valid(memory_layout[5])" ' +
                    '                required size="sm" ' +
                    '                class="memoryLayoutForm">' +
                    '      </b-form-input>' +
                    '    </b-form-group>' +
                    '  </b-form>' +
                    '</b-modal>'

  }

  Vue.component('memory-layout-edit', uielto_memory_layout_form) ;