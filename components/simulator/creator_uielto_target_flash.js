
/*
 *  Copyright 2018-2024 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos
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

  var this_env = null;

  var uielto_flash = {
        props:      {
                      id:             { type: String, required: true },
                      lab_url:        { type: String, required: true },
                      result_email:   { type: String, required: true },
                      target_board:   { type: String, required: true },
                      target_port:    { type: String, required: true },
                      flash_url:      { type: String, required: true }
                    },

        data:       function () {
                      return {

                        //
                        //Remote Device
                        //

                        remote_target_boards =  [
                                                  { text: 'Please select an option', value: "", disabled: true },
                                                  { text: 'ESP32-C2 (RISC-V)',       value: 'esp32c2' },
                                                  { text: 'ESP32-C3 (RISC-V)',       value: 'esp32c3' },
                                                  { text: 'ESP32-H2 (RISC-V)',       value: 'esp32h2' },
                                                //{ text: 'ESP32-S2 (MIPS-32)',      value: 'esp32s2' },
                                                //{ text: 'ESP32-S3 (MIPS-32)',      value: 'esp32s3' },
                                                ],

                        /*
                        lab_url = "",
                        */

                        request_id = -1,
                        position = "",

                        boards  = false,
                        enqueue = false,
                        status  = false,


                        //
                        //Local Device
                        //

                        target_boards = [
                                          { text: 'Please select an option', value: "", disabled: true },
                                          { text: 'ESP32-C2 (RISC-V)',       value: 'esp32c2' },
                                          { text: 'ESP32-C3 (RISC-V)',       value: 'esp32c3' },
                                          { text: 'ESP32-H2 (RISC-V)',       value: 'esp32h2' },
                                        //{ text: 'ESP32-S2 (MIPS-32)',      value: 'esp32s2' },
                                        //{ text: 'ESP32-S3 (MIPS-32)',      value: 'esp32s3' },
                                        ],

                        /*
                        target_ports  = { Win: 'rfc2217://host.docker.internal:4000?ign_set_control', Mac: '/dev/cu.usbserial-210', Linux: '/dev/ttyUSB0' },

                        target_board  = "esp32c3",
                        target_port   = this.get_target_port(),
                        flash_url     = "http://localhost:8080",
                        */

                        flashing = false,
                        running  = false,
                      }
                    },

        methods:    {

                      //
                      //Remote Device
                      //

                      get_boards()
                      {
                        if (this.lab_url != "")
                        {
                          this.save();

                          this_env = this;
                          remote_lab_get_boards(this.lab_url + "/target_boards").then( function(data) { 
                                                                                                    if (data != "-1") 
                                                                                                    {
                                                                                                      available_boards = JSON.parse(data);

                                                                                                      for (var i = 1; i < this_env.remote_target_boards.length; i++)
                                                                                                      {
                                                                                                        if (!available_boards.includes(this_env.remote_target_boards[i]['value']))
                                                                                                        {
                                                                                                          this_env.remote_target_boards.splice(i,1);
                                                                                                          i--;
                                                                                                        }
                                                                                                      }

                                                                                                      this_env.boards = true;
                                                                                                    }
                                                                                                  } ) ;
                        }
                        else
                        {
                          this.boards = false;
                        }
                      },

                      do_enqueue ()
                      {
                        this.save();

                        if(instructions.length == 0)
                        {
                          show_notification("Compile a program first", 'danger');
                          return;
                        }

                        if(this.result_email == "")
                        {
                          show_notification("Please, enter your E-mail", 'danger');
                          return;
                        }

                        var earg =  {
                                      target_board: this.target_board,
                                      result_email: this.result_email,
                                      assembly:     code_assembly
                                    };

                        this_env = this;
                        remote_lab_enqueue(this.lab_url + "/enqueue", earg).then( function(data)  { 
                                                                                                if (data != "-1") 
                                                                                                {
                                                                                                  this_env.request_id = data;
                                                                                                  this_env.enqueue = true;
                                                                                                  this_env.status  = true;
                                                                                                  this_env.position = "";
                                                                                                  this_env.check_status();
                                                                                                }
                                                                                              } ) ;

                        //Google Analytics
                        creator_ga('simulator', 'simulator.enqueue', 'simulator.enqueue');
                      },

                      check_status()
                      {
                        if (this.position != "Completed" && this.position != "Error")
                        {
                          this.get_status();
                          setTimeout(this.check_status,20000);
                        }
                      },

                      get_status ()
                      {
                        this.save();

                        var parg =  {
                                      req_id: this.request_id
                                    } ;

                        this_env = this;
                        remote_lab_status(this.lab_url + "/status", parg).then( function(data)  { 
                                                                                              if (data == "Completed") {
                                                                                                this_env.enqueue = false;
                                                                                              }
                                                                                              if (data != "-1")
                                                                                              {
                                                                                                if (data == "-2")
                                                                                                {
                                                                                                  this_env.position = "Error";
                                                                                                  this_env.enqueue = false;
                                                                                                }
                                                                                                else if (!isNaN(data)) {
                                                                                                  this_env.position = "Queue position: " + data;
                                                                                                }
                                                                                                else {
                                                                                                  this_env.position = data;
                                                                                                }
                                                                                              }
                                                                                            } ) ;
                        //Google Analytics
                        creator_ga('simulator', 'simulator.position', 'simulator.position');
                      },

                      do_cancel ()
                      {
                        this.save();

                        var carg =  {
                                      req_id: this.request_id
                                    } ;

                        this_env = this;
                        remote_lab_cancel(this.lab_url + "/delete", carg).then( function(data)  { 
                                                                                              if (data != "-1") 
                                                                                              {
                                                                                                this_env.enqueue = false;
                                                                                                this_env.position = "Canceled"
                                                                                              }
                                                                                            } ) ;

                        //Google Analytics
                        creator_ga('simulator', 'simulator.cancel', 'simulator.cancel');
                      },


                      //
                      //Local device
                      //

                      /*get_target_port()
                      {
                        return target_ports[this._props.os];
                      },*/

                      //Download driver
                      download_driver()
                      {
                        var link = document.createElement("a");
                        link.download = "driver.zip";
                        link.href = (window.location.href.split('?')[0]).split('#')[0] + "/gateway/" + this.target_board + ".zip";
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        delete link;

                        //Google Analytics
                        creator_ga('simulator', 'simulator.download_driver', 'simulator.download_driver');
                      },

                      do_flash( )
                      {
                        this.save();

                        if(instructions.length == 0)
                        {
                          show_notification("Compile a program first", 'danger') ;
                          return;
                        }


                        this.flashing = true;

                        var farg =  {
                                      target_board: this.target_board,
                                      target_port:  this.target_port,
                                      assembly:     code_assembly,
                                    } ;

                        this_env = this;
                        gateway_remote_flash(this.flash_url + "/flash", farg).then( function(data)  { 
                                      				                                                        this_env.flashing = false; 
                                                                                                      show_notification(data, 'danger') ;
                                      			                                                        } ) ;

                        //Google Analytics
                        creator_ga('simulator', 'simulator.flash', 'simulator.flash');
                      },

                      do_monitor( )
                      {
                        this.save();

                        this.running = true;

                        var farg =  {
                                      target_board: this.target_board,
                                      target_port:  this.target_port,
                                      assembly:     code_assembly,
                                    } ;

                        this_env = this;
                        gateway_remote_monitor(this.flash_url + "/monitor", farg).then( function(data)  { 
                                                                                                          this_env.running = false; 
                                                                                                          //show_notification(data, 'danger') ;
                                                                                                        } ) ;

                        //Google Analytics
                        creator_ga('simulator', 'simulator.monitor', 'simulator.monitor');
                      },

                      //
                      //General
                      //

                      save( )
                      {
                        app._data.lab_url      = this._props.lab_url;
                        app._data.result_email = this._props.result_email;
                        app._data.target_board = this._props.target_board;
                        app._data.target_port  = this._props.target_port;
                        app._data.flash_url    = this._props.flash_url;
                      }
                    },

      template:     ' <b-modal :id="id"' +
                    '          title="Target Board Flash"' +
                    '          hide-footer' +
                    '          @hidden="save">' +
                    ' ' +
                    '   <b-tabs content-class="mt-3">' +
                    '     <b-tab title="Remote Device">' +
                    ' ' +
                    '       <b-container fluid align-h="center" class="mx-0 px-0">' +
                    '         <b-row cols="1" align-h="center">' +
                    '           <b-col class="pt-2">' +
                    '             <label for="range-6">(1) Remote Device URL:</label>' +
                    '             <b-form-input type="text" ' +
                    '                           v-model="lab_url" ' +
                    '                           placeholder="Enter remote device URL" ' +
                    '                           size="sm" ' +
                    '                           title="Remote remote device URL">' +
                    '             </b-form-input>' +
                    '           </b-col>' +
                    '         </b-row>' +
                    '       </b-container>' +
                    '       <br>' +
                    ' ' +
                    '       <b-container fluid align-h="center" class="mx-0 px-0" v-if="!boards">' +
                    '         <b-row cols="1" align-h="center">' +
                    '           <b-col class="pt-2">' +
                    '             <b-button class="btn btn-sm btn-block" variant="primary" @click="get_boards">' +
                    '               <span class="fas fa-link"></span> Connect' +
                    '             </b-button>' +
                    '           </b-col>' +
                    '         </b-row>' +
                    '       </b-container>' +
                    '       <br v-if="!boards">' +
                    ' ' +
                    '       <b-container fluid align-h="center" class="mx-0 px-0" v-if="boards">' +
                    '         <b-row cols="1" align-h="center">' +
                    '           <b-col class="pt-2">' +
                    '             <label for="range-6">(2) Select Target Board:</label>' +
                    '             <b-form-select v-model="target_board" ' +
                    '                            :options="remote_target_boards" ' +
                    '                            size="sm"' +
                    '                            title="Target board">' +
                    '             </b-form-select>' +
                    '           </b-col>' +
                    '         </b-row>' +
                    '       </b-container>' +
                    '       <br>' +
                    ' ' +
                    '       <b-container fluid align-h="center" class="mx-0 px-0" v-if="boards">' +
                    '         <b-row cols="1" align-h="center">' +
                    '           <b-col class="pt-2">' +
                    '             <label for="range-6">(3) E-mail to receive the execution results:</label>' +
                    '             <b-form-input type="text" ' +
                    '                           v-model="result_email" ' +
                    '                           placeholder="Enter E-mail" ' +
                    '                           size="sm" ' +
                    '                           title="Result E-mail">' +
                    '             </b-form-input>' +
                    '           </b-col>' +
                    '         </b-row>' +
                    '       </b-container>' +
                    '       <br>' +
                    ' ' +
                    '       <b-container fluid align-h="center" class="mx-0 px-0" v-if="status">' +
                    '         <b-row cols="1" align-h="center">' +
                    '           <b-col class="pt-2">' +
                    '             <span>Last program status: <b>{{position}}</b></span>' +
                    '           </b-col>' +
                    '         </b-row>' +
                    '       </b-container>' +
                    ' ' +
                    '       <b-container fluid align-h="center" class="mx-0 px-0" v-if="target_board !=\'\' && enqueue">' +
                    '         <b-row cols="1" align-h="center">' +
                    '           <b-col class="pt-2">' +
                    '             <b-button class="btn btn-sm btn-block" variant="danger" @click="do_cancel">' +
                    '               <span class="fas fa-ban"></span> Cancel last program' +
                    '             </b-button>' +
                    '           </b-col>' +
                    '         </b-row>' +
                    '       </b-container>' +
                    '       <br>' +
                    ' ' +
                    '       <b-container fluid align-h="center" class="mx-0 px-0" v-if="target_board !=\'\'">' +
                    '         <b-row cols="1" align-h="center">' +
                    '           <b-col class="pt-2">' +
                    '             <b-button class="btn btn-sm btn-block" variant="primary" @click="do_enqueue">' +
                    '               <span class="fas fa-paper-plane"></span> Send program' +
                    '             </b-button>' +
                    '           </b-col>' +
                    '         </b-row>' +
                    '       </b-container>' +
                    '       <br>' +
                    '       For Teachers, how to deploy a remote laboratory <a href="https://github.com/creatorsim/creator/blob/master/dockers/remote_lab/README.md">documentation</a>' +
                    '     </b-tab>' +
                    ' ' +
                    ' ' +
                    ' ' +
                    ' ' +
                    '     <b-tab title="Local Device">' +
                    ' ' +
                    '       <b-container fluid align-h="center" class="mx-0 px-0">' +
                    '         <b-row cols="1" align-h="center">' +
                    '           <b-col class="pt-2">' +
                    '             <label for="range-6">(1) Select Target Board:</label>' +
                    '             <b-form-select v-model="target_board" ' +
                    '                            :options="target_boards" ' +
                    '                            size="sm"' +
                    '                            title="Target board">' +
                    '             </b-form-select>' +
                    '           </b-col>' +
                    '         </b-row>' +
                    '       </b-container>' +
                    '       <br>' +
                    ' ' +
                    '       <b-tabs content-class="mt-3" v-if="target_board !=\'\'">' +
                    '         <b-tab title="Prerequisites">' +
                    ' ' +
                    '           <b-tabs content-class="mt-3">' +
                    '             <b-tab title="Docker Windows" active>' +
                    '               <b-container fluid align-h="center" class="mx-0 px-0">' +
                    '                 <b-row cols="1" align-h="center">' +
                    '                   <b-col class="pt-2">' +
                    '                     <label for="range-6">(2) Install Docker Desktop (only the first time):</label>' +
                    '                     <b-card class="text-center">' +
                    '                       <b-row no-gutters>' +
                    '                         <b-col md="12">' +
                    '                           <b-card-text style="text-align: left;margin:2%;">' +
                    '                             <span>Follow the instructions from: <a href="https://docs.docker.com/desktop/install/windows-install/" target="_blank">https://docs.docker.com/desktop/install/windows-install/</a></span>' +
                    '                           </b-card-text>' +
                    '                         </b-col>' +
                    '                       </b-row>' +
                    '                     </b-card>' +
                    '                   </b-col>' +
                    '                 </b-row>' +
                    '               </b-container>' +
                    ' ' +
                    '               <b-container fluid align-h="center" class="mx-0 px-0">' +
                    '                 <b-row cols="1" align-h="center">' +
                    '                   <b-col class="pt-2">' +
                    '                     <label for="range-6">(3) Download esptool (only the first time):</label>' +
                    '                     <b-card class="text-center">' +
                    '                       <b-row no-gutters>' +
                    '                         <b-col md="12">' +
                    '                           <b-card-text style="text-align: left;margin:2%;">' +
                    '                             <span>Download from: <a href="https://github.com/espressif/esptool/releases" target="_blank">https://github.com/espressif/esptool/releases</a></span>' +
                    '                           </b-card-text>' +
                    '                         </b-col>' +
                    '                       </b-row>' +
                    '                     </b-card>' +
                    '                   </b-col>' +
                    '                 </b-row>' +
                    '               </b-container>' +
                    ' ' +
                    '               <b-container fluid align-h="center" class="mx-0 px-0">' +
                    '                 <b-row cols="1" align-h="center">' +
                    '                   <b-col class="pt-2">' +
                    '                     <label for="range-6">(4) Pull creator_gateway image in Docker Desktop:</label>' +
                    '                     <b-card class="text-center">' +
                    '                       <b-row no-gutters>' +
                    '                         <b-col md="12">' +
                    '                           <b-card-text style="text-align: left;margin:2%;">' +
                    '                             <ol style="margin:3%;">' +
                    '                               <li>Search for "creatorsim/creator_gateway" in the Docker Desktop browser</li>' +
                    '                               <li>Click the "Pull" button</li>' +
                    '                             </ol>' +
                    '                           </b-card-text>' +
                    '                         </b-col>' +
                    '                       </b-row>' +
                    '                     </b-card>' +
                    '                   </b-col>' +
                    '                 </b-row>' +
                    '               </b-container>' +
                    ' ' +
                    '               <b-container fluid align-h="center" class="mx-0 px-0">' +
                    '                 <b-row cols="1" align-h="center">' +
                    '                   <b-col class="pt-2">' +
                    '                     <label for="range-6">(5) Run creator_gateway image:</label>' +
                    '                     <b-card class="text-center">' +
                    '                       <b-row no-gutters>' +
                    '                         <b-col md="12">' +
                    '                           <b-card-text style="text-align: left;margin:2%;">' +
                    '                             <ol style="margin:3%;">' +
                    '                               <li>Click the "Run" button</li>' +
                    '                               <li>Click the "Optional settings" button</li>' +
                    '                               <li>Set the Host port to 8080</li>' +
                    '                               <li>Click the "Run" button</li>' +
                    '                             </ol>' +
                    '                           </b-card-text>' +
                    '                         </b-col>' +
                    '                       </b-row>' +
                    '                     </b-card>' +
                    '                   </b-col>' +
                    '                 </b-row>' +
                    '               </b-container>' +
                    ' ' +
                    '               <b-container fluid align-h="center" class="mx-0 px-0">' +
                    '                 <b-row cols="1" align-h="center">' +
                    '                   <b-col class="pt-2">' +
                    '                     <label for="range-6">(6) Run start_gateway script in the container bash:</label>' +
                    '                     <b-card class="text-center">' +
                    '                       <b-row no-gutters>' +
                    '                         <b-col md="12">' +
                    '                           <b-card-text style="text-align: left;margin:2%;">' +
                    '                             <ol style="margin:3%;">' +
                    '                               <li>Click the "Exec" button</li>' +
                    '                               <li>Execute <code>./start_gateway.sh</code>' +
                    '                             </ol>' +
                    '                           </b-card-text>' +
                    '                         </b-col>' +
                    '                       </b-row>' +
                    '                     </b-card>' +
                    '                   </b-col>' +
                    '                 </b-row>' +
                    '               </b-container>' +
                    ' ' +
                    '               <b-container fluid align-h="center" class="mx-0 px-0">' +
                    '                 <b-row cols="1" align-h="center">' +
                    '                   <b-col class="pt-2">' +
                    '                     <label for="range-6">(7) Run esp_rfc2217_server in windows cmd:</label>' +
                    '                     <b-card class="text-center">' +
                    '                       <b-row no-gutters>' +
                    '                         <b-col md="12">' +
                    '                           <b-card-text style="text-align: left;margin:2%;">' +
                    '                             <ol style="margin:3%;">' +
                    '                               <li>Execute the windows cmd in the esptool path</li>' +
                    '                               <li>Execute <code>esp_rfc2217_server -v -p 4000 &lt;target_port&gt;</code>' +
                    '                             </ol>' +
                    '                             <span>For more information: <a href="https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-guides/tools/idf-docker-image.html#using-remote-serial-port" target="_blank">https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-guides/tools/idf-docker-image.html#using-remote-serial-port</a></span>' +
                    '                           </b-card-text>' +
                    '                         </b-col>' +
                    '                       </b-row>' +
                    '                     </b-card>' +
                    '                   </b-col>' +
                    '                 </b-row>' +
                    '               </b-container>' +
                    '             </b-tab>' +
                    ' ' +
                    '             <b-tab title="Docker Linux/MacOS">' +
                    '               <b-container fluid align-h="center" class="mx-0 px-0">' +
                    '                 <b-row cols="1" align-h="center">' +
                    '                   <b-col class="pt-2">' +
                    '                     <label for="range-6">(2) Install Docker Engine (only the first time):</label>' +
                    '                     <b-card class="text-center">' +
                    '                       <b-row no-gutters>' +
                    '                         <b-col md="12">' +
                    '                           <b-card-text style="text-align: left;margin:2%;">' +
                    '                             <span>Follow the instructions from: <a href="https://docs.docker.com/engine/install/" target="_blank">https://docs.docker.com/engine/install/</a></span>' +
                    '                           </b-card-text>' +
                    '                         </b-col>' +
                    '                       </b-row>' +
                    '                     </b-card>' +
                    '                   </b-col>' +
                    '                 </b-row>' +
                    '               </b-container>' +
                    ' ' +
                    '               <b-container fluid align-h="center" class="mx-0 px-0">' +
                    '                 <b-row cols="1" align-h="center">' +
                    '                   <b-col class="pt-2">' +
                    '                     <label for="range-6">(3) Pull creator_gateway image:</label>' +
                    '                     <b-card class="text-center">' +
                    '                       <b-row no-gutters>' +
                    '                         <b-col md="12">' +
                    '                           <b-card-text style="text-align: left;margin:2%;">' +
                    '                             <code>docker pull creatorsim/creator_gateway</code>' +
                    '                           </b-card-text>' +
                    '                         </b-col>' +
                    '                       </b-row>' +
                    '                     </b-card>' +
                    '                   </b-col>' +
                    '                 </b-row>' +
                    '               </b-container>' +
                    ' ' +
                    '               <b-container fluid align-h="center" class="mx-0 px-0">' +
                    '                 <b-row cols="1" align-h="center">' +
                    '                   <b-col class="pt-2">' +
                    '                     <label for="range-6">(4) Run creator_gateway image:</label>' +
                    '                     <b-card class="text-center">' +
                    '                       <b-row no-gutters>' +
                    '                         <b-col md="12">' +
                    '                           <b-card-text style="text-align: left;margin:2%;">' +
                    '                             <code>docker run --init -it --device=&lt;target_port&gt; -p 8080:8080 --name creator_gateway creatorsim/creator_gateway /bin/bash</code>' +
                    '                           </b-card-text>' +
                    '                         </b-col>' +
                    '                       </b-row>' +
                    '                     </b-card>' +
                    '                   </b-col>' +
                    '                 </b-row>' +
                    '               </b-container>' +
                    ' ' +
                    '               <b-container fluid align-h="center" class="mx-0 px-0">' +
                    '                 <b-row cols="1" align-h="center">' +
                    '                   <b-col class="pt-2">' +
                    '                     <label for="range-6">(5) Run start_gateway script in the container bash:</label>' +
                    '                     <b-card class="text-center">' +
                    '                       <b-row no-gutters>' +
                    '                         <b-col md="12">' +
                    '                           <b-card-text style="text-align: left;margin:2%;">' +
                    '                             <code>./start_gateway.sh</code>' +
                    '                           </b-card-text>' +
                    '                         </b-col>' +
                    '                       </b-row>' +
                    '                     </b-card>' +
                    '                   </b-col>' +
                    '                 </b-row>' +
                    '               </b-container>' +
                    '             </b-tab>' +
                    ' ' +
                    '             <b-tab title="Native">' +
                    '               <b-container fluid align-h="center" class="mx-0 px-0">' +
                    '                 <b-row cols="1" align-h="center">' +
                    '                   <b-col class="pt-2">' +
                    '                     <label for="range-6">(2) Install the ESP32 Software (only the first time):</label>' +
                    '                     <b-card class="text-center">' +
                    '                       <b-row no-gutters>' +
                    '                         <b-col md="12">' +
                    '                           <b-card-text style="text-align: left;margin:2%;">' +
                    '                             <span>Follow the instructions from: <a href="https://docs.espressif.com/projects/esp-idf/en/latest/esp32/" target="_blank">https://docs.espressif.com/projects/esp-idf/en/latest/esp32/</a></span>' +
                    '                           </b-card-text>' +
                    '                         </b-col>' +
                    '                       </b-row>' +
                    '                     </b-card>' +
                    '                   </b-col>' +
                    '                 </b-row>' +
                    '               </b-container>' +
                    ' ' +
                    '               <b-container fluid align-h="center" class="mx-0 px-0">' +
                    '                 <b-row cols="1" align-h="center">' +
                    '                   <b-col class="pt-2">' +
                    '                     <label for="range-6">(3) Install python3 packages:</label>' +
                    '                     <b-card class="text-center">' +
                    '                       <b-row no-gutters>' +
                    '                         <b-col md="12">' +
                    '                           <b-card-text style="text-align: left;margin:2%;">' +
                    '                             <code>pip3 install flask flask_cors</code>' +
                    '                           </b-card-text>' +
                    '                         </b-col>' +
                    '                       </b-row>' +
                    '                     </b-card>' +
                    '                   </b-col>' +
                    '                 </b-row>' +
                    '               </b-container>' +
                    ' ' +
                    '               <b-container fluid align-h="center" class="mx-0 px-0">' +
                    '                 <b-row cols="1" align-h="center">' +
                    '                   <b-col class="pt-2">' +
                    '                     <label for="range-6">(4) Download the driver:</label>' +
                    '                     <b-button class="btn btn-sm btn-block" variant="outline-primary" @click="download_driver"><span class="fas fa-download"></span> Download Driver</b-button>' +
                    '                   </b-col>' +
                    '                 </b-row>' +
                    '               </b-container>' +
                    ' ' +
                    '               <b-container fluid align-h="center" class="mx-0 px-0">' +
                    '                 <b-row cols="1" align-h="center">' +
                    '                   <b-col class="pt-2">' +
                    '                     <label for="range-6">(5) Run driver:</label>' +
                    '                     <b-card class="text-center">' +
                    '                       <b-row no-gutters>' +
                    '                         <b-col md="12">' +
                    '                           <b-card-text style="text-align: justify;margin:2%;">' +
                    '                             <span>Load the environment variable for your board with:</span>' +
                    '                             <br>' +
                    '                             <code>. $HOME/esp/esp-idf/export.sh</code>' +
                    '                             <br>' +
                    '                             <br>' +
                    '                             <span>Unzip the driver.zip file and change into the driver directory associated to your board with "cd &lt;board&gt;", for example:</span>' +
                    '                             <br>' +
                    '                             <code>unzip driver.zip</code>' +
                    '                             <br>' +
                    '                             <code>cd &lt;board&gt;</code>' +
                    '                             <br>' +
                    '                             <br>' +
                    '                             <span>Execute the gateway web service:</span>' +
                    '                             <br>' +
                    '                             <code>python3 gateway.py</code>' +
                    '                             <br>' +
                    '                           </b-card-text>' +
                    '                         </b-col>' +
                    '                       </b-row>' +
                    '                     </b-card>' +
                    '                   </b-col>' +
                    '                 </b-row>' +
                    '               </b-container>' +
                    '             </b-tab>' +
                    '           </b-tabs>' +
                    '         </b-tab>' +
                    ' ' +
                    '         <b-tab title="Run" active>' +
                    '           <b-container fluid align-h="center" class="mx-0 px-0">' +
                    '             <b-row cols="1" align-h="center">' +
                    '               <b-col class="pt-2">' +
                    '                 <label for="range-6">(2) Target Port: (please verify the port on your computer)</label>' +
                    '                 <b-form-input type="text" ' +
                    '                               v-model="target_port" ' +
                    '                               placeholder="Enter target port" ' +
                    '                               size="sm" ' +
                    '                               title="Target port">' +
                    '                 </b-form-input>' +
                    '               </b-col>' +
                    '             </b-row>' +
                    '           </b-container>' +
                    ' ' +
                    '           <b-container fluid align-h="center" class="mx-0 px-0">' +
                    '             <b-row cols="1" align-h="center">' +
                    '               <b-col class="pt-2">' +
                    '                 <label for="range-6">(3) Flash URL:</label>' +
                    '                 <b-form-input type="text" ' +
                    '                               v-model="flash_url" ' +
                    '                               placeholder="Enter flash URL" ' +
                    '                               size="sm" ' +
                    '                               title="Flash URL">' +
                    '                 </b-form-input>' +
                    '               </b-col>' +
                    '             </b-row>' +
                    '           </b-container>' +
                    ' ' +
                    '           <br>' +
                    ' ' +
                    '           <b-container fluid align-h="center" class="mx-0 px-0">' +
                    '             <b-row cols="2" align-h="center">' +
                    '               <b-col class="pt-2">' +
                    '                 <b-button class="btn btn-sm btn-block" variant="primary" @click="do_flash" :pressed="flashing" :disabled="flashing || running">' +
                    '                   <span v-if="!flashing"><span class="fas fa-bolt-lightning"></span> Flash</span>' +
                    '                   <span v-if="flashing"><span class="fas fa-bolt-lightning"></span>  Flashing...</span>' +
                    '                   <b-spinner small v-if="flashing"></b-spinner>' +
                    '                 </b-button>' +
                    '               </b-col>' +
                    '               <b-col class="pt-2">' +
                    '                 <b-button class="btn btn-sm btn-block" variant="primary" @click="do_monitor" :pressed="running" :disabled="running || flashing">' +
                    '                   <span v-if="!running"><span class="fas fa-play"></span> Monitor</span>' +
                    '                   <span v-if="running"><span class="fas fa-play"></span>  Runing...</span>' +
                    '                   <b-spinner small v-if="running"></b-spinner>' +
                    '                 </b-button>' +
                    '               </b-col>' +
                    '             </b-row>' +
                    '           </b-container>' +
                    '         </b-tab>' +
                    '       </b-tabs>' +
                    ' ' +
                    '     </b-tab>' +
                    '   </b-tabs>' +
                    ' ' +
                    ' </b-modal>'
  
  }

  Vue.component('flash', uielto_flash)

  //
  // Remote Device web service functions
  //

  async function remote_lab_get_boards ( lab_url )
  {
    var fetch_args =  {
                        method:   'GET'
                      } ;

    try
    {
      var res  = await fetch(lab_url, fetch_args) ;

      return await res.text();
    }
    catch (err)
    {
      if (err.toString() == "TypeError: Failed to fetch") 
      {
        show_notification("Remote device not available at the moment. Please, try again later.", 'danger') ;
        return "-1";
      }

      return err.toString() + "\n";
    }
  }

  async function remote_lab_enqueue ( lab_url, enqueue_args )
  {
    var fetch_args =  {
                        method:   'POST',
                        headers:  {
                                    'Content-type': 'application/json',
                                    'Accept':       'application/json'
                                  },
                        body:     JSON.stringify(enqueue_args)
                      } ;

    try
    {
      var res  = await fetch(lab_url, fetch_args) ;
      var jres = await res.json();

      return jres.status;
    }
    catch (err)
    {
      if (err.toString() == "TypeError: Failed to fetch") 
      {
        show_notification("Remote device not available at the moment. Please, try again later.", 'danger') ;
        return "-1";
      }

      return err.toString() + "\n";
    }
  }

  async function remote_lab_cancel ( lab_url, cancel_args )
  {
    var fetch_args =  {
                        method:   'POST',
                        headers:  {
                                    'Content-type': 'application/json',
                                    'Accept':       'application/json'
                                  },
                        body:     JSON.stringify(cancel_args)
                      } ;

    try
    {
      var res  = await fetch(lab_url, fetch_args) ;
      var jres = await res.json();

      return jres.status;
    }
    catch (err)
    {
      if (err.toString() == "TypeError: Failed to fetch")
      {
        show_notification("Remote device not available at the moment. Please, try again later.", 'danger') ;
        return "-1";
      }

      return err.toString() + "\n";
    }
  }

  async function remote_lab_position ( lab_url, position_args )
  {
    var fetch_args =  {
                        method:   'POST',
                        headers:  {
                                    'Content-type': 'application/json',
                                    'Accept':       'application/json'
                                  },
                        body:     JSON.stringify(position_args)
                      } ;

    try
    {
      var res  = await fetch(lab_url, fetch_args) ;
      var jres = await res.json();

      return jres.status;
    }
    catch (err)
    {
      if (err.toString() == "TypeError: Failed to fetch")
      {
        show_notification("Remote device not available at the moment. Please, try again later.", 'danger') ;
        return "-1";
      }

      return err.toString() + "\n";
    }
  }

  async function remote_lab_status ( lab_url, status_args )
  {
    var fetch_args =  {
                        method:   'POST',
                        headers:  {
                                    'Content-type': 'application/json',
                                    'Accept':       'application/json'
                                  },
                        body:     JSON.stringify(status_args)
                      } ;

    try
    {
      var res  = await fetch(lab_url, fetch_args) ;
      var jres = await res.json();

      return jres.status;
    }
    catch (err)
    {
      if (err.toString() == "TypeError: Failed to fetch")
      {
        show_notification("Remote device not available at the moment. Please, try again later.", 'danger') ;
        return "-2";
      }

      return err.toString() + "\n";
    }
  }

  //
  // Local device web service functions
  //

  async function gateway_remote_flash ( flash_url, flash_args )
  {
    var fetch_args =  {
                        method:   'POST',
                        headers:  {
                                    'Content-type': 'application/json',
                                    'Accept':       'application/json'
                                  },
                        body:     JSON.stringify(flash_args)
                      } ;

    try
    {
      var res  = await fetch(flash_url, fetch_args) ;
      var jres = await res.json();

      return jres.status;
    }
    catch (err)
    {
      if (err.toString() == "TypeError: Failed to fetch") {
        return "Gateway not available at the moment. Please, execute 'python3 gateway.py' and connect your board first\n";
      }

      return err.toString() + "\n";
    }
  }

  async function gateway_remote_monitor ( flash_url, flash_args )
  {
    var fetch_args =  {
                        method:   'POST',
                        headers:  {
                                    'Content-type': 'application/json',
                                    'Accept':       'application/json'
                                  },
                        body:     JSON.stringify(flash_args)
                      } ;

    try
    {
      var res  = await fetch(flash_url, fetch_args) ;
      var jres = await res.json();

      return jres.status;
    }
    catch (err)
    {
      if (err.toString() == "TypeError: Failed to fetch") {
        return "Gateway not available at the moment. Please, execute 'python3 gateway.py' and connect your board first\n";
      }

      return err.toString() + "\n";
    }
  }
