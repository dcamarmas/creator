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

  var uielto_registers_edit = {

        props:      {
                      id:                             { type: String, required: true },
                      element:                        { type: String, required: true },
                      type:                           { type: String, required: true },
                      double_precision:               { type: String, required: true },
                      reg_id:                         { type: Number, required: true },
                      name:                           { type: String, required: true },
                      def_value:                      { type: String, required: true },
                      properties:                     { type: Array,  required: true },
                      precision:                      { type: String, required: true },
                      simple_reg:                     { type: Array,  required: true },
                      simple_1:                        { type: String, required: true },
                      simple_2:                       { type: String, required: true }
                      
                    },

        data:       function () {
                      return {
                        //Modals registers
                        show_modal: false,
                      }
                    },

        methods:    {
                      
                      //Check all field of modified register
                      edit_register_verify(evt, comp){
                        evt.preventDefault();
                        if (this._props.name.length == 0 || !this._props.name || !this._props.def_value) {
                          show_notification('Please complete all fields', 'danger') ;
                        }
                        else if(isNaN(this._props.def_value)){
                          show_notification('The default value must be a number', 'danger') ;
                        }
                        else {
                          this.edit_register(comp);
                        }
                      },

                      //Modify register
                      edit_register(comp){
                        for (var i = 0; i < architecture_hash.length; i++){
                          for (var j = 0; j < architecture.components[i].elements.length; j++){
                            for (var z = 0; z < this._props.name.length; z++){
                              if ((architecture.components[i].elements[j].name.includes(this._props.name[z]) != false) && (comp != this._props.name)){
                                  show_notification('The element already exists', 'danger') ;
                                  return;
                              }
                            }
                          }
                        }

                        this.show_modal = false;

                        for (var i = 0; i < architecture_hash.length; i++){
                          for(var j=0; j < architecture.components[i].elements.length; j++){
                            if(comp == architecture.components[i].elements[j].name){
                              architecture.components[i].elements[j].name = this._props.name;
                              if(architecture.components[i].type == "control" || architecture.components[i].type == "integer"){
                                architecture.components[i].elements[j].default_value = bi_intToBigInt(this._props.def_value,10) ;
                              }
                              else{
                                if(architecture.components[i].double_precision == false){
                                  architecture.components[i].elements[j].default_value = parseFloat(this._props.def_value, 10);
                                }
                                else{

                                  var aux_value;
                                  var aux_sim1;
                                  var aux_sim2;

                                  for (var a = 0; a < architecture_hash.length; a++) {
                                    for (var b = 0; b < architecture.components[a].elements.length; b++) {
                                      if(architecture.components[a].elements[b].name == this._props.simple_1){
                                        aux_sim1 = bin2hex(float2bin(architecture.components[a].elements[b].value));
                                      }
                                      if(architecture.components[a].elements[b].name == this._props.simple_2){
                                        aux_sim2 = bin2hex(float2bin(architecture.components[a].elements[b].value));
                                      }
                                    }
                                  }

                                  aux_value = aux_sim1 + aux_sim2;

                                  architecture.components[i].elements[j].value = hex2double("0x" + aux_value);

                                  architecture.components[i].elements[j].simple_reg[0] = this._props.simple_1;
                                  architecture.components[i].elements[j].simple_reg[1] = this._props.simple_2;
                                }
                              }
                              architecture.components[i].elements[j].properties = this._props.properties;
                            }
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
                    '         title="Edit register" ' +
                    '         ok-title="Save"' +
                    '         @ok="edit_register_verify($event, element)" ' +
                    '         v-model="show_modal">' +
                    '  <b-form>' +
                    '    <b-form-group label="Name:">' +
                    '      <b-form-tags' +
                    '        v-model="name"' +
                    '        separator=" ,;"' +
                    '        placeholder="Enter new register name"' +
                    '        no-add-on-enter' +
                    '        required ' +
                    '        size="lg"' +
                    '        tag-variant="primary"' +
                    '        tag-pills ' +
                    '        title="Element name"' +
                    '      ></b-form-tags>' +
                    '' +
                    '    </b-form-group>' +
                    '    <b-form-group label="ID:">' +
                    '      <b-form-input type="text" ' +
                    '                    v-on:input="debounce(\'reg_id\', $event)" ' +
                    '                    :value="reg_id" ' +
                    '                    required ' +
                    '                    size="sm" ' +
                    '                    title="Element ID" ' +
                    '                    disabled>' +
                    '      </b-form-input>' +
                    '    </b-form-group>' +
                    '    <b-form-group label="Default value:" ' +
                    '                  v-if="double_precision == false">' +
                    '      <b-form-input type="text" ' +
                    '                    v-on:input="debounce(\'def_value\', $event)" ' +
                    '                    :value="def_value" ' +
                    '                    required ' +
                    '                    placeholder="Enter default value" ' +
                    '                    :state="valid(def_value)" ' +
                    '                    size="sm" ' +
                    '                    title="Default value">' +
                    '      </b-form-input>' +
                    '    </b-form-group>' +
                    '    <b-form-group label="Properties:" v-if="type != \'control\'">' +
                    '      <b-form-checkbox-group v-model="properties">' +
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
                    '                         v-model="simple_1" ' +
                    '                         :state="valid(simple_1)" ' +
                    '                         size="sm" ' +
                    '                         :options="simple_reg"' +
                    '                         title="First part of double">' +
                    '          </b-form-select>' +
                    '        </div>' +
                    '        <div class="col-lg-6 col-sm-6">' +
                    '          <b-form-select required ' +
                    '                         v-model="simple_2" ' +
                    '                         :state="valid(simple_2)" ' +
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

  /*Determines the refresh timeout depending on the device being used*/
  function getDebounceTime(){
    if(screen.width > 768){
      return 500;
    }
    else{
      return 1000;
    }
  }