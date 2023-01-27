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

  var uielto_configuration = {

    props:      {
                  id:                     { type: String,  required: true },
                  instructions_packed:    { type: Number,  required: true },
                  autoscroll:             { type: Boolean, required: true },
                  notification_time:      { type: Number,  required: true },
                  instruction_help_size:  { type: Number,  required: true },
                  dark:                   { type: Boolean, required: true },
                  c_debug:                { type: Boolean, required: true }
                },

    methods:    {
                  //Loads the configuration values from cache
                  get_configuration()
                  {
                    if(localStorage.getItem("instructions_packed") != null){
                      app._data.instructions_packed = parseInt(localStorage.getItem("instructions_packed"));
                    }

                    if(localStorage.getItem("autoscroll") != null){
                      app._data.autoscroll = (localStorage.getItem("autoscroll") === "true");
                    }

                    if(localStorage.getItem("notification_time") != null){
                      app._data.notification_time = parseInt(localStorage.getItem("notification_time"));
                    }

                    if(localStorage.getItem("instruction_help_size") != null){
                      app._data.instruction_help_size = parseInt(localStorage.getItem("instruction_help_size"));
                    }
                  },

                  //Verify if dark mode was activated from cache
                  get_dark_mode()
                  {
                    if(localStorage.getItem("dark_mode") != null)
                    {
                      document.getElementsByTagName("body")[0].style = localStorage.getItem("dark_mode");
                      if(localStorage.getItem("dark_mode") == ""){
                        app._data.dark = false;
                      }
                      else{
                        app._data.dark = true;
                      }
                    }
                    else
                    {
                      var default_style = window.matchMedia('(prefers-color-scheme: dark)').matches;
                      if(default_style == true)
                      {
                        document.getElementsByTagName("body")[0].style = "filter: invert(88%) hue-rotate(160deg) !important; background-color: #111 !important;";
                        app._data.dark = true;
                      }
                      else
                      {
                        document.getElementsByTagName("body")[0].style = "";
                        app._data.dark = false;
                      }
                    }
                  },

                  //Change the execution speed
                  change_execution_speed(value)
                  {
                    var prev_instruction_packed = this._props.instructions_packed;
               
                    if (value)
                    {
                      this._props.instructions_packed= this._props.instructions_packed + value;
                      if (this._props.instructions_packed < 1){
                        this._props.instructions_packed = 1;
                      }
                      if (this._props.instructions_packed > 101) {
                        this._props.instructions_packed = 101;
                      }
                    }
                    else
                    {
                      this._props.instructions_packed = parseInt(this._props.instructions_packed);
                    }

                    app._data.instructions_packed = this._props.instructions_packed; 
                     
                    localStorage.setItem("instructions_packed", this._props.instructions_packed);
               
                    //Google Analytics
                    creator_ga('configuration', 'configuration.execution_speed', 'configuration.execution_speed.less_speed_' + (prev_instruction_packed > this._props.instructions_packed).toString()) ;
                  },

                  //Change autoscroll mode
                  change_autoscroll()
                  {
                    this._props.autoscroll= !this._props.autoscroll;
                    localStorage.setItem("autoscroll", this._props.autoscroll);

                    app._data.autoscroll = this._props.autoscroll; 
                
                    //Google Analytics
                    creator_ga('configuration', 'configuration.autoscroll', 'configuration.autoscroll.' + this._props.autoscroll);
                  },
               
                  //change the time a notification is displayed
                  change_notification_time(value)
                  {
                    var prev_notification_time = this._props.notification_time;
                
                    if (value)
                    {
                      this._props.notification_time = this._props.notification_time + value;
                      if (this._props.notification_time < 1000){
                        this._props.notification_time = 1000;
                      }
                      if (this._props.notification_time > 3500) {
                        this._props.notification_time = 3500;
                      }
                    }
                    else
                    {
                      this._props.notification_time = parseInt(this._props.notification_time);
                    }

                    app._data.notification_time = this._props.notification_time; 
               
                    localStorage.setItem("notification_time", this._props.notification_time);
               
                    //Google Analytics
                    creator_ga('configuration', 'configuration.notification_time', 'configuration.notification_time.less_time_' + (prev_notification_time > this._props.notification_time).toString());
                  },

                  //change instruction help size
                  change_instruction_help_size(value)
                  {
                    var prev_instruction_help_size = this._props.instruction_help_size;
                
                    if (value)
                    {
                      this._props.instruction_help_size = this._props.instruction_help_size + value;
                      if (this._props.instruction_help_size < 15){
                        this._props.instruction_help_size = 15;
                      }
                      if (this._props.instruction_help_size > 65) {
                        this._props.instruction_help_size = 65;
                      }
                    }
                    else
                    {
                      this._props.instruction_help_size = parseInt(this._props.instruction_help_size);
                    }

                    app._data.instruction_help_size = this._props.instruction_help_size; 
               
                    localStorage.setItem("instruction_help_size", this._props.instruction_help_size);
               
                    //Google Analytics
                    creator_ga('configuration', 'configuration.instruction_help_size', 'configuration.instruction_help_size.less_size_' + (prev_instruction_help_size > this._props.instruction_help_size).toString());
                  },
                
                  //change the font size
                  /*change_font_size(value){
                    if (value) {
                      this._props.fontSize= this.fontSize + value;
                      if (this._props.fontSize < 8){
                        this._props.fontSize = 8;
                      }
                      if (this._props.fontSize > 48) {
                        this._props.fontSize = 48;
                      }
                    }
                    else {
                      this._props.fontSize = parseInt(this._props.fontSize);
                    }
                
                    document.getElementsByTagName("body")[0].style.fontSize = this._props.fontSize + "px";
                    //localStorage.setItem("fontSize", this._props.fontSize);
                  },*/

                  //Dark  Mode
                  change_dark_mode()
                  {
                    this._props.dark= !this._props.dark;
                    if (this._props.dark)
                    {
                      document.getElementsByTagName("body")[0].style = "filter: invert(88%) hue-rotate(160deg) !important; background-color: #111 !important;";
                      localStorage.setItem("dark_mode", "filter: invert(88%) hue-rotate(160deg) !important; background-color: #111 !important;");
                    }
                    else
                    {
                      document.getElementsByTagName("body")[0].style = "";
                      localStorage.setItem("dark_mode", "");
                    }

                    app._data.dark = this._props.dark; 
                
                    //Google Analytics
                    creator_ga('configuration', 'configuration.dark_mode', 'configuration.dark_mode.' + this._props.dark);
                  },

                  //Debug Mode
                  change_debug_mode()
                  {
                    this._props.c_debug= !this._props.c_debug;
                    app._data.c_debug = this._props.c_debug; 
                
                    //Google Analytics
                    creator_ga('configuration', 'configuration.debug_mode', 'configuration.debug_mode.' + this._props.c_debug);
                  },
                },

    template:     ' <b-modal  :id ="id" ' +
                  '           title="Configuration" ' +
                  '           hide-footer>' +
                  ' ' +
                  '   <b-list-group>' +
                  '     <b-list-group-item class="d-flex justify-content-between align-items-center m-1">' +
                  '       <label for="range-1">Execution Speed:</label>' +
                  '       <b-input-group>' +
                  '         <b-input-group-prepend>' +
                  '           <b-btn variant="outline-secondary" @click="change_execution_speed(-5)">-</b-btn>' +
                  '         </b-input-group-prepend>' +
                  '         <b-form-input id="range-1"' +
                  '                       v-model="instructions_packed" ' +
                  '                       @change="change_execution_speed(0)" ' +
                  '                       type="range" ' +
                  '                       min="1" ' +
                  '                       max="101" ' +
                  '                       step="5" ' +
                  '                       title="Execution Speed">' +
                  '         </b-form-input>' +
                  '         <b-input-group-append>' +
                  '           <b-btn variant="outline-secondary" @click="change_execution_speed(5)">+</b-btn>' +
                  '         </b-input-group-append>' +
                  '       </b-input-group>' +
                  '     </b-list-group-item>' +
                  ' ' +
                  '     <b-list-group-item class="d-flex justify-content-between align-items-center m-1">' +
                  '       <label for="range-2">Execution Autoscroll:</label>' +
                  '       <b-form-checkbox id="range-2"' +
                  '                        v-model="autoscroll" ' +
                  '                        name="check-button" ' +
                  '                        switch ' +
                  '                        size="lg" ' +
                  '                        @change="change_autoscroll">' +
                  '       </b-form-checkbox>' +
                  '     </b-list-group-item>' +
                  ' ' +
                  '     <b-list-group-item class="d-flex justify-content-between align-items-center m-1">' +
                  '       <label for="range-3">Notification Time:</label>' +
                  '       <b-input-group>' +
                  '         <b-input-group-prepend>' +
                  '           <b-btn variant="outline-secondary" @click="change_notification_time(-20)">-</b-btn>' +
                  '         </b-input-group-prepend>' +
                  '         <b-form-input id="range-3"' +
                  '                       v-model="notification_time" ' +
                  '                       @change="change_notification_time(0)" ' +
                  '                       type="range" ' +
                  '                       min="1000" ' +
                  '                       max="3500" ' +
                  '                       step="10" ' +
                  '                       title="Notification Time">' +
                  '         </b-form-input>' +
                  '         <b-input-group-append>' +
                  '           <b-btn variant="outline-secondary" @click="change_notification_time(20)">+</b-btn>' +
                  '         </b-input-group-append>' +
                  '       </b-input-group>' +
                  '     </b-list-group-item>' +
                  ' ' +
                  '     <b-list-group-item class="d-flex justify-content-between align-items-center m-1">' +
                  '       <label for="range-3">Instruction Help Size:</label>' +
                  '       <b-input-group>' +
                  '         <b-input-group-prepend>' +
                  '           <b-btn variant="outline-secondary" @click="change_instruction_help_size(-2)">-</b-btn>' +
                  '         </b-input-group-prepend>' +
                  '         <b-form-input id="range-3"' +
                  '                       v-model="instruction_help_size" ' +
                  '                       @change="change_instruction_help_size(0)" ' +
                  '                       type="range" ' +
                  '                       min="15" ' +
                  '                       max="65" ' +
                  '                       step="2" ' +
                  '                       title="Instruction Help Size">' +
                  '         </b-form-input>' +
                  '         <b-input-group-append>' +
                  '           <b-btn variant="outline-secondary" @click="change_instruction_help_size(2)">+</b-btn>' +
                  '         </b-input-group-append>' +
                  '       </b-input-group>' +
                  '     </b-list-group-item>' +
                  ' ' +
                  /*'     <b-list-group-item class="d-flex justify-content-between align-items-center m-1">' +
                  '       <label for="range-4">Font Size:</label>' +
                  '       <b-input-group>' +
                  '         <b-input-group-prepend>' +
                  '           <b-btn variant="outline-secondary" @click="change_font_size(-1)">-</b-btn>' +
                  '         </b-input-group-prepend>' +
                  '         <b-form-input id="range-4"' +
                  '                       v-model="fontSize" ' +
                  '                       @change="change_font_size(0)" ' +
                  '                       type="range" ' +
                  '                       min="8" ' +
                  '                       max="48" ' +
                  '                       step="1" ' +
                  '                       title="Font Size"> ' +
                  '         </b-form-input>' +
                  '         <b-input-group-append>' +
                  '           <b-btn variant="outline-secondary" @click="change_font_size(1)">+</b-btn>' +
                  '         </b-input-group-append>' +
                  '       </b-input-group>' +
                  '     </b-list-group-item>' +*/
                  ' ' +
                  '     <b-list-group-item class="d-flex justify-content-between align-items-center m-1">' +
                  '       <label for="range-5">Dark Mode:</label>' +
                  '       <b-form-checkbox id="range-5"' +
                  '                        name="check-button"' +
                  '                        switch size="lg"' +
                  '                        v-model="dark" ' +
                  '                        @change="change_dark_mode">' +
                  '       </b-form-checkbox>' +
                  '     </b-list-group-item>' +
                  ' ' +
                  '     <b-list-group-item class="d-flex justify-content-between align-items-center m-1">' +
                  '       <label for="range-6">Debug:</label>' +
                  '       <b-form-checkbox id="range-6"' +
                  '                        v-model="c_debug"' +
                  '                        name="check-button"' +
                  '                        switch size="lg"' +
                  '                        @change="change_debug_mode">' +
                  '       </b-form-checkbox>' +
                  '     </b-list-group-item>' +
                  '   </b-list-group>' +
                  ' ' +
                  ' </b-modal>'

  }

  Vue.component('form-configuration', uielto_configuration) ;


