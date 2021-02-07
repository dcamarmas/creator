/*
 *  Copyright 2018-2021 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos
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
											keyboard:  	{ type: String, required: true },
											enter: 			{ type: String, required: true }
										},

			  methods: 		{
			  							/*Empty keyboard and display*/
								      consoleClear(){
								        app._data.keyboard = ""; //TODO: vue bidirectional updates
								        app._data.display = ""; //TODO: vue bidirectional updates
								      },

								      /*Console mutex*/
								      consoleEnter(){
								        if(keyboard != ""){
								          consoleMutex = true;
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

        template:   	'	<div class="col-rt-12 col-lg-6 col-sm-12 my-2 mx-0 nopadding">' +
											'	  <div class="row col-lg-12 col-sm-12 mx-0 pl-0 nopadding">' +
											'	    <div class="col-lg-1 col-sm-1">' +
											'	      <span class="fa fa-keyboard fa-2x mb-2 consoleIcon"></span>' +
											'	    </div>' +
											'	    <div class="col-lg-11 col-sm-11 pr-0">' +
											'	      <b-form-textarea id="textarea_keyboard" ' +
											'	                       v-on:input="debounce(\'keyboard\', $event)" ' +
											'	                       :value="keyboard" rows="5" ' +
											'	                       no-resize :state = "enter" ' +
											'	                       title="Keyboard">' +
											'	      </b-form-textarea>' +
											'	    </div>' +
											'	  </div>' +
											'	' +
											'	  <div class="col-lg-12 col-sm-12 row nomargin">' +
											'	    <div class="col-lg-4 col-sm-4">' +
											'	     ' +
											'	    </div>' +
											'	    <div class="col-lg-4 col-sm-4">' +
											'	      <b-button class="btn btn-outline-secondary btn-block menuGroup btn-sm keyboardButton"' +
											'	                @click="consoleClear">' +
											'	        <span class="fas fa-broom"></span> ' +
											'	        Clear' +
											'	      </b-button>' +
											'	    </div>' +
											'	    <div class="col-lg-4 col-sm-4">' +
											'	      <b-button id="enter_keyboard" ' +
											'	                class="btn btn-outline-secondary btn-block menuGroup btn-sm keyboardButton"' +
											'	                @click="consoleEnter">' +
											'	        <span class="fas fa-level-down-alt enterIcon"></span> ' +
											'	        Enter' +
											'	      </b-button>' +
											'	    </div>' +
											'	' +
											'	  </div>' +
											'	</div>'
		  
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
