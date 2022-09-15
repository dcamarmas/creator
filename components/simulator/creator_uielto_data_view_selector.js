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

  var uielto_data_view_selector = {

  props:      {
                name_reg:          { type: String, required: true },
                reg_type:          { type: String, required: true },
                register_file_num: { type: Number, required: true }
              },

  data:       function () {
                return {
                  reg_representation_options: [
                                                { text: 'INT Registers', value: 'int', pressed: true   },
                                                { text: 'FP Registers',  value: 'fp',  pressed: false  }
                                              ],

                  register_variant: "secondary",
                  memory_pressed: false,
                  stat_pressed: false,
                  power_consumption_pressed: false
                }
              },

  methods:    {
                change_data_view(e, type){
                  app._data.data_mode = e; //TODO: vue bidirectional updates

                  if(e == "registers" && type != ''){
                    if(type == "int"){
                      app._data.register_type = 'integer'; //TODO: vue bidirectional updates
                      app._data.name_reg = 'INT Registers'; //TODO: vue bidirectional updates
                      app._data.reg_type = 'int'; //TODO: vue bidirectional updates

                      //Change button backgroun
                      if (typeof this.reg_representation_options !== "undefined") {
                        this.reg_representation_options[0].pressed = true;
                        this.reg_representation_options[1].pressed = false;
                      }
                    }
                    else if(type == "fp"){
                      app._data.register_type = 'floating point'; //TODO: vue bidirectional updates
                      app._data.name_reg = 'FP Registers'; //TODO: vue bidirectional updates
                      app._data.reg_type = 'fp'; //TODO: vue bidirectional updates

                      //Change button backgroun
                      if (typeof this.reg_representation_options !== "undefined") {
                        this.reg_representation_options[0].pressed = false;
                        this.reg_representation_options[1].pressed = true;
                      }
                    }

                    //Change button backgroun
                    this.register_variant                      = "secondary";
                    this.memory_pressed                        = false;
                    this.stat_pressed                          = false;
                    this.power_consumption_pressed             = false;
                  }

                  if(e == "memory"){
                    //Change button backgroun
                    this.reg_representation_options[0].pressed = false;
                    this.reg_representation_options[1].pressed = false;
                    this.register_variant                      = "outline-secondary";
                    this.memory_pressed                        = true;
                    this.stat_pressed                          = false;
                    this.power_consumption_pressed             = false;
                  }

                  if(e == "stats"){
                    //Change button backgroun
                    this.reg_representation_options[0].pressed = false;
                    this.reg_representation_options[1].pressed = false;
                    this.register_variant                      = "outline-secondary";
                    this.memory_pressed                        = false;
                    this.stat_pressed                          = true;
                    this.power_consumption_pressed             = false;
                  }

                  if(e == "power_consumption"){
                    //Change button backgroun
                    this.reg_representation_options[0].pressed = false;
                    this.reg_representation_options[1].pressed = false;
                    this.register_variant                      = "outline-secondary";
                    this.memory_pressed                        = false;
                    this.stat_pressed                          = false;
                    this.power_consumption_pressed             = true;
                  }

                  /* Google Analytics */
                  creator_ga('send', 'event', 'data', 'data.view', 'data.view.' + app._data.data_mode);
                }               
              },

  computed:   {

              },

  template:   '<b-container fluid align-h="center" class="mx-0 px-2">' +
              '  <b-row cols="1" >' +
              '' +
              '    <b-col class="px-1">' +
              '      <b-button-group class="w-100 pb-3">' +
              '' +
              '        <b-button v-if="register_file_num <= 4"' +
              '                  v-for="item in reg_representation_options"' +
              '                  :id="item.value"' +
              '                  size="sm"' +
              '                  :pressed.sync="item.pressed"' +
              '                  variant="outline-secondary"' +
              '                  @click="change_data_view(\'registers\', item.value)">' +
              '          {{item.text}}' +
              '        </b-button>' +
              '' +
              '        <b-dropdown split' +
              '                    v-if="register_file_num > 4"' +
              '                    right' +
              '                    :text="name_reg"' +
              '                    size="sm"' +
              '                    :variant="register_variant"' +
              '                    @click="change_data_view(\'registers\', reg_type)">' +
              '          <b-dropdown-item @click="change_data_view(\'registers\', \'int\')">CPU-INT Registers</b-dropdown-item>' +
              '          <b-dropdown-item @click="change_data_view(\'registers\', \'fp\')">CPU-FP Registers</b-dropdown-item>' +
              '        </b-dropdown>' +
              '' +
              '        <b-button id="memory_btn"' +
              '                  size="sm"' +
              '                  :pressed.sync="memory_pressed"' +
              '                  variant="outline-secondary"' +
              '                  @click="change_data_view(\'memory\', \'\')">' +
              '          <span class="fas fa-memory"></span>' +
              '          Memory' +
              '        </b-button>' +
              '' +
              '        <b-button id="stats_btn"' +
              '                  size="sm"' +
              '                  :pressed.sync="stat_pressed"' +
              '                  variant="outline-secondary"' +
              '                  @click="change_data_view(\'stats\', \'\')">' +
              '          <span class=" fas fa-chart-bar"></span>' +
              '          Stats' +
              '        </b-button>' +
              '' +
              '        <b-button id="stats_btn"' +
              '                  size="sm"' +
              '                  :pressed.sync="power_consumption_pressed"' +
              '                  variant="outline-secondary"' +
              '                  @click="change_data_view(\'power_consumption\', \'\')">' +
              '          <span class=" fas fa-bolt"></span>' +
              '          Energy (CLK Cyles)' +
              '        </b-button>' +
              '        ' +
              '      </b-button-group>' +
              '    </b-col>' +
              '' +
              '  </b-row>' +
              '</b-container>'

  }

  Vue.component('data-view-selector', uielto_data_view_selector) ;