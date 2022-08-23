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

        var uielto_backup = {

        props:      {
                      id:          { type: String, required: true },
                      date_copy:   { type: String, required: true }
                    },

        methods:    {
                      //Load backup
                      load_copy(){
                        app._data.architecture_name = localStorage.getItem("arch_name");

                        var auxArchitecture = JSON.parse(localStorage.getItem("architecture_copy"));
                        architecture = register_value_deserialize(auxArchitecture);

                        app._data.architecture = architecture;
                        code_assembly = localStorage.getItem("assembly_copy");

                        for (var i = 0; i < app._data.arch_available.length; i++) {
                          if(app._data.arch_available[i].name === app._data.architecture_name){
                            //app.load_examples_available(app._data.arch_available[i].examples[0]);
                            uielto_preload_architecture.methods.load_examples_available(app._data.arch_available[i].examples[0]);
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

                      //Delete backup
                      remove_copy(){
                        localStorage.removeItem("architecture_copy");
                        localStorage.removeItem("assembly_copy");
                        localStorage.removeItem("date_copy");
                        this.$root.$emit('bv::hide::modal', 'copy');
                      }
                    },

        template:   '<b-modal :id="id" hide-footer hide-header size="sm" centered>' +
                    '  <span class="h6">A backup is available</span>' +
                    '  <br>' +
                    '  <span class="h6">Date: {{date_copy}}</span>' +
                    ' ' +
                    '  <b-container fluid align-h="center" class="mx-0 px-0">' +
                    '    <b-row cols-xl="2" cols-lg="2" cols-md="2" cols-sm="1" cols-xs="1" cols="1" align-h="center">' +
                    '      <b-col>' +
                    '        <b-button class="btn btn-outline-danger btn-block btn-sm buttonBackground" ' +
                    '                  @click="remove_copy">' +
                    '          Discard' +
                    '        </b-button>' +
                    '      </b-col>' +
                    ' ' +
                    '      <b-col>' +
                    '        <b-button class="btn btn-outline-primary btn-block btn-sm buttonBackground" ' +
                    '                  @click="load_copy">' +
                    '          Load' +
                    '        </b-button>' +
                    '      </b-col>' +
                    '    </b-row>' +
                    '  </b-container>' +
                    '</b-modal>'
      
        }

        Vue.component('uielto-backup', uielto_backup) ;

