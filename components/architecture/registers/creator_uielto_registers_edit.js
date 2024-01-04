
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

  var uielto_registers_edit = {

    props:      {
                  id:                             { type: String, required: true },
                  title:                          { type: String, required: true },

                  register_file_index:            { type: Number, required: true },
                  register_index:                 { type: Number, required: true },

                  type:                           { type: String, required: true },
                  double_precision:               { type: String, required: true },
                  double_precision_type:          { type: String, required: true },
                  reg_id:                         { type: Number, required: true },
                  simple_reg:                     { type: Array,  required: true },

                  register:                       { type: Object, required: true }
                  
                },

    data:       function () {
                  return {
                    //Modals registers
                    show_modal: false,
                  }
                },

    methods:    {
                  //Check all field of modified register
                  edit_register_verify(evt)
                  {
                    evt.preventDefault();

                    if (this._props.register.name.length === 0 || !this._props.register.name || (typeof(this._props.register.default_value) !== 'undefined' && !(this._props.register.default_value).toString())) {
                      show_notification('Please complete all fields', 'danger') ;
                    }
                    else if(typeof(this._props.register.default_value) !== 'undefined' && isNaN((this._props.register.default_value).toString())){
                      show_notification('The default value must be a number', 'danger') ;
                    }
                    else 
                    {
                      for (var i = 0; i < architecture_hash.length; i++)
                      {
                        for (var j = 0; j < architecture.components[i].elements.length; j++)
                        {
                          for (var z = 0; z < this._props.register.name.length; z++)
                          {
                            if ((architecture.components[i].elements[j].name.includes(this._props.register.name[z]) !== false) && (this._props.register_file_index != i || this._props.register_index != j)){
                                show_notification('The element already exists', 'danger') ;
                                return;
                            }
                          }
                        }
                      }

                      this.edit_register();
                    }
                  },

                  //Modify register
                  edit_register()
                  {
                    this.show_modal = false;
                    
                    Object.assign(architecture.components[this._props.register_file_index].elements[this._props.register_index], this._props.register);

                    show_notification('Register file correctly modified', 'success') ;
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

                  //Convert floating point number to binary
                  float2bin (number)
                  {
                      return float2bin(number) ;
                  },

                  //Convert binary number to hexadecimal number
                  bin2hex(s)
                  {
                      return bin2hex(s) ;
                  },

                  //Convert hexadecimal number to double floating point number
                  hex2double ( hexvalue )
                  {
                      return hex2double(hexvalue) ;
                  },
                },

    template:   '<b-modal :id ="id" ' +
                '         title="Edit register" ' +
                '         ok-title="Save"' +
                '         @ok="edit_register_verify($event)" ' +
                '         v-model="show_modal">' +
                '  <b-form>' +
                '    <b-form-group label="Name:">' +
                '      <b-form-tags' +
                '        v-model="register.name"' +
                '        separator=" ,;"' +
                '        placeholder="Enter new register name"' +
                '        no-add-on-enter' +
                '        required ' +
                '        size="lg"' +
                '        tag-variant="primary"' +
                '        tag-pills ' +
                '        title="Element name"' +
                '      ></b-form-tags>' +
                '    </b-form-group>' +
                '' +
                '    <b-form-group label="ID:">' +
                '      <b-form-input type="text" ' +
                '                    v-model="reg_id" ' +
                '                    required ' +
                '                    size="sm" ' +
                '                    title="Element ID" ' +
                '                    disabled>' +
                '      </b-form-input>' +
                '    </b-form-group>' +
                '' +
                '    <b-form-group label="Default value:"' +
                '                  v-if="double_precision_type != \'linked\'">' +
                '      <b-form-input type="text" ' +
                '                    v-model="register.default_value" ' +
                '                    required ' +
                '                    placeholder="Enter default value" ' +
                '                    :state="valid(register.default_value)" ' +
                '                    size="sm" ' +
                '                    title="Default value">' +
                '      </b-form-input>' +
                '    </b-form-group>' +
                '' +
                '    <b-form-group label="Properties:" v-if="type != \'ctrl_registers\'">' +
                '      <b-form-checkbox-group v-model="register.properties">' +
                '        <b-form-checkbox value="read">Read</b-form-checkbox>' +
                '        <b-form-checkbox value="write">Write</b-form-checkbox>' +
                '        <b-form-checkbox value="ignore_write">Ignore Write</b-form-checkbox>' +
                '        <b-form-checkbox value="saved">Saved</b-form-checkbox>' +
                '        <br>' +
                '        <hr>' +
                '        <b-form-checkbox value="program_counter">Program Counter</b-form-checkbox>' +
                '        <b-form-checkbox value="global_pointer">Global Pointer</b-form-checkbox>' +
                '        <b-form-checkbox value="stack_pointer">Stack Pointer</b-form-checkbox>' +
                '        <b-form-checkbox value="frame_pointer">Frame Pointer</b-form-checkbox>' +
                '        <br>' +
                '        <hr>' +
                '        <b-form-checkbox value="event_signal">Event Signal</b-form-checkbox>' +
                '        <b-form-checkbox value="event_cause">Event Cause</b-form-checkbox>' +
                '        <b-form-checkbox value="status_register">Status Register</b-form-checkbox>' +
                '        <b-form-checkbox value="exception_program_counter">Exception Program Counter</b-form-checkbox>' +
                '      </b-form-checkbox-group>' +
                '      </b-form-checkbox-group>' +
                '    </b-form-group>' +
                '' +
                '    <b-form-group label="Simple Floating Points asociate:" v-if="double_precision == true && double_precision_type == \'linked\'">' +
                '      <div class="col-lg-12 col-sm-12 row m-0">' +
                '        <div class="col-lg-6 col-sm-6">' +
                '          <b-form-select required ' +
                '                         v-model="register.simple_reg[0]" ' +
                '                         :state="valid(register.simple_reg[0])" ' +
                '                         size="sm" ' +
                '                         :options="simple_reg"' +
                '                         title="First part of double">' +
                '          </b-form-select>' +
                '        </div>' +
                '        <div class="col-lg-6 col-sm-6">' +
                '          <b-form-select required ' +
                '                         v-model="register.simple_reg[1]" ' +
                '                         :state="valid(register.simple_reg[1])" ' +
                '                         size="sm" ' +
                '                         :options="simple_reg"' +
                '                         title="Second part of double">' +
                '          </b-form-select>' +
                '        </div>' +
                '      </div>' +
                '    </b-form-group>' +
                '  </b-form>' +
                '</b-modal>'

  }

  Vue.component('registers-edit', uielto_registers_edit) ;