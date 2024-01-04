
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

  var uielto_keyboard = {

  props:      {
                keyboard:   { type: String, required: true },
                enter:      { type: String, required: true }
              },

  data:       function () {
                return {
                  local_keyboard: keyboard,
                }
              },

  methods:    {
                /*Empty keyboard and display*/
                consoleClear(){
                  this.local_keyboard = "";
                  app._data.keyboard = ""; //TODO: vue bidirectional updates
                  app._data.display = ""; //TODO: vue bidirectional updates
                },

                /*Console mutex*/
                consoleEnter(){
                  if(this.local_keyboard != ""){
                    app._data.keyboard = this.local_keyboard; //TODO: vue bidirectional updates
                    run_program = execution_mode ;
                    this.local_keyboard = "";
                  }
                },

                /*Stop user interface refresh*/
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

                  app.$forceUpdate();
                }, getDebounceTime())
                
              },

template:     ' <div>' +
              '   <b-container fluid align-h="start" class="mx-0 px-0">' +
              '     <b-row cols="2" align-h="start">' +
              '       <b-col cols="1">' +
              '         <span class="fa fa-keyboard fa-2x mb-2 consoleIcon"></span>' +
              '       </b-col>' +
              '       <b-col lg="11" cols="12">' +
              '         <b-form-textarea id="textarea_keyboard" ' +
              '                          v-on:input="debounce(\'local_keyboard\', $event)" ' +
              '                          :value="local_keyboard" rows="5" ' +
              '                          no-resize :state = "enter" ' +
              '                          title="Keyboard">' +
              '         </b-form-textarea>' +
              '       </b-col>' +
              '     </b-row>' +
              '   </b-container>' +
              ' ' +
              '   <b-container fluid align-h="end" class="mx-0 px-0">' +
              '     <b-row cols="3" align-h="end">' +
              '       <b-col>' +
              '         <b-button class="btn btn-outline-secondary btn-block menuGroup btn-sm keyboardButton"' +
              '                   @click="consoleClear">' +
              '           <span class="fas fa-broom"></span> ' +
              '           Clear' +
              '         </b-button>' +
              '       </b-col>' +
              '       <b-col>' +
              '         <b-button id="enter_keyboard" ' +
              '                   class="btn btn-outline-secondary btn-block menuGroup btn-sm keyboardButton"' +
              '                   @click="consoleEnter">' +
              '           <span class="fas fa-level-down-alt enterIcon"></span> ' +
              '           Enter' +
              '         </b-button>' +
              '       </b-col>' +
              '     </b-row>' +
              '   </b-container>' +
              ' </div>'

  }

  Vue.component('keyboard', uielto_keyboard)

  /*Determines the refresh timeout depending on the device being used*/
  function getDebounceTime(){
    if(screen.width > 768){
      return 500;
    }
    else{
      return 1000;
    }
  }
