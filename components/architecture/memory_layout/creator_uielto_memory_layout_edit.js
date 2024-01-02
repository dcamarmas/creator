
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

  var uielto_memory_layout_form = {

    props:      {
                  id:                             { type: String, required: true }
                },

    data:       function () {
                  return {
                    memory_layout: ["", "", "", "", "", ""],

                    //Modals memory layout
                    show_modal: false,
                  }
                },

    methods:    {
                  //Check de memory layout changes
                  verify_edit_memory_layout(evt)
                  {
                    evt.preventDefault();

                    for(var i = 0; i < this.memory_layout.length; i++)
                    {
                      if (!this.memory_layout[i].value)
                      {
                        show_notification('Please complete all fields', 'danger') ;
                        return;
                      }

                      if(this.memory_layout[i].value != "" && this.memory_layout[i].value != null)
                      {
                        if(!isNaN(parseInt(this.memory_layout[i].value)))
                        {
                          if (parseInt(this.memory_layout[i].value) < 0) 
                          {
                            show_notification('The value can not be negative', 'danger') ;
                            return;
                          }
                        }
                        else 
                        {
                          show_notification('The value must be a number', 'danger') ;
                          return;
                        }
                      }

                      for (var j = i+1; j < this.memory_layout.length; j++)
                      {
                        if (parseInt(this.memory_layout[i].value) >= parseInt(this.memory_layout[j].value))
                        {
                          show_notification('The segment can not be overlap', 'danger') ;
                          return;
                        }
                      }
                    }

                    this.edit_memory_layout();
                  },

                  //Edit memory layout
                  edit_memory_layout()
                  {
                    this.show_modal = false;

                    architecture.memory_layout = structuredClone(this.memory_layout);

                    backup_stack_address = architecture.memory_layout[4].value;
                    backup_data_address = architecture.memory_layout[3].value;

                    show_notification('Memory layout correctly modified', 'success') ;
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
                '         title="Change memory layout" ' +
                '         ok-title="Change" ' +
                '         @ok="verify_edit_memory_layout($event)"' +
                '         v-model="show_modal"> ' +
                '  <b-form>' +
                '    <b-form-group label=".text Start:">' +
                '      <b-form-input type="text" ' +
                '                v-model="memory_layout[0].value" ' +
                '                :state="valid(memory_layout[0].value)" ' +
                '                required ' +
                '                size="sm" ' +
                '                class="memoryLayoutForm">' +
                '      </b-form-input>' +
                '    </b-form-group>' +
                '' +
                '    <b-form-group label=".text End:">' +
                '      <b-form-input type="text" ' +
                '                v-model="memory_layout[1].value" ' +
                '                :state="valid(memory_layout[1].value)" ' +
                '                required ' +
                '                size="sm" ' +
                '                class="memoryLayoutForm">' +
                '      </b-form-input>' +
                '    </b-form-group>' +
                '' +
                '    <b-form-group label=".data Start:">' +
                '      <b-form-input type="text" ' +
                '                v-model="memory_layout[2].value" ' +
                '                :state="valid(memory_layout[2].value)" ' +
                '                required ' +
                '                size="sm" ' +
                '                class="memoryLayoutForm">' +
                '      </b-form-input>' +
                '    </b-form-group>' +
                '' +
                '    <b-form-group label=".data End:">' +
                '      <b-form-input type="text" ' +
                '                v-model="memory_layout[3].value" ' +
                '                :state="valid(memory_layout[3].value)" ' +
                '                required ' +
                '                size="sm" ' +
                '                class="memoryLayoutForm">' +
                '      </b-form-input>' +
                '    </b-form-group>' +
                '' +
                '    <b-form-group label=".stack End:">' +
                '      <b-form-input type="text" ' +
                '                v-model="memory_layout[4].value" ' +
                '                :state="valid(memory_layout[4].value)" ' +
                '                required ' +
                '                size="sm" ' +
                '                class="memoryLayoutForm">' +
                '      </b-form-input>' +
                '    </b-form-group>' +
                '' +
                '    <b-form-group label=".stack Start:">' +
                '      <b-form-input type="text" ' +
                '                v-model="memory_layout[5].value"' +
                '                :state="valid(memory_layout[5].value)" ' +
                '                required size="sm" ' +
                '                class="memoryLayoutForm">' +
                '      </b-form-input>' +
                '    </b-form-group>' +
                '  </b-form>' +
                '</b-modal>'

  }

  Vue.component('memory-layout-edit', uielto_memory_layout_form) ;