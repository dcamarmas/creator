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
                    register_file_types:  [
                                            { text: 'Integer', value: 'integer' },
                                            { text: 'Floating point', value: 'floating point' },
                                            { text: 'Control', value: 'control' }
                                          ],

                    //Directive form
                    register_file_fields: {
                      name: '',
                      type: '',
                      precision: '',
                    },

                    //Modals directives
                    show_modal: false,
                  }
                },

    methods:    {
                  //Verify all field of new register file
                  verify_new_register_file(evt)
                  {
                    evt.preventDefault();

                    if (!this.register_file_fields.name || !this.register_file_fields.type)
                    {
                      show_notification('Please complete all fields', 'danger') ;
                    }
                    else{
                      for (var i = 0; i < architecture_hash.length; i++) {
                        if (this.register_file_fields.name == architecture_hash[i].name)
                        {
                          show_notification('The component already exists', 'danger') ;
                          return;
                        }
                      }

                      this.new_register_file();
                    }
                  },

                  //Create a new register file
                  new_register_file()
                  {
                    this.show_modal = false;

                    var precision = false;
                    if (this.register_file_fields.precision == "precision")
                    {
                      precision = true;
                    }

                    var new_register_file = {
                                              name: this.register_file_fields.name, 
                                              type: this.register_file_fields.type, 
                                              double_precision: precision ,
                                              elements:[]
                                            };
                    architecture.components.push(new_register_file);
                    var new_register_file_hash = {name: this.register_file_fields.name, index: architecture_hash.length};
                    architecture_hash.push(new_register_file_hash);

                    show_notification('Register file correctly created', 'success') ;
                  },

                  //Clean register file form
                  clean_form()
                  {
                    this.register_file_fields.name = '';
                    this.register_file_fields.type = '';
                    this.register_file_fields.precision = '';
                  },

                  //Form validator
                  valid(value)
                  {
                    if(parseInt(value) != 0)
                    {
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

    template:   '<b-modal  :id ="id" ' +
                '          title = "New Register File"' +
                '          ok-title="Save" ' +
                '          @ok="verify_new_register_file" ' +
                '          v-model="show_modal" ' +
                '          @hidden="clean_form">' +
                '  <b-form>' +
                '    <b-form-group label="Name:">' +
                '      <b-form-input type="text" ' +
                '                    v-model="register_file_fields.name" ' +
                '                    required ' +
                '                    placeholder="Enter name" ' +
                '                    :state="valid(register_file_fields.name)" ' +
                '                    size="sm" ' +
                '                    title="New register file name">' +
                '      </b-form-input>' +
                '    </b-form-group>' +
                '' +
                '    <b-form-group label="Type:">' +
                '      <b-form-select :options="register_file_types" ' +
                '                     required ' +
                '                     v-model="register_file_fields.type" ' +
                '                     :state="valid(register_file_fields.type)" ' +
                '                     size="sm"' +
                '                     title="Register file type">' +
                '    </b-form-select>' +
                '    </b-form-group>' +
                '' +
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