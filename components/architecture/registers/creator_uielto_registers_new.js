/*
 *  Copyright 2018-2023 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos
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

  var uielto_registers_new = {

    props:      {
                  id:                             { type: String, required: true },
                  register_file_index:            { type: Number, required: true },
                  type:                           { type: String, required: true },
                  double_precision:               { type: String, required: true },
                  double_precision_type:          { type: String, required: true },
                  reg_id:                         { type: Number, required: true },
                  simple_reg:                     { type: Array,  required: true }
                },

    data:       function () {
                  return {
                    //Registers form
                    register: {
                      name: '',
                      id: this._props.reg_id,
                      type: '',
                      default_value: '',
                      properties: [],
                      precision: '',
                    },

                    //Modals directives
                    show_modal: false
                  }
                },

    methods:    {
                  //Verify all field of new register
                  new_register_verify(evt)
                  {
                    evt.preventDefault();
                    
                    if (this.register.name.length == 0 || !this.register.name)
                    {
                         show_notification('Please complete all fields', 'danger') ;
                    }
                    else
                    {
                      if (!this.register.default_value && this._props.double_precision == false){
                         show_notification('Please complete all fields', 'danger') ;
                      }
                      else if(isNaN(this.register.default_value)){
                         show_notification('The default value must be a number', 'danger') ;
                      }
                      else
                      {
                        for (var i = 0; i < architecture_hash.length; i++)
                        {
                          for (var j = 0; j < architecture.components[i].elements.length; j++)
                          {
                            for (var z = 0; z < this.register.name.length; z++)
                            {
                              if ((architecture.components[i].elements[j].name.includes(this.register.name[z]) != false)){
                                  show_notification('The element already exists', 'danger') ;
                                  return;
                              }
                            }
                          }
                        }

                        this.new_register();
                      }
                    }
                  },

                  //Create a new element
                  new_register()
                  {
                    this.show_modal = false;

                    //Add the new register into the register file
                    if(this._props.type == "integer")
                    {
                      var new_element = {
                                          name:this.register.name, 
                                          nbits: parseInt(architecture.arch_conf[1].value), 
                                          value: bi_intToBigInt(this.register.default_value,10), 
                                          default_value:bi_intToBigInt(this.register.default_value,10), 
                                          properties: this.register.properties
                                        };
                      architecture.components[this._props.register_file_index].elements.push(new_element);
                    }
                    if(this._props.type == "control")
                    {
                      var new_element = {
                                          name:this.register.name, 
                                          nbits: parseInt(architecture.arch_conf[1].value), 
                                          value: bi_intToBigInt(this.register.default_value,10), 
                                          default_value:bi_intToBigInt(this.register.default_value,10), 
                                          properties: ["read", "write"]
                                        };
                      architecture.components[this._props.register_file_index].elements.push(new_element);
                    }
                    if((this._props.type == "floating point")&&(this._props.double_precision == false))
                    {
                      var new_element = {
                                          name:this.register.name, 
                                          nbits: parseInt(architecture.arch_conf[1].value), 
                                          value: parseFloat(this.register.default_value), 
                                          default_value:parseFloat(this.register.default_value), 
                                          properties: this.register.properties
                                        };
                      architecture.components[this._props.register_file_index].elements.push(new_element);
                    }
                    if((this._props.type == "floating point")&&(this._props.double_precision == true))
                    {
                      var aux_new;
                      var aux_value;
                      var aux_sim_1;
                      var aux_sim_2;

                      for (var a = 0; a < architecture_hash.length; a++)
                      { //TODO: improve the search
                        for (var b = 0; b < architecture.components[a].elements.length; b++)
                        {
                          if(architecture.components[a].elements[b].name == this.register.simple1){
                            aux_sim_1 = bin2hex(float2bin(architecture.components[a].elements[b].default_value));
                          }
                          if(architecture.components[a].elements[b].name == this.register.simple2){
                            aux_sim_2 = bin2hex(float2bin(architecture.components[a].elements[b].default_value));
                          }
                        }
                      }

                      aux_value = aux_sim_1 + aux_sim_2;
                      aux_new = hex2double("0x" + aux_value);

                      var new_element = {name:this.register.name, nbits: parseInt(architecture.arch_conf[1].value)*2, value: aux_new, properties: this.register.properties};
                      architecture.components[this._props.register_file_index].elements.push(new_element);
                    }

                    show_notification('Register correctly created', 'success') ;
                  },

                  //Clean register file form
                  clean_form()
                  {
                    this.register.name = '';
                    this.register.id = '';
                    this.register.type = '';
                    this.register.default_value = '';
                    this.register.properties = [];
                    this.register.precision = '';
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
                  hex2double ( hexvalue ){
                      return hex2double(hexvalue) ;
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

    template:   '<b-modal :id ="id" ' +
                '         title = "New Register" ' +
                '         ok-title="Save" ' +
                '         @ok="new_register_verify($event)" ' +
                '         v-model="show_modal" ' +
                '         @hidden="clean_form">' +
                '  <b-form >' +
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
                '                    title="Element ID"' +
                '                    disabled>' +
                '      </b-form-input>' +
                '    </b-form-group>' +
                '' +
                '    <b-form-group label="Default value:" ' +
                '                  v-if="double_precision_type != \'linked\'">' +
                '      <b-form-input type="text" ' +
                '                    :state="valid(register.default_value)" ' +
                '                    v-model="register.default_value" ' +
                '                    required ' +
                '                    placeholder="Enter default value" ' +
                '                    size="sm" ' +
                '                    title="Default value">' +
                '      </b-form-input>' +
                '    </b-form-group>' +
                '' +
                '    <b-form-group v-if="type != \'control\'" label="Properties:">' +
                '      <b-form-checkbox-group v-model="register.properties">' +
                '        <b-form-checkbox value="read">Read</b-form-checkbox>' +
                '        <b-form-checkbox value="write">Write</b-form-checkbox>' +
                '        <b-form-checkbox value="ignore_write">Ignore Write</b-form-checkbox>' +
                '        <b-form-checkbox value="saved">Saved</b-form-checkbox>' +
                '        <b-form-checkbox value="pointer">Pointer</b-form-checkbox>' +
                '        <b-form-checkbox value="data">Data</b-form-checkbox>' +
                '        <b-form-checkbox value="code">Code</b-form-checkbox>' +
                '        <b-form-checkbox value="stack">Stack</b-form-checkbox>' +
                '        <b-form-checkbox value="frame">Frame</b-form-checkbox>' +
                '      </b-form-checkbox-group>' +
                '    </b-form-group>' +
                '' +
                '    <b-form-group label="Simple Floating Points asociate:" v-if="double_precision == true  && double_precision_type == \'linked\'">' +
                '      <div class="col-lg-12 col-sm-12 row m-0">' +
                '        <div class="col-lg-6 col-sm-6">' +
                '          <b-form-select required ' +
                '                         v-model="register.simple1" ' +
                '                         :state="valid(register.simple1)" ' +
                '                         size="sm" ' +
                '                         :options="simple_reg"' +
                '                         title="First part of double">' +
                '          </b-form-select>' +
                '        </div>' +
                '        <div class="col-lg-6 col-sm-6">' +
                '          <b-form-select required ' +
                '                         v-model="register.simple2" ' +
                '                         :state="valid(register.simple2)" ' +
                '                         size="sm" ' +
                '                         :options="simple_reg"' +
                '                         title="Second part of double">' +
                '          </b-form-select>' +
                '        </div>' +
                '      </div>' +
                '    </b-form-group>' +
                '  </b-form>' +
                '</b-modal >'

  }

  Vue.component('registers-new', uielto_registers_new) ;