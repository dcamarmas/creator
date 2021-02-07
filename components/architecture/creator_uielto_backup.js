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

        var uielto_backup = {

        props:      {
                      date_copy:   { type: String, required: true }
                    },

        methods:    {
                      /*Load backup*/
                      load_copy(){
                        app._data.architecture_name = localStorage.getItem("arch_name");

                        var auxArchitecture = JSON.parse(localStorage.getItem("architecture_copy"));
                        architecture = register_value_deserialize(auxArchitecture);

                        app._data.architecture = architecture;
                        code_assembly = localStorage.getItem("assembly_copy");

                        for (var i = 0; i < app._data.arch_available.length; i++) {
                          if(app._data.arch_available[i].name === app._data.architecture_name){
                            app.load_examples_available(app._data.arch_available[i].examples[0]); //TODO if e.examples.length > 1 -> View example set selector
                          }
                        }

                        architecture_hash = [];
                        for (var i = 0; i < architecture.components.length; i++){
                          architecture_hash.push({name: architecture.components[i].name, index: i});
                          app._data.architecture_hash = architecture_hash;
                        }

                        backup_stack_address = architecture.memory_layout[4].value;
                        backup_data_address = architecture.memory_layout[3].value;

                        app.reset(false);

                        app.change_UI_mode('simulator');
                        app.change_data_view('registers' , 'int');
                        app.$forceUpdate();

                        show_notification('The backup has been loaded correctly', 'success') ;
                      },

                      /*Delete backup*/
                      remove_copy(){
                        localStorage.removeItem("architecture_copy");
                        localStorage.removeItem("assembly_copy");
                        localStorage.removeItem("date_copy");
                        app.$refs.copyRef.hide();
                      },
                    },

        template:   ' <div>' +
                    '   <span class="h6">A backup is available</span>' +
                    '   <br>' +
                    '   <span class="h6">Date: {{date_copy}}</span>' +
                    '   <div class="col-lg-12 col-sm-12 row nomargin">' +
                    '     <div class="col-lg-6 col-sm-6 pb-1">' +
                    '       <b-button class="btn btn-outline-danger btn-block btn-sm buttonBackground" ' +
                    '                 @click="remove_copy">' +
                    '         Discard' +
                    '       </b-button>' +
                    '     </div>' +
                    '     <div class="col-lg-6 col-sm-6 pb-1">' +
                    '       <b-button class="btn btn-outline-primary btn-block btn-sm buttonBackground" ' +
                    '                 @click="load_copy">' +
                    '         Load' +
                    '       </b-button>' +
                    '     </div>' +
                    '   </div>' +
                    ' </div>'
      
        }

        Vue.component('uielto-backup', uielto_backup) ;

