
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
                      textarea_arch_editor.setValue(arch_code);
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