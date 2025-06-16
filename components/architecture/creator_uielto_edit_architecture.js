
/*
 *  Copyright 2018-2025 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos
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

  var uielto_edit_architecture = {

    props:      {
                  id:                  { type: String, required: true },
                  arch_code:           { type: String, required: true }
                },

    data:       function () {
                  return {

                  }
                },

    methods:    {
                  //Load codemirror
                  load_codemirror()
                  {
                    setTimeout(function(){
                      architecture_codemirror_start();
                      
                      if (codemirrorHistory != null ){
                        textarea_arch_editor.setHistory(codemirrorHistory);
                        textarea_arch_editor.undo();
                      }

                      textarea_arch_editor.setValue(app._data.arch_code);
                    },50);
                  },
                  
                  //Close codemirror
                  arch_edit_codemirror_save()
                  {
                    app._data.arch_code = textarea_arch_editor.getValue();
                    arch_code = textarea_arch_editor.getValue();
                    codemirrorHistory = textarea_arch_editor.getHistory();
                    textarea_arch_editor.toTextArea();
                  },

                  //Save edit architecture
                  arch_edit_save()
                  {
                    app._data.arch_code = textarea_arch_editor.getValue();
                    arch_code = textarea_arch_editor.getValue();

                    try {
                      var aux_architecture = JSON.parse(app._data.arch_code);
                      arch = wasm.ArchitectureJS.from_json(app._data.arch_code);
                    }
                    catch (e) {
                      show_notification('Architecture not edited. JSON format is incorrect', 'danger');
                      return;
                    }

                    //Load architecture
                    architecture = register_value_deserialize(aux_architecture);
                    uielto_preload_architecture.data.architecture_name = architecture.arch_conf[0].value;
                    app._data.architecture = architecture;
                    app._data.architecture_name = architecture.arch_conf[0].value;

                    //Generate architecture hash table
                    architecture_hash = [];
                    for (i = 0; i < architecture.components.length; i++)
                    {
                      architecture_hash.push({name: architecture.components[i].name, index: i});
                      app._data.architecture_hash = architecture_hash; 
                    }

                    //Define stack limits
                    backup_stack_address = architecture.memory_layout[4].value;
                    backup_data_address  = architecture.memory_layout[3].value;

                    //Reset execution
                    instructions = [];
                    app._data.instructions = instructions;
                    creator_memory_clear();

                    show_notification('Architecture edited correctly', 'success');
                  }

                },

    template:   '<b-modal  :id ="id" ' +
                '          size="xl" ' +
                '          title = "Edit Architecture" ' +
                '          ok-title="Save" ' +
                '          @ok="arch_edit_save" ' +
                '          @show="load_codemirror" ' +
                '          @hidden="arch_edit_codemirror_save"> ' +
                '   <textarea id="textarea_architecture" rows="14" class="code-scroll-y d-none" title="Architecture Definition"></textarea> ' +
                '</b-modal>'
  }

  Vue.component('edit-architecture', uielto_edit_architecture) ;
