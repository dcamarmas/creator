/*
 *  Copyright 2018-2021 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos
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
                      id:                             { type: String, required: true }
                      
                    },

        data:       function () {
                      return {
                        //Memory layout form
                        memory_layout: ["", "", "", "", "", ""],
                      }
                    },

        methods:    {
                      //Check de memory layout changes
                      changeMemoryLayout(){
                        var auxMemoryLayout = jQuery.extend(true, {}, architecture.memory_layout);

                        for(var i = 0; i < this.memory_layout.length; i++){
                          if(this.memory_layout[i] != "" && this.memory_layout[i] != null){
                            if(!isNaN(parseInt(this.memory_layout[i]))){
                              auxMemoryLayout[i].value = parseInt(this.memory_layout[i]);
                              if (auxMemoryLayout[i].value < 0) {
                                  show_notification('The value can not be negative', 'danger') ;
                                  return;
                              }
                            }
                            else {
                                  show_notification('The value must be a number', 'danger') ;
                                  return;
                            }
                          }
                        }

                        for(var i = 0; i < 6; i++){
                          for (var j = i; j < 6; j++) {
                            if (auxMemoryLayout[i].value > auxMemoryLayout[j].value) {
                                show_notification('The segment can not be overlap', 'danger') ;
                                return;
                            }
                          }
                        }

                        for(var i = 0; i < 6; i++){
                          architecture.memory_layout[i].value = auxMemoryLayout[i].value;
                        }

                        app._data.architecture = architecture; //TODO: bidirectional

                        backup_stack_address = architecture.memory_layout[4].value;
                        backup_data_address = architecture.memory_layout[3].value;

                        for(var i = 0; i < 6; i++){
                          this.memory_layout[i] = "";
                        }
                        app.$forceUpdate();
                      },

                      //Stop user interface refresh
                      debounce: _.debounce(function (param, e) {
                        console_log(param);
                        console_log(e);

                        e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        var re = new RegExp("'","g");
                        e = e.replace(re, '"');
                        re = new RegExp("[\f]","g");
                        e = e.replace(re, '\\f');
                        re = new RegExp("[\n\]","g");
                        e = e.replace(re, '\\n');
                        re = new RegExp("[\r]","g");
                        e = e.replace(re, '\\r');
                        re = new RegExp("[\t]","g");
                        e = e.replace(re, '\\t');
                        re = new RegExp("[\v]","g");
                        e = e.replace(re, '\\v');

                        if(e == ""){
                          this[param] = null;
                          return;
                        }

                        console_log("this." + param + "= '" + e + "'");

                        eval("this." + param + "= '" + e + "'");

                        //this[param] = e.toString();
                        app.$forceUpdate();
                      }, getDebounceTime())
                    },

        template:   '<b-modal :id ="id" ' +
                    '         title="Change memory layout" ' +
                    '         ok-title="Change" ' +
                    '         @ok="changeMemoryLayout">' +
                    '  <span class="h6">.text Start:</span>' +
                    '  <b-form-input type="text" ' +
                    '                v-on:input="debounce(\'memory_layout[0]\', $event)" ' +
                    '                :value="memory_layout[0]" ' +
                    '                required ' +
                    '                size="sm" ' +
                    '                title=".text start" ' +
                    '                class="memoryLayoutForm">' +
                    '  </b-form-input>' +
                    '  <span class="h6">.text End:</span>' +
                    '  <b-form-input type="text" ' +
                    '                v-on:input="debounce(\'memory_layout[1]\', $event)" ' +
                    '                :value="memory_layout[1]" ' +
                    '                required ' +
                    '                size="sm" ' +
                    '                title=".text end" ' +
                    '                class="memoryLayoutForm">' +
                    '  </b-form-input>' +
                    '  <span class="h6">.data Start:</span>' +
                    '  <b-form-input type="text" ' +
                    '                v-on:input="debounce(\'memory_layout[2]\', $event)" ' +
                    '                :value="memory_layout[2]" ' +
                    '                required ' +
                    '                size="sm" ' +
                    '                title=".data tart" ' +
                    '                class="memoryLayoutForm">' +
                    '  </b-form-input>' +
                    '  <span class="h6">.data End:</span>' +
                    '  <b-form-input type="text" ' +
                    '                v-on:input="debounce(\'memory_layout[3]\', $event)" ' +
                    '                :value="memory_layout[3]" ' +
                    '                required ' +
                    '                size="sm" ' +
                    '                title=".data end" ' +
                    '                class="memoryLayoutForm">' +
                    '  </b-form-input>' +
                    '  <span class="h6">.stack End:</span>' +
                    '  <b-form-input type="text" ' +
                    '                v-on:input="debounce(\'memory_layout[4]\', $event)" ' +
                    '                :value="memory_layout[4]" ' +
                    '                required ' +
                    '                size="sm" ' +
                    '                title=".stack start" ' +
                    '                class="memoryLayoutForm">' +
                    '  </b-form-input>' +
                    '  <span class="h6">.stack Start:</span>' +
                    '  <b-form-input type="text" ' +
                    '                v-on:input="debounce(\'memory_layout[5]\', $event)" ' +
                    '                :value="memory_layout[5]"' +
                    '                required size="sm" ' +
                    '                title=".stack end" ' +
                    '                class="memoryLayoutForm">' +
                    '  </b-form-input>' +
                    '</b-modal>'

  }

  Vue.component('memory-layout-edit', uielto_memory_layout_form) ;