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

        var uielto_data_view_selector = {

        props:      {
                      name_reg:          { type: String, required: true },
                      reg_type:          { type: String, required: true },
                      register_file_num: { type: Number, required: true }
                    },

        data:       function () {
                      return {
                        reg_representation_options: [
                            { text: 'INT Registers', value: 'int' },
                            { text: 'FP Registers', value: 'fp' }
                          ]
                      }
                    },

        methods:    {
                      change_data_view(e, type){
                        app._data.data_mode = e; //TODO: vue bidirectional updates

                        if(e == "registers"){
                          if(type == "int"){
                            app._data.register_type = 'integer'; //TODO: vue bidirectional updates
                            app._data.name_tab_Reg = "Decimal"; //TODO: vue bidirectional updates
                            app._data.name_reg = 'INT Registers'; //TODO: vue bidirectional updates
                            app._data.reg_type = 'int'; //TODO: vue bidirectional updates
                          }
                          else if(type == "fp"){
                            app._data.register_type = 'floating point'; //TODO: vue bidirectional updates
                            app._data.name_tab_Reg = "Real"; //TODO: vue bidirectional updates
                            app._data.name_reg = 'FP Registers'; //TODO: vue bidirectional updates
                            app._data.reg_type = 'fp'; //TODO: vue bidirectional updates
                          }
                        }
                        if(e == "memory"){
                          app._data.data_mode = e; //TODO: vue bidirectional updates
                        }

                        //app.$forceUpdate();

                        /* Google Analytics */
                        creator_ga('send', 'event', 'data', 'data.view', 'data.view.' + app._data.data_mode);
                      }               
                    },

        template:   ' <div class="col-lg-12 col-sm-12 mb-3 px-0">' +
                    '   <div class="col-lg-12 col-sm-12 buttons row">' +
                    '     <div class="col-lg-4 col-sm-4 buttons">' +
                    '       <b-dropdown split ' +
                    '                   right ' +
                    '                   :text="name_reg" ' +
                    '                   size="sm" ' +
                    '                   class="btn btn-block btn-sm nopadding h-100" ' +
                    '                   variant="outline-secondary" ' +
                    '                   @click="change_data_view(\'registers\', reg_type)">' +
                    '         <b-dropdown-item @click="change_data_view(\'registers\', \'int\')">CPU-INT Registers</b-dropdown-item>' +
                    '         <b-dropdown-item @click="change_data_view(\'registers\', \'fp\')">CPU-FP Registers</b-dropdown-item>' +
                    '       </b-dropdown>' +
                    '     </div>' +
                    '     <div class="col-lg-4 col-sm-4 buttons">' +
                    '       <b-button class="btn btn-outline-secondary btn-block opcionsGroup btn-sm h-100" ' +
                    '                 id="memory_btn" ' +
                    '                 @click="change_data_view(\'memory\')">' +
                    '         <span class="fas fa-memory"></span>' +
                    '         Memory ' +
                    '       </b-button>' +
                    '     </div>' +
                    '     <div class="col-lg-4 col-sm-4 buttons">' +
                    '       <b-button class="btn btn-outline-secondary btn-block opcionsGroup btn-sm h-100" ' +
                    '                 id="stats_btn" ' +
                    '                 @click="change_data_view(\'stats\')">' +
                    '         <span class=" fas fa-chart-bar"></span>' +
                    '         Stats' +
                    '       </b-button>' +
                    '     </div>' +
                    '   </div>' +
                    ' </div>'

                    //TODO: not found
                    /*' <div class="col-lg-12 col-sm-12 mb-3 px-0" v-if="register_file_num <= 4">' +
                    '   <b-form-group v-slot="{ ariaDescribedby }">' +
                    '     <b-form-radio-group' +
                    '       id="btn-radios-1"' +
                    '       class="w-100"' +
                    '       v-model="reg_type"' +
                    '       :options="reg_representation_options"' +
                    '       button-variant="outline-secondary"' +
                    '       size="sm"' +
                    '       :aria-describedby="ariaDescribedby"' +
                    '       name="radios-btn-default"' +
                    '       buttons' +
                    '       @click="change_data_view(\'registers\',reg_representation)"' +
                    '     ></b-form-radio-group>' +
                    '   </b-form-group>' +
                    ' </div>'*/
      
        }

        Vue.component('data-view-selector', uielto_data_view_selector) ;

