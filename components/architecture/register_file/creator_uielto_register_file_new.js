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

  var uielto_register_file_new = {

        props:      {
                      id:                             { type: String, required: true } 
                    },

        data:       function () {
                      return {
                        //Register file types
                        register_file_types: componentsTypes,
                        //Modals directives
                        show_modal: false,
                        //Directive form
                        register_file_fields: {
                          name: '',
                          type: '',
                          precision: '',
                        },
                      }
                    },

        methods:    {
                      //Verify all field of new register file
                      verify_new_register_file(evt){
                        evt.preventDefault();

                        if (!this.register_file_fields.name || !this.register_file_fields.type) {
                            show_notification('Please complete all fields', 'danger') ;
                        }
                        else{
                          this.new_register_file();
                        }
                      },

                      //Create a new register file
                      new_register_file(){
                        for (var i = 0; i < architecture_hash.length; i++) {
                          if (this.register_file_fields.name == architecture_hash[i].name) {
                              show_notification('The component already exists', 'danger') ;
                              return;
                          }
                        }

                        this.show_modal = false;

                        var precision = false;
                        if (this.register_file_fields.precision == "precision"){
                            precision = true;
                        }

                        var newComp = {name: this.register_file_fields.name, type: this.register_file_fields.type, double_precision: precision ,elements:[]};
                        architecture.components.push(newComp);
                        var newComponentHash = {name: this.register_file_fields.name, index: architecture_hash.length};
                        architecture_hash.push(newComponentHash);
                      },

                      //Clean register file form
                      clean_form(){
                        this.register_file_fields.name = '';
                        this.register_file_fields.type = '';
                        this.register_file_fields.precision = '';
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

        template:   '<b-modal  :id ="id" ' +
                    '          title = "New Register File"' +
                    '          ok-title="Save" ' +
                    '          @ok="verify_new_register_file" ' +
                    '          v-model="show_modal" ' +
                    '          @hidden="clean_form">' +
                    '  <b-form>' +
                    '    <b-form-group label="Name:">' +
                    '      <b-form-input type="text" ' +
                    '                    v-on:input="debounce(\'register_file_fields.name\', $event)" ' +
                    '                    :value="register_file_fields.name" ' +
                    '                    required ' +
                    '                    placeholder="Enter name" ' +
                    '                    :state="valid(register_file_fields.name)" ' +
                    '                    size="sm" ' +
                    '                    title="New register file name">' +
                    '      </b-form-input>' +
                    '    </b-form-group>' +
                    '    <b-form-group label="Type:">' +
                    '      <b-form-select :options="register_file_types" ' +
                    '                     required ' +
                    '                     v-model="register_file_fields.type" ' +
                    '                     :state="valid(register_file_fields.type)" ' +
                    '                     size="sm"' +
                    '                     title="Register file type">' +
                    '    </b-form-select>' +
                    '    </b-form-group>' +
                    '    <b-form-group v-if="register_file_fields.type == \'floating point\'">' +
                    '      <b-form-checkbox-group v-model="register_file_fields.precision">' +
                    '        <b-form-checkbox value="register_file_fields.precision">' +
                    '          Double Precision' +
                    '        </b-form-checkbox>' +
                    '      </b-form-checkbox-group>' +
                    '    </b-form-group>' +
                    '  </b-form>' +
                    '</b-modal >'

  }

  Vue.component('register-file-new', uielto_register_file_new) ;