
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

  var uielto_examples = {

  props:      {
                id:                       { type: String, required: true },
                ref:                      { type: String, required: true },
                example_set_available:    { type: Array,  required: true },
                example_available:        { type: Array,  required: true },
                compile:                  { type: String, required: true },
                modal:                    { type: String, required: true }
              },

  data:       function () {
                return {
                  example_set: 0,
                  example_set_name: ""
                }
              },

  methods:    {
                get_example_set(){
                  return this.example_set;
                },

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
                      uielto_toolbar_btngroup.methods.assembly_compiler(code_assembly);
                    }
                    show_notification(' The selected example has been loaded correctly', 'success') ;

                    /* Google Analytics */
                    creator_ga('send', 'event', 'example', 'example.loading', 'example.loading.' + url);
                  });
                },

                //Change exmaple set variable
                change_example_set(value){
                  this.example_set = value;
                }         
              },

  template:   ' <b-modal  :id="id"' +
              '           title="Examples"' +
              '           :ref="ref"' +
              '           hide-footer' +
              '           scrollable>' +
              ' ' +
              '   <b-form-group label="Examples set available:" v-if="example_set_available.length > 1" v-slot="{ ariaDescribedby }">' +
              '     <b-form-radio-group' +
              '       v-if="example_set_available.length <= 2"' +
              '       id="example_set"' +
              '       class="w-100"' +
              '       v-model="example_set"' +
              '       :options="example_set_available"' +
              '       button-variant="outline-secondary"' +
              '       size="sm"' +
              '       :aria-describedby="ariaDescribedby"' +
              '       name="radios-btn-default"' +
              '       buttons' +
              '     ></b-form-radio-group>' +
              '   </b-form-group>' +
              ' ' +
              '   <b-dropdown id="examples_dropdown"' +
              '               class="w-100 mb-3"' +
              '               size="sm"' +
              '               text="Examples set available"' +
              '               v-if="example_set_available.length > 2">' +
              '     <b-dropdown-item v-for="item in example_set_available"' +
              '                      @click="change_example_set(item.value)">' +
              '       {{item.text}}' +
              '     </b-dropdown-item>' +
              '   </b-dropdown>' +
              ' ' +
              '   <span class="h6" v-if="example_available.length == 0 || example_available[example_set].length == 0">' +
              '     There\'s no examples at the moment' +
              '   </span>' +
              ' ' +
              '   <b-list-group>' +
              '     <b-list-group-item button ' +
              '                        v-for="item in example_available[example_set]" ' +
              '                        @click="load_example(item.url, compile)" ' +
              '                        ref="closeExample">' +
              '       {{item.name}}:' +
              '       <span v-html="item.description"></span>' +
              '     </b-list-group-item>' +
              '   </b-list-group>' +
              ' </b-modal>'
  }

  Vue.component('examples', uielto_examples) ;