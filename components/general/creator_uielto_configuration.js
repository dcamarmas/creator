
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

  var uielto_configuration = {

    props:      {
                  id:                     { type: String,  required: true },
                  default_architecture:   { type: String,  required: true },
                  stack_total_list:       { type: Number,  required: true },
                  autoscroll:             { type: Boolean, required: true },
                  notification_time:      { type: Number,  required: true },
                  instruction_help_size:  { type: Number,  required: true },
                  dark:                   { type: Boolean, required: true },
                  c_debug:                { type: Boolean, required: true }
                },

    data:       function () {
                  return {
                    architectures = [
                                      { text: 'None',  value: 'none' },
                                      { text: 'RISC-V (RV32IMFD)',  value: 'RISC-V (RV32IMFD)' },
                                      { text: 'MIPS-32',            value: 'MIPS-32' },
                                    ]

                  }
                },

    methods:    {
                  //Loads the configuration values from cache
                  get_configuration()
                  {
                    if(localStorage.getItem("conf_default_architecture") != null){
                      app._data.default_architecture = localStorage.getItem("conf_default_architecture");
                    }

                    if(localStorage.getItem("conf_stack_total_list") != null){
                      app._data.stack_total_list = parseInt(localStorage.getItem("conf_stack_total_list"));
                    }

                    if(localStorage.getItem("conf_autoscroll") != null){
                      app._data.autoscroll = (localStorage.getItem("conf_autoscroll") === "true");
                    }

                    if(localStorage.getItem("conf_notification_time") != null){
                      app._data.notification_time = parseInt(localStorage.getItem("conf_notification_time"));
                    }

                    if(localStorage.getItem("conf_instruction_help_size") != null){
                      app._data.instruction_help_size = parseInt(localStorage.getItem("conf_instruction_help_size"));
                    }
                  },


                  //Debug Mode
                  change_default_architecture()
                  {
                    
                    this._props.default_architecture = this.default_architecture;
                    app._data.default_architecture   = this._props.default_architecture; 

                    localStorage.setItem("conf_default_architecture", this._props.default_architecture);
                
                    //Google Analytics
                    creator_ga('configuration', 'configuration.default_architecture', 'configuration.default_architecture.' + this._props.default_architecture);
                  },



                  //Verify if dark mode was activated from cache
                  get_dark_mode()
                  {
                    if(localStorage.getItem("conf_dark_mode") != null)
                    {
                      document.getElementsByTagName("body")[0].style = localStorage.getItem("conf_dark_mode");
                      if(localStorage.getItem("conf_dark_mode") == ""){
                        app._data.dark = false;
                      }
                      else{
                        app._data.dark = true;
                      }
                    }
                    else
                    {
                      var default_style = window.matchMedia('(prefers-color-scheme: dark)').matches;
                      if(default_style === true)
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

                  //Change the stack total list values
                  change_stack_max_list(value)
                  {
                    var prev_stack_total_list = this._props.stack_total_list;
               
                    if (value)
                    {
                      this._props.stack_total_list= this._props.stack_total_list + value;
                      if (this._props.stack_total_list < 1){
                        this._props.stack_total_list = 20;
                      }
                      if (this._props.stack_total_list > 500) {
                        this._props.stack_total_list = 500;
                      }
                    }
                    else
                    {
                      this._props.stack_total_list = parseInt(this._props.stack_total_list);
                    }

                    app._data.stack_total_list = this._props.stack_total_list; 
                     
                    localStorage.setItem("conf_stack_total_list", this._props.stack_total_list);
               
                    //Google Analytics
                    creator_ga('configuration', 'configuration.stack_total_list', 'configuration.stack_total_list.speed_' + (prev_stack_total_list > this._props.stack_total_list).toString()) ;
                  },

                  //Change autoscroll mode
                  change_autoscroll()
                  {
                    this._props.autoscroll= !this._props.autoscroll;
                    localStorage.setItem("conf_autoscroll", this._props.autoscroll);

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
               
                    localStorage.setItem("conf_notification_time", this._props.notification_time);
               
                    //Google Analytics
                    creator_ga('configuration', 'configuration.notification_time', 'configuration.notification_time.time_' + (prev_notification_time > this._props.notification_time).toString());
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
               
                    localStorage.setItem("conf_instruction_help_size", this._props.instruction_help_size);
               
                    //Google Analytics
                    creator_ga('configuration', 'configuration.instruction_help_size', 'configuration.instruction_help_size.size_' + (prev_instruction_help_size > this._props.instruction_help_size).toString());
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
                    //localStorage.setItem("conf_fontSize", this._props.fontSize);
                  },*/

                  //Dark  Mode
                  change_dark_mode()
                  {
                    this._props.dark= !this._props.dark;
                    if (this._props.dark)
                    {
                      document.getElementsByTagName("body")[0].style = "filter: invert(88%) hue-rotate(160deg) !important; background-color: #111 !important;";
                      localStorage.setItem("conf_dark_mode", "filter: invert(88%) hue-rotate(160deg) !important; background-color: #111 !important;");
                    }
                    else
                    {
                      document.getElementsByTagName("body")[0].style = "";
                      localStorage.setItem("conf_dark_mode", "");
                    }

                    app._data.dark = this._props.dark; 
                
                    //Google Analytics
                    creator_ga('configuration', 'configuration.dark_mode', 'configuration.dark_mode.' + this._props.dark);
                  },

                  //Debug Mode
                  change_debug_mode()
                  {
                    this._props.c_debug = !this._props.c_debug;
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
                  '     <b-list-group-item class="justify-content-between align-items-center m-1">' +
                  '       <label for="range-5">Default Architecture:</label>' +
                  '         <b-form-select v-model="default_architecture" ' +
                  '                        :options="architectures" ' +
                  '                        size="sm"' +
                  '                        @change="change_default_architecture" ' +
                  '                        title="Default Architecture">' +
                  '         </b-form-select>' +
                  '     </b-list-group-item>' +
                  ' ' +
                  '     <b-list-group-item class="justify-content-between align-items-center m-1">' +
                  '       <label for="range-1">Maximum stack values listed:</label>' +
                  '       <b-input-group>' +
                  '         <b-input-group-prepend>' +
                  '           <b-btn variant="outline-secondary" @click="change_stack_max_list(-5)">-</b-btn>' +
                  '         </b-input-group-prepend>' +
                  '         <b-form-input id="range-1"' +
                  '                       v-model="stack_total_list" ' +
                  '                       @change="change_stack_max_list(0)" ' +
                  '                       type="range" ' +
                  '                       min="20" ' +
                  '                       max="500" ' +
                  '                       step="5" ' +
                  '                       title="Stack max view">' +
                  '         </b-form-input>' +
                  '         <b-input-group-append>' +
                  '           <b-btn variant="outline-secondary" @click="change_stack_max_list(5)">+</b-btn>' +
                  '         </b-input-group-append>' +
                  '       </b-input-group>' +
                  '     </b-list-group-item>' +
                  ' ' +
                  '     <b-list-group-item class="justify-content-between align-items-center m-1">' +
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
                  '     <b-list-group-item class="justify-content-between align-items-center m-1">' +
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
                  '     <b-list-group-item class="justify-content-between align-items-center m-1">' +
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
                  /*'     <b-list-group-item class="justify-content-between align-items-center m-1">' +
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
                  '     <b-list-group-item class="justify-content-between align-items-center m-1">' +
                  '       <label for="range-5">Dark Mode:</label>' +
                  '       <b-form-checkbox id="range-5"' +
                  '                        name="check-button"' +
                  '                        switch size="lg"' +
                  '                        v-model="dark" ' +
                  '                        @change="change_dark_mode">' +
                  '       </b-form-checkbox>' +
                  '     </b-list-group-item>' +
                  ' ' +
                  '     <b-list-group-item class="justify-content-between align-items-center m-1">' +
                  '       <label for="range-6">Debug:</label>' +
                  '       <b-form-checkbox id="range-6"' +
                  '                        v-model="c_debug"' +
                  '                        name="check-button"' +
                  '                        switch size="lg"' +
                  '                        @change="change_debug_mode">' +
                  '       </b-form-checkbox>' +
                  '     </b-list-group-item>' +
                  ' ' +
                  ' </b-modal>'

  }

  Vue.component('form-configuration', uielto_configuration) ;


