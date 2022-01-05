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

  var uielto_directives_new = {

        props:      {
                      id:                             { type: String, required: true } 
                    },

        data:       function () {
                      return {
                        //Directives types
                        actionTypes: actionTypes,
                        //Modals directives
                        show_modal: false,
                        //Directive form
                        directive_fields:{
                          name: '',
                          action: '',
                          size: 0,
                        },
                      }
                    },

        methods:    {
                      //Verify all fields of new directive
                      verify_new_directive(evt){
                        evt.preventDefault();

                        if (!this.directive_fields.name || !this.directive_fields.action) {
                          show_notification('Please complete all fields', 'danger') ;
                        }
                        else {
                          if(isNaN(parseInt(this.directive_fields.size)) && (this.directive_fields.action == 'byte' || this.directive_fields.action == 'half_word' || this.directive_fields.action == 'word' || this.directive_fields.action == 'double_word' || this.directive_fields.action == 'float' || this.directive_fields.action == 'double' || this.directive_fields.action == 'space')){
                            show_notification('Please complete all fields', 'danger') ;
                          }
                          else{
                            this.add_new_directive();
                          }
                        }
                      },

                      //Create new directive
                      add_new_directive(){
                        for (var i = 0; i < architecture.directives.length; i++) {
                          if(this.directive_fields.name == architecture.directives[i].name){
                            show_notification('The directive already exists', 'danger') ;
                            return;
                          }
                        }

                        this.show_modal = false;

                        if(this.directive_fields.action != 'byte' && this.directive_fields.action != 'half_word' && this.directive_fields.action != 'word' && this.directive_fields.action != 'double_word' && this.directive_fields.action != 'float' && this.directive_fields.action != 'double' && this.directive_fields.action != 'space'){
                          this.directive_fields.size = null;
                        }

                        var newDir = {name: this.directive_fields.name, action: this.directive_fields.action, size: this.directive_fields.size};
                        architecture.directives.push(newDir);
                      },

                      //Clean directive form
                      clean_form(){
                        this.directive_fields.name = '';
                        this.directive_fields.action = '';
                        this.directive_fields.size = 0;
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
                    '         title = "New Directive"' +
                    '         ok-title="Save"' +
                    '         @ok="verify_new_directive($event)"' +
                    '         v-model="show_modal"' +
                    '         @hidden="clean_form">' +
                    '  <b-form>' +
                    '    <b-form-group label="Name:">' +
                    '      <b-form-input type="text"' +
                    '                    :state="valid(directive_fields.name)" ' +
                    '                    v-on:input="debounce(\'directive_fields.name\', $event)" ' +
                    '                    :value="directive_fields.name" ' +
                    '                    required ' +
                    '                    placeholder="Enter name" ' +
                    '                    size="sm" ' +
                    '                    title="Directive name">' +
                    '      </b-form-input>' +
                    '    </b-form-group>' +
                    '    <b-form-group label="action:">' +
                    '      <b-form-select :options="actionTypes" ' +
                    '                     required ' +
                    '                     v-model="directive_fields.action" ' +
                    '                     :state="valid(directive_fields.action)" ' +
                    '                     size="sm"' +
                    '                     title="Action">' +
                    '      </b-form-select>' +
                    '    </b-form-group>' +
                    '    <b-form-group label="Size:" ' +
                    '                  v-if="directive_fields.action != \'\' && directive_fields.action != \'data_segment\' && directive_fields.action != \'code_segment\' && directive_fields.action != \'main_function\' && directive_fields.action != \'kmain_function\' && directive_fields.action != \'global_symbol\' && directive_fields.action != \'data_size\' && directive_fields.action != \'ascii_not_null_end\' && directive_fields.action != \'ascii_null_end\' && directive_fields.action != \'align\'">' +
                    '      <b-form-input type="number" ' +
                    '                    :state="valid(directive_fields.size)" ' +
                    '                    v-on:input="debounce(\'directive_fields.size\', $event)" ' +
                    '                    :value="directive_fields.size" ' +
                    '                    required ' +
                    '                    placeholder="Enter size" ' +
                    '                    size="sm" ' +
                    '                    min="0" ' +
                    '                    title="Directive size">' +
                    '      </b-form-input>' +
                    '    </b-form-group>' +
                    '  </b-form>' +
                    '</b-modal>'

  }

  Vue.component('directives-new', uielto_directives_new) ;

  /*Determines the refresh timeout depending on the device being used*/
  function getDebounceTime(){
    if(screen.width > 768){
      return 500;
    }
    else{
      return 1000;
    }
  }