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

  var uielto_registers_new = {

        props:      {
                      id:                             { type: String, required: true },
                      element:                        { type: String, required: true },
                      type:                           { type: String, required: true },
                      double_precision:               { type: String, required: true },
                      reg_id:                         { type: Number, required: true },
                      simple_reg:                     { type: Array,  required: true },
                      bits:                           { type: String, required: true }
                    },

        data:       function () {
                      return {
                        //Modals directives
                        show_modal: false,
                        //Registers form
                        registers_fields: {
                          name: '',
                          id: this._props.reg_id,
                          type: '',
                          defValue: '',
                          properties: [],
                          precision: '',
                        },
                      }
                    },

        methods:    {
                      //Verify all field of new register
                      new_register_verify(evt, comp){
                        if (this.registers_fields.name.length == 0 || !this.registers_fields.name){
                             show_notification('Please complete all fields', 'danger') ;
                        }
                        else{
                          if (!this.registers_fields.defValue && this._props.double_precision == false){
                             show_notification('Please complete all fields', 'danger') ;
                          }
                          else if(isNaN(this.registers_fields.defValue)){
                             show_notification('The default value must be a number', 'danger') ;
                          }
                          else{
                            this.new_register(comp);
                          }
                        }
                      },


                      //Create a new element
                      new_register(comp){
                        for (var i = 0; i < architecture_hash.length; i++){
                          for (var j = 0; j < architecture.components[i].elements.length; j++){
                            for (var z = 0; z < this.registers_fields.name.length; z++){
                              if ((architecture.components[i].elements[j].name.includes(this.registers_fields.name[z]) != false) && (comp != this.registers_fields.name)){
                                  show_notification('The element already exists', 'danger') ;
                                  return;
                              }
                            }
                          }
                        }

                        this.show_modal = false;

                        for (var i = 0; i < architecture_hash.length; i++){
                          if((comp == architecture_hash[i].name)&&(architecture.components[i].type == "integer")){
                            var newElement = {name:this.registers_fields.name, nbits: this._props.bits, value: bi_intToBigInt(this.registers_fields.defValue,10), default_value:bi_intToBigInt(this.registers_fields.defValue,10), properties: this.registers_fields.properties};
                            architecture.components[i].elements.push(newElement);
                            break;
                          }
                          if((comp == architecture_hash[i].name)&&(architecture.components[i].type == "control")){
                            var newElement = {name:this.registers_fields.name, nbits: this._props.bits, value: bi_intToBigInt(this.registers_fields.defValue,10), default_value:bi_intToBigInt(this.registers_fields.defValue,10), properties: ["read", "write"]};
                            architecture.components[i].elements.push(newElement);
                            break;
                          }
                          if((comp == architecture_hash[i].name)&&(architecture.components[i].type == "floating point")&&(architecture.components[i].double_precision == false)){
                            var newElement = {name:this.registers_fields.name, nbits: this._props.bits, value: parseFloat(this.registers_fields.defValue), default_value:parseFloat(this.registers_fields.defValue), properties: this.registers_fields.properties};
                            architecture.components[i].elements.push(newElement);
                            break;
                          }
                          if((comp == architecture_hash[i].name)&&(architecture.components[i].type == "floating point")&&(architecture.components[i].double_precision == true)){
                            var aux_new;
                            var aux_value;
                            var aux_sim1;
                            var aux_sim2;

                            for (var a = 0; a < architecture_hash.length; a++){
                              for (var b = 0; b < architecture.components[a].elements.length; b++) {
                                if(architecture.components[a].elements[b].name == this.registers_fields.simple1){
                                  aux_sim1 = bin2hex(float2bin(architecture.components[a].elements[b].default_value));
                                }
                                if(architecture.components[a].elements[b].name == this.registers_fields.simple2){
                                  aux_sim2 = bin2hex(float2bin(architecture.components[a].elements[b].default_value));
                                }
                              }
                            }

                            aux_value = aux_sim1 + aux_sim2;
                            aux_new = hex2double("0x" + aux_value);

                            var newElement = {name:this.registers_fields.name, nbits: this._props.bits*2, value: aux_new, properties: this.registers_fields.properties};
                            architecture.components[i].elements.push(newElement);
                            break;
                          }
                        }
                      },

                      //Clean register file form
                      clean_form(){
                        this.registers_fields.name = '';
                        this.registers_fields.id = '';
                        this.registers_fields.type = '';
                        this.registers_fields.defValue = '';
                        this.registers_fields.properties = [];
                        this.registers_fields.precision = '';
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
                    '         title = "New Register" ' +
                    '         ok-title="Save" ' +
                    '         @ok="new_register_verify($event, element)" ' +
                    '         v-model="show_modal" ' +
                    '         @hidden="clean_form">' +
                    '  <b-form >' +
                    '    <b-form-group label="Name:">' +
                    '      <b-form-tags' +
                    '        v-model="registers_fields.name"' +
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
                    '    <b-form-group label="ID:">' +
                    '      <b-form-input type="text" ' +
                    '                    v-on:input="debounce(\'reg_id\', $event)" ' +
                    '                    :value="reg_id" ' +
                    '                    required ' +
                    '                    size="sm" ' +
                    '                    title="Element ID"' +
                    '                    disabled>' +
                    '      </b-form-input>' +
                    '    </b-form-group>' +
                    '    <b-form-group label="Default value:" ' +
                    '                  v-if="double_precision == false">' +
                    '      <b-form-input type="text" ' +
                    '                    :state="valid(registers_fields.defValue)" ' +
                    '                    v-on:input="debounce(\'registers_fields.defValue\', $event)" ' +
                    '                    :value="registers_fields.defValue" ' +
                    '                    required ' +
                    '                    placeholder="Enter default value" ' +
                    '                    size="sm" ' +
                    '                    title="Default value">' +
                    '      </b-form-input>' +
                    '    </b-form-group>' +
                    '    <b-form-group v-if="type != \'control\'" label="Properties:">' +
                    '      <b-form-checkbox-group v-model="registers_fields.properties">' +
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
                    '    <b-form-group label="Simple Floating Points asociate:" v-if="double_precision == true">' +
                    '      <div class="col-lg-12 col-sm-12 row m-0">' +
                    '        <div class="col-lg-6 col-sm-6">' +
                    '          <b-form-select required ' +
                    '                         v-model="registers_fields.simple1" ' +
                    '                         :state="valid(registers_fields.simple1)" ' +
                    '                         size="sm" ' +
                    '                         :options="simple_reg"' +
                    '                         title="First part of double">' +
                    '          </b-form-select>' +
                    '        </div>' +
                    '        <div class="col-lg-6 col-sm-6">' +
                    '          <b-form-select required ' +
                    '                         v-model="registers_fields.simple2" ' +
                    '                         :state="valid(registers_fields.simple2)" ' +
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

  /*Determines the refresh timeout depending on the device being used*/
  function getDebounceTime(){
    if(screen.width > 768){
      return 500;
    }
    else{
      return 1000;
    }
  }