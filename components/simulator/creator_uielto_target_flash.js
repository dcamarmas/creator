
/*
 *  Copyright 2018-2023 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos
 *
 *  file is part of CREATOR.
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

  var uielto_flash = {
        props:      {
                      id:  { type: String, required: true },
                      os:  { type: String, required: true }
                    },

        data:       function () {
                      return {
                        target_boards = [
                                          { text: 'ESP32',     value: 'esp32' },
                                          { text: 'ESP32-C2',  value: 'esp32_c2' },
                                          { text: 'ESP32-C3',  value: 'esp32_c3' },
                                          { text: 'ESP32-H2',  value: 'esp32_h2' },
                                          { text: 'ESP32-S2',  value: 'esp32_s2' },
                                          { text: 'ESP32-S3',  value: 'esp32_s3' },
                                        ],

                        target_ports  = { Win: 'COM1', Mac: '/dev/cu.', Linux: '/dev/tty' },

                        target_board  = "esp32_c3",
                        target_port   = this.get_target_port(),
                        flash_url     = "localhost:8080",

                        display = "",

                        render_component: true,
                      }
                    },

        methods:    {
                      get_target_port()
                      {
                        return target_ports[this._props.os];
                      },

                      //Download driver
                      download_driver(){
                        var link = document.createElement("a");
                        link.download = "driver.zip";
                        link.href = (window.location.href.split('?')[0]).split('#')[0] + "/gateway/" + target_board + "/driver.zip";
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        delete link;

                        //Google Analytics
                        creator_ga('simulator', 'simulator.download_driver', 'simulator.download_driver');
                      },
                    },

      template:     ' <b-modal :id="id"' +
                    '          title="Target Board Flash"' +
                    '          hide-footer>' +
                    ' ' +
                    '   <b-container fluid align-h="center" class="mx-0 px-0">' +
                    '     <b-row cols="1" align-h="center">' +
                    '       <b-col class="pt-2">' +
                    '         <label for="range-6">Target Board:</label>' +
                    '         <b-form-select v-model="target_board" ' +
                    '                        :options="target_boards" ' +
                    '                        size="sm"' +
                    '                        title="Target board">' +
                    '         </b-form-select>' +
                    '       </b-col>' +
                    '       <b-col class="pt-2">' +
                    '         <label for="range-6">Target Port:</label>' +
                    '         <b-form-input type="text" ' +
                    '                       v-model="target_port" ' +
                    '                       placeholder="Enter target port" ' +
                    '                       size="sm" ' +
                    '                       title="Target port">' +
                    '         </b-form-input>' +
                    '       </b-col>' +
                    '       <b-col class="pt-2">' +
                    '         <label for="range-6">Flash URL:</label>' +
                    '         <b-form-input type="text" ' +
                    '                       v-model="flash_url" ' +
                    '                       placeholder="Enter flash URL" ' +
                    '                       size="sm" ' +
                    '                       title="Flash URL">' +
                    '         </b-form-input>' +
                    '       </b-col>' +
                    '     </b-row>' +
                    '   </b-container>' +
                    ' ' +
                    '   <b-container fluid align-h="center" class="mx-0 px-0">' +
                    '     <b-row cols="1" align-h="center">' +
                    '       <b-col class="pt-2">' +
                    '         <label for="range-6">Monitor:</label>' +
                    '         <b-form-textarea id="textarea_display" ' +
                    '                          v-model="display" ' +
                    '                          rows="5" ' +
                    '                          disabled ' +
                    '                          no-resize ' +
                    '                          title="Display">' +
                    '         </b-form-textarea>' +
                    '       </b-col>' +
                    '     </b-row>' +
                    '   </b-container>' +
                    ' ' +
                    '   <b-container fluid align-h="center" class="mx-0 px-0">' +
                    '     <b-row cols="2" align-h="center">' +
                    '       <b-col class="pt-2">' +
                    '         <b-button class="btn btn-sm btn-block" variant="outline-primary" @click="download_driver">Download Driver</b-button>' +
                    '       </b-col>' +
                    '       <b-col class="pt-2">' +
                    '         <b-button class="btn btn-sm btn-block" variant="primary">Flash</b-button>' +
                    '       </b-col>' +
                    '     </b-row>' +
                    '   </b-container>' +
                    ' </b-modal>'
  
  }

  Vue.component('flash', uielto_flash)
