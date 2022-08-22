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
                        //Modals directives
                        show_modal: false
                      }
                    },

        methods:    {
                      //Verify all fields of modify directive
                      verify_edit_arch_field(evt, name){
                        evt.preventDefault();

                        if (!this._props.name || !this._props.action) {
                          show_notification('Please complete all fields', 'danger') ;
                        }
                        else {
                          if(isNaN(parseInt(this._props.size)) && (this._props.action == 'byte' || this._props.action == 'half_word' || this._props.action == 'word' || this._props.action == 'double_word' || this._props.action == 'float' || this._props.action == 'double' || this._props.action == 'space')){
                            show_notification('Please complete all fields', 'danger') ;
                          }
                          else{
                            this.edit_directive(name);
                          }
                        }
                      },

                      //Edit directive
                      edit_directive(name){
                        for (var i = 0; i < architecture.directives.length; i++) {
                          if((this._props.name == architecture.directives[i].name) && (name != this._props.name)){
                            show_notification('The directive already exists', 'danger') ;
                            return;
                          }
                        }

                        this.show_modal = false;
                        console_log(name)
                        for (var i = 0; i < architecture.directives.length; i++) {
                          if(name == architecture.directives[i].name){
                            architecture.directives[i].name = this._props.name;
                            architecture.directives[i].action = this._props.action;
                            if(this._props.action == 'byte' || this._props.action == 'half_word' || this._props.action == 'word' || this._props.action == 'double_word' || this._props.action == 'float' || this._props.action == 'double' || this._props.action == 'space'){
                              architecture.directives[i].size = this._props.size;
                            }
                            else{
                              architecture.directives[i].size = null;
                            }
                            return;
                          }
                        }
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
                    '         :title = "title"' +
                    '         ok-title="Save" ' +
                    '         @ok="verify_edit_arch_field($event, element)" ' +
                    '         v-model="show_modal"> ' +
                    '  <b-form>' +




                    '    <b-form-group label="Value:" ' +
                    '                  v-if="arch_field == \'Name\' || arch_field == \'Main Function\'">' +
                    '      <b-form-input type="text" ' +
                    '                    :state="valid(arch_field_value)" ' +
                    '                    v-on:input="debounce(\'arch_field_value\', $event)" ' +
                    '                    :value="arch_field_value" ' +
                    '                    required ' +
                    '                    placeholder="Enter the new value" ' +
                    '                    size="sm">' +
                    '      </b-form-input>' +
                    '    </b-form-group>' +



                    '    <b-form-group label="Value:" ' +
                    '                  v-if="arch_field == \'Data Format\'">' +
                    '      <b-form-select :options="actionTypes" ' +
                    '                     required ' +
                    '                     v-model="arch_field_value" ' +
                    '                     :state="valid(arch_field_value)" ' +
                    '                     size="sm">' +
                    '      </b-form-select>' +
                    '    </b-form-group>' +



                    /*'    <b-form-group label="Value:" ' +
                    '                  v-if="arch_field == \'Memory Aligment\' || arch_field == \'Passing Convention\' || arch_field == \'Sensitive Register Name\'>' +
                    '      <b-form-checkbox' +
                    '                    :state="valid(size)" ' +
                    '                    v-on:input="debounce(\'size\', $event)" ' +
                    '                    :value="size" ' +
                    '                    required ' +
                    '                    placeholder="Enter size" ' +
                    '                    size="sm" ' +
                    '                    min="0">' +
                    '      </b-form-input>' +
                    '    </b-form-group>' +


                    '    <b-form-group label="Value:" ' +
                    '                  v-if="arch_field == \'Bits\'">' +
                    '      <b-form-input type="number" ' +
                    '                    :state="valid(size)" ' +
                    '                    v-on:input="debounce(\'size\', $event)" ' +
                    '                    :value="size" ' +
                    '                    required ' +
                    '                    placeholder="Enter size" ' +
                    '                    size="sm" ' +
                    '                    min="0" ' +
                    '                    title="Directive size">' +
                    '      </b-form-input>' +
                    '    </b-form-group>' +*/


                    '  </b-form>' +
                    '</b-modal>'

  }

  Vue.component('arch-conf-edit', uielto_arch_conf_edit) ;

  /*Determines the refresh timeout depending on the device being used*/
  function getDebounceTime(){
    if(screen.width > 768){
      return 500;
    }
    else{
      return 1000;
    }
  }