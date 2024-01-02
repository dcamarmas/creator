
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

  var uielto_register_file_new = {

    props:      {
                  id:                             { type: String, required: true } 
                },

    data:       function () {
                  return {
                    //Register file types
                    register_file_types:    [
                                              { text: 'Integer',        value: 'int_registers'  },
                                              { text: 'Floating point', value: 'fp_registers'   },
                                              { text: 'Control',        value: 'ctrl_registers' }
                                            ],

                    double_precision_type:  [
                                              { text: 'Linked',   value: 'linked'   },
                                              { text: 'Extended', value: 'extended' },
                                            ],

                    //Directive form
                    register_file: {
                      name: '',
                      type: '',
                      precision: '',
                      double_precision_type: ''
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

                    if (!this.register_file.name || !this.register_file.type)
                    {
                      show_notification('Please complete all fields', 'danger') ;
                    }
                    else{
                      if (this.register_file.precision.length > 0)
                      {
                        if (!this.register_file.double_precision_type)
                        {
                          show_notification('Please complete all fields', 'danger') ;
                          return;
                        }
                      }
                      
                      for (var i = 0; i < architecture_hash.length; i++) {
                        if (this.register_file.name == architecture_hash[i].name)
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
                    if (this.register_file.precision.length > 0)
                    {
                      precision = true;
                    }

                    if (precision === false)
                    {
                      this.register_file.double_precision_type = '';
                    }

                    var new_register_file = {
                                              name: this.register_file.name, 
                                              type: this.register_file.type, 
                                              double_precision: precision ,
                                              double_precision_type: this.register_file.double_precision_type ,
                                              elements:[]
                                            };

                    architecture.components.push(new_register_file);
                    var new_register_file_hash = {name: this.register_file.name, index: architecture_hash.length};
                    architecture_hash.push(new_register_file_hash);

                    show_notification('Register file correctly created', 'success') ;
                  },

                  //Clean register file form
                  clean_form()
                  {
                    this.register_file.name = '';
                    this.register_file.type = '';
                    this.register_file.precision = '';
                    this.register_file.double_precision_type = '';
                  },

                  //Form validator
                  valid(value)
                  {
                    if(parseInt(value) !== 0)
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
                '                    v-model="register_file.name" ' +
                '                    required ' +
                '                    placeholder="Enter name" ' +
                '                    :state="valid(register_file.name)" ' +
                '                    size="sm" ' +
                '                    title="New register file name">' +
                '      </b-form-input>' +
                '    </b-form-group>' +
                '' +
                '    <b-form-group label="Type:">' +
                '      <b-form-select :options="register_file_types" ' +
                '                     required ' +
                '                     v-model="register_file.type" ' +
                '                     :state="valid(register_file.type)" ' +
                '                     size="sm"' +
                '                     title="Register file type">' +
                '      </b-form-select>' +
                '    </b-form-group>' +
                '' +
                '    <b-form-group v-if="register_file.type == \'fp_registers\'">' +
                '      <b-form-checkbox-group v-model="register_file.precision">' +
                '        <b-form-checkbox value="register_file.precision">' +
                '          Double Precision' +
                '        </b-form-checkbox>' +
                '      </b-form-checkbox-group>' +
                '    </b-form-group>' +
                '' +
                '    <b-form-group label="Double Precision Type:"' +
                '                  v-if="register_file.precision.length > 0">' +
                '      <b-form-select :options="double_precision_type" ' +
                '                     required ' +
                '                     v-model="register_file.double_precision_type" ' +
                '                     :state="valid(register_file.double_precision_type)" ' +
                '                     size="sm"' +
                '                     title="Double Precision type">' +
                '      </b-form-select>' +
                '    </b-form-group>' +
                '' +
                '  </b-form>' +
                '</b-modal >'

  }

  Vue.component('register-file-new', uielto_register_file_new) ;