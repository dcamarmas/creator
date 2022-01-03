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

  var uielto_register_file_edit = {

        props:      {
                      id:                             { type: String, required: true },
                      title:                          { type: String, required: true },
                      element:                        { type: String, required: true },
                      name:                           { type: String, required: true }
                      
                    },

        data:       function () {
                      return {
                        //Modals directives
                        show_modal: false,
                      }
                    },

        methods:    {
                      //Verify all field of modified register file
                      verify_edit_register_file(evt, comp){
                        evt.preventDefault();

                        if (!this._props.name) {
                            show_notification('Please complete all fields', 'danger') ;
                        }
                        else {
                            this.edit_register_file(comp);
                        }
                      },

                      //Edit the register file
                      edit_register_file(comp){
                        for (var i = 0; i < architecture_hash.length; i++){
                          if ((this._props.name == architecture_hash[i].name) && (comp != this._props.name)){
                              show_notification('The component already exists', 'danger') ;
                              return;
                          }
                        }

                        this.show_modal = false;

                        for (var i = 0; i < architecture_hash.length; i++){
                          if(comp == architecture_hash[i].name){
                            architecture_hash[i].name = this._props.name;
                            architecture.components[i].name = this._props.name;
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
                    '         :title = "title" ' +
                    '         ok-title="Save" ' +
                    '         @ok="verify_edit_register_file($event, element)" ' +
                    '         v-model="show_modal">' +
                    '  <b-form>' +
                    '    <b-form-group label="Name:">' +
                    '      <b-form-input type="text" ' +
                    '                    :state="valid(name)" ' +
                    '                    v-on:input="debounce(\'name\', $event)" ' +
                    '                    :value="name" ' +
                    '                    required ' +
                    '                    placeholder="Enter name" ' +
                    '                    size="sm" ' +
                    '                    title="Name">' +
                    '      </b-form-input>' +
                    '    </b-form-group>' +
                    '  </b-form>' +
                    '</b-modal >'

  }

  Vue.component('register-file-edit', uielto_register_file_edit) ;

  /*Determines the refresh timeout depending on the device being used*/
  function getDebounceTime(){
    if(screen.width > 768){
      return 500;
    }
    else{
      return 1000;
    }
  }