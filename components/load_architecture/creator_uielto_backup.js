
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

  var uielto_backup = {

    props:      {
                  id:          { type: String, required: true }
                },

    data:       function () {
                  return {
                    //Show modal
                    show_modal: false,

                    backup_date:      localStorage.getItem("backup_date"),
                    backup_arch_name: localStorage.getItem("backup_arch_name")
                  }
                },

    methods:    {
                  //Show backup modal
                  backup_modal(env){
                    if (typeof(Storage) !== "undefined"){
                      if(localStorage.getItem("backup_arch") != null && localStorage.getItem("backup_asm") != null && localStorage.getItem("backup_date") != null){
                        env.$root.$emit('bv::show::modal', 'copy');
                      }
                    }
                  },

                  //Load backup from cache
                  load_copy()
                  {
                    //Load architecture from cache
                    var aux_architecture = JSON.parse(localStorage.getItem("backup_arch"));
                    architecture = register_value_deserialize(aux_architecture);
                    app._data.architecture_name = localStorage.getItem("backup_arch_name");
                    Object.assign(app._data.architecture, architecture);

                    //Generate architecture hash table
                    architecture_hash = [];
                    for (var i = 0; i < architecture.components.length; i++)
                    {
                      architecture_hash.push({name: architecture.components[i].name, index: i});
                      app._data.architecture_hash = architecture_hash;
                    }

                    //Define stack limits
                    backup_stack_address = architecture.memory_layout[4].value;
                    backup_data_address = architecture.memory_layout[3].value;

                    //Load examples
                    for (var i = 0; i < app._data.arch_available.length; i++)
                    {
                      if(app._data.arch_available[i].name === app._data.architecture_name)
                      {
                        app._data.architecture_guide=app._data.arch_available[i].guide;
                        uielto_preload_architecture.methods.load_examples_available(app._data.arch_available[i].examples[0]);
                      }
                    }

                    //Load the last assembly code from cache
                    code_assembly = localStorage.getItem("backup_asm");

                    //Refresh UI
                    uielto_toolbar_btngroup.methods.reset(false);
                    uielto_toolbar_btngroup.methods.change_UI_mode('simulator');
                    uielto_data_view_selector.methods.change_data_view('int_registers');
                    
                    show_notification('The backup has been loaded correctly', 'success') ;

                    this.show_modal=false;
                  },

                  //Delete backup on cache
                  remove_copy()
                  {
                    localStorage.removeItem("backup_arch_name");
                    localStorage.removeItem("backup_arch");
                    localStorage.removeItem("backup_asm");
                    localStorage.removeItem("backup_date");

                    this.show_modal=false;
                  }
                },

    template:   '<b-modal :id="id"' +
                '         v-model="show_modal"' +
                '         hide-footer ' +
                '         hide-header' +
                '         size="sm" centered>' +
                '  <span class="h6">' +
                '    A {{backup_arch_name}} backup is available.' +
                '  </span>' +
                '  <br>' +
                '  <span class="h6">' +
                '    Date: {{backup_date}}' +
                '  </span>' +
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

