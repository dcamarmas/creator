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

  var uielto_directives_edit = {

        props:      {
                      id:                             { type: String, required: true },
                      title:                          { type: String, required: true },
                      element:                        { type: String, required: true },
                      name:                           { type: String, required: true },
                      action:                         { type: String, required: true },
                      size:                           { type: Number, required: true }
                      
                    },

        data:       function () {
                      return {
                        //Directives types
                        actionTypes: actionTypes,
                        //Modals directives
                        show_modal: false,
                      }
                    },

        methods:    {
                      //Verify all fields of modify directive
                      verify_edit_directive(evt, name){
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
                    '         @ok="verify_edit_directive($event, element)" ' +
                    '         v-model="show_modal"> ' +
                    '  <b-form>' +
                    '    <b-form-group label="Name:">' +
                    '      <b-form-input type="text" ' +
                    '                    :state="valid(name)" ' +
                    '                    v-on:input="debounce(\'name\', $event)" ' +
                    '                    :value="name" ' +
                    '                    required ' +
                    '                    placeholder="Enter name" ' +
                    '                    size="sm" ' +
                    '                    title="Directive name">' +
                    '      </b-form-input>' +
                    '    </b-form-group>' +
                    '    <b-form-group label="action:">' +
                    '      <b-form-select :options="actionTypes" ' +
                    '                     required ' +
                    '                     v-model="action" ' +
                    '                     :state="valid(action)" ' +
                    '                     size="sm"' +
                    '                     title="Action">' +
                    '      </b-form-select>' +
                    '    </b-form-group>' +
                    '    <b-form-group label="Size:" ' +
                    '                  v-if="action != \'data_segment\' && action != \'code_segment\' && action != \'main_function\' && action != \'kmain_function\' && action != \'global_symbol\' && action != \'data_size\' && action != \'ascii_not_null_end\' && action != \'ascii_null_end\' && action != \'align\'">' +
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
                    '    </b-form-group>' +
                    '  </b-form>' +
                    '</b-modal>'

  }

  Vue.component('directives-edit', uielto_directives_edit) ;

  /*Determines the refresh timeout depending on the device being used*/
  function getDebounceTime(){
    if(screen.width > 768){
      return 500;
    }
    else{
      return 1000;
    }
  }