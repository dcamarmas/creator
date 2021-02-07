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

        var uielto_examples = {

        props:      {
                      example_available:   { type: Array, required: true },
                      compile:             { type: String, required: true },
                      modal:               { type: String, required: true }
                    },

        methods:    {
                      /*Load a selected example*/
                      load_example(url, compile)
                      {
                        this.$root.$emit('bv::hide::modal', this._props.modal, '#closeExample');

                        $.get(url, function(data) {
                          code_assembly = data ;
                          if (compile == "false"){
                            textarea_assembly_editor.setValue(code_assembly) ;
                          }
                          else{
                            app.assembly_compiler(code_assembly) ;
                          }
                          show_notification(' The selected example has been loaded correctly', 'success') ;

                          /* Google Analytics */
                          creator_ga('send', 'event', 'example', 'example.loading', 'example.loading.' + url);
                        });
                      }           
                    },

        template:   ' <div>' +
                    '   <span class="h6" v-if="example_available.length == 0">' +
                    '     There\'s no examples at the moment' +
                    '   </span>' +
                    '   <b-list-group>' +
                    '     <b-list-group-item button ' +
                    '                        v-for="item in example_available" ' +
                    '                        @click="load_example(item.url, compile)" ' +
                    '                        ref="closeExample">' +
                    '       {{item.name}}:' +
                    '       <span v-html="item.description"></span>' +
                    '     </b-list-group-item>' +
                    '   </b-list-group>' +
                    ' </div>'
      
        }

        Vue.component('examples', uielto_examples) ;

