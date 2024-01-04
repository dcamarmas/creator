
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

  var uielto_directives_edit = {

    props:      {
                  id:                             { type: String, required: true },
                  title:                          { type: String, required: true },
                  index:                          { type: Number, required: true },
                  directive:                      { type: Object, required: true }
                },

    data:       function () {
                  return {
                    //Directives types
                    actionTypes:  [
                                    { text: 'Data Segment',  value: 'data_segment' },
                                    { text: 'Code Segment',  value: 'code_segment' },
                                    { text: 'Global Symbol', value: 'global_symbol' },
                                    { text: 'Byte',          value: 'byte' },
                                    { text: 'Half Word',     value: 'half_word' },
                                    { text: 'Word',          value: 'word' },
                                    { text: 'Double Word',   value: 'double_word' },
                                    { text: 'Float',         value: 'float' },
                                    { text: 'Double',        value: 'double' },
                                    { text: 'Space',         value: 'space' },
                                    { text: 'ASCII not finished in null', value: 'ascii_not_null_end' },
                                    { text: 'ASCII finished in null',     value: 'ascii_null_end' },
                                    { text: 'Align',         value: 'align' },
                                    { text: 'Balign',        value: 'balign'},
                                  ],

                    //Modals directives
                    show_modal: false,
                  }
                },

    methods:    {
                  //Verify all fields of modify directive
                  verify_edit_directive(evt)
                  {
                    evt.preventDefault();

                    if (!this._props.directive.name || !this._props.directive.action)
                    {
                      show_notification('Please complete all fields', 'danger') ;
                    }
                    else 
                    {
                      if(isNaN(parseInt(this._props.directive.size)) && (this._props.directive.action == 'byte' || this._props.directive.action == 'half_word' || this._props.directive.action == 'word' || this._props.directive.action == 'double_word' || this._props.directive.action == 'float' || this._props.directive.action == 'double' || this._props.directive.action == 'space')){
                        show_notification('Please complete all fields', 'danger') ;
                      }
                      else
                      {
                        for (var i = 0; i < architecture.directives.length; i++)
                        {
                          if((this._props.directive.name == architecture.directives[i].name) && (this._props.index != i))
                          {
                            show_notification('The directive already exists', 'danger') ;
                            return;
                          }
                        }

                        this.edit_directive();
                      }
                    }
                  },

                  //Edit directive
                  edit_directive()
                  {
                    this.show_modal = false;

                    if(this._props.directive.action == 'byte' || this._props.directive.action == 'half_word' || this._props.directive.action == 'word' || this._props.directive.action == 'double_word' || this._props.directive.action == 'float' || this._props.directive.action == 'double' || this._props.directive.action == 'space'){
                      architecture.directives[this._props.index].size = this._props.directive.size;
                    }
                    else{
                      architecture.directives[this._props.index].size = null;
                    }

                    Object.assign(architecture.directives[this._props.index], this._props.directive);

                    show_notification('Directive correctly modified', 'success') ;
                  },

                  //Form validator
                  valid(value)
                  {
                    if(parseInt(value) !== 0)
                    {
                      if(!value){
                        return false;
                      }
                      else{
                        return true;
                      }
                    }
                    else{
                      return true;
                    }
                  },
                },

    template:   '<b-modal :id ="id" ' +
                '         :title = "title"' +
                '         ok-title="Save" ' +
                '         @ok="verify_edit_directive($event)" ' +
                '         v-model="show_modal"> ' +
                '  <b-form>' +
                '    <b-form-group label="Name:">' +
                '      <b-form-input type="text" ' +
                '                    :state="valid(directive.name)" ' +
                '                    v-model="directive.name" ' +
                '                    required ' +
                '                    placeholder="Enter name" ' +
                '                    size="sm" ' +
                '                    title="Directive name">' +
                '      </b-form-input>' +
                '    </b-form-group>' +
                '    <b-form-group label="action:">' +
                '      <b-form-select :options="actionTypes" ' +
                '                     required ' +
                '                     v-model="directive.action" ' +
                '                     :state="valid(directive.action)" ' +
                '                     size="sm"' +
                '                     title="Action">' +
                '      </b-form-select>' +
                '    </b-form-group>' +
                '    <b-form-group label="Size:" ' +
                '                  v-if="directive.action != \'data_segment\' && directive.action != \'code_segment\' && directive.action != \'main_function\' && directive.action != \'kmain_function\' && directive.action != \'global_symbol\' && directive.action != \'data_size\' && directive.action != \'ascii_not_null_end\' && directive.action != \'ascii_null_end\' && directive.action != \'align\' && directive.action != \'balign\'">' +
                '      <b-form-input type="number" ' +
                '                    :state="valid(directive.size)" ' +
                '                    v-model="directive.size" ' +
                '                    required ' +
                '                    placeholder="Enter size" ' +
                '                    size="sm" ' +
                '                    min="0" ' +
                '                    title="Directive size">' +
                '      </b-form-input>' +
                '    </b-form-group>' +
                '  </b-form>' +
                '</b-modal>'

  }

  Vue.component('directives-edit', uielto_directives_edit) ;