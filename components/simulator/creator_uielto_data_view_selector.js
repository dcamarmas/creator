
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

  var uielto_data_view_selector = {

  props:      {
                data_mode:         { type: String, required: true },
                register_file_num: { type: Number, required: true }
              },

  data:       function () {
                return {
                  current_reg_type: 'int_registers',
                  current_reg_name: 'INT Registers',

                  reg_representation_options: [
                                                { text: 'INT/Ctrl Registers', value: 'int_registers' },
                                                { text: 'FP Registers',       value: 'fp_registers'  }
                                              ]
                }
              },

  methods:    {
                change_data_view(e)
                {
                  app._data.data_mode = e; //TODO: vue bidirectional updates

                  if(e == "int_registers")
                  {
                    this.current_reg_type = "int_registers";
                  }

                  else if(e == "fp_registers")
                  {
                    this.current_reg_type = "fp_registers";
                  }

                  /* Google Analytics */
                  creator_ga('send', 'event', 'data', 'data.view', 'data.view.' + app._data.data_mode);
                },

                get_pressed(button)
                {
                  if (button == "registers") {
                    if (app._data.data_mode == "int_registers" || app._data.data_mode == "fp_registers")
                    {
                      return "secondary";
                    }
                    else
                    {
                      return "outline-secondary";
                    }
                  }

                  return button == app._data.data_mode;
                },

                get_register_name()
                {
                  if (app._data.data_mode == "int_registers")
                  {
                    current_reg_name = "INT/Ctrl Registers";
                  }
                  if (app._data.data_mode == "fp_registers")
                  {
                    current_reg_name = "FP Registers";
                  }

                  return current_reg_name;
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
              '                  :pressed="get_pressed(item.value)"' +
              '                  variant="outline-secondary"' +
              '                  @click="change_data_view(item.value)">' +
              '          {{item.text}}' +
              '        </b-button>' +
              '' +
              '        <b-dropdown split' +
              '                    v-if="register_file_num > 4"' +
              '                    right' +
              '                    :text="get_register_name()"' +
              '                    size="sm"' +
              '                    :variant="get_pressed(\'registers\')"' +
              '                    @click="change_data_view(current_reg_type)">' +
              '          <b-dropdown-item @click="change_data_view(\'int_registers\')">CPU-INT/Ctrl Registers</b-dropdown-item>' +
              '          <b-dropdown-item @click="change_data_view(\'fp_registers\')">CPU-FP Registers</b-dropdown-item>' +
              '        </b-dropdown>' +
              '' +
              '        <b-button id="memory_btn"' +
              '                  size="sm"' +
              '                  :pressed="get_pressed(\'memory\')"' +
              '                  variant="outline-secondary"' +
              '                  @click="change_data_view(\'memory\')">' +
              '          <span class="fas fa-memory"></span>' +
              '          Memory' +
              '        </b-button>' +
              '' +
              '        <b-button id="stats_btn"' +
              '                  size="sm"' +
              '                  :pressed="get_pressed(\'stats\')"' +
              '                  variant="outline-secondary"' +
              '                  @click="change_data_view(\'stats\')">' +
              '          <span class=" fas fa-chart-bar"></span>' +
              '          Stats' +
              '        </b-button>' +
              '' +
              '        <b-button id="stats_btn"' +
              '                  size="sm"' +
              '                  :pressed="get_pressed(\'clk_cycles\')"' +
              '                  variant="outline-secondary"' +
              '                  @click="change_data_view(\'clk_cycles\')">' +
              '          <span class="fa-regular fa-clock"></span>' +
              '          CLK Cyles' +
              '        </b-button>' +
              '        ' +
              '      </b-button-group>' +
              '    </b-col>' +
              '' +
              '  </b-row>' +
              '</b-container>'

  }

  Vue.component('data-view-selector', uielto_data_view_selector) ;