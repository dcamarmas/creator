
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

  var uielto_registers = {

    props:      {
                  registers:                     { type: Array,   required: true },
                  register_file_index:           { type: Number,  required: true }
                },

    data:       function () {
                  return {
                    //Directives table fields
                    registers_fields: ['name', 'ID', 'nbits', 'default_value', 'properties', 'actions'],
                  }
                },

    methods:    {
                  //Show edit register modal
                  edit_register_modal(name, index, button)
                  {
                    app._data.modal_edit_register.title               = "Edit " + name;
                    app._data.modal_edit_register.register_file_index = this._props.register_file_index;
                    app._data.modal_edit_register.register_index      = index;

                    //Load all simple precision registers at the moment //TODO: improve the search
                    if (architecture.components[this._props.register_file_index].double_precision_type == 'linked') 
                    {
                      app._data.modal_edit_register.simple_reg = [];
                      for (var i = 0; i < architecture_hash.length; i++)
                      {
                        for (var j = 0; j < architecture.components[i].elements.length && architecture.components[i].type =="fp_registers" && architecture.components[i].double_precision === false; j++){
                          app._data.modal_edit_register.simple_reg.push({ text: architecture.components[i].elements[j].name, value: architecture.components[i].elements[j].name},);
                        }
                      }
                    }

                    //Generate new register ID //TODO: improve the search
                    var id = 0;
                    for(var i = 0; i < architecture.components.length; i++)
                    {
                      for(var j = 0; j < architecture.components[i].elements.length; j++)
                      {
                        if(architecture.components[i].elements[j].name == name){
                          app._data.modal_edit_register.reg_id = id;
                        }
                        if(architecture.components[i].type == architecture.components[this._props.register_file_index].type && architecture.components[i].double_precision == architecture.components[this._props.register_file_index].double_precision){
                          id++;
                        }
                      }
                    }

                    //Get register file information
                    app._data.modal_edit_register.type                  = architecture.components[this._props.register_file_index].type;
                    app._data.modal_edit_register.double_precision      = architecture.components[this._props.register_file_index].double_precision;
                    app._data.modal_edit_register.double_precision_type = architecture.components[this._props.register_file_index].double_precision_type;

                    ///Get register information
                    app._data.modal_edit_register.register = Object.assign({}, architecture.components[this._props.register_file_index].elements[index]);

                    this.$root.$emit('bv::show::modal', 'edit_register', button);
                  },

                  //Show delete register modal
                  delete_register_modal(name, register_index, button)
                  {
                    app._data.modal_delete_register.title               = "Delete " + name;
                    app._data.modal_delete_register.register_file_index = this._props.register_file_index;
                    app._data.modal_delete_register.register_index      = register_index;

                    this.$root.$emit('bv::show::modal', 'delete_register', button);
                  },

                  //Generate new register ID //TODO: improve the search
                  element_id(name, type, double)
                  {
                    var id = 0;
                    for(var i = 0; i < architecture.components.length; i++)
                    {
                      for(var j = 0; j < architecture.components[i].elements.length; j++)
                      {
                        if(architecture.components[i].elements[j].name == name){
                          return id;
                        }
                        if(architecture.components[i].type == type && architecture.components[i].double_precision == double){
                          id++;
                        }
                      }
                    }
                  },
                },

    template:   '<b-table  :items="registers" ' +
                '          class="text-center" ' +
                '          :fields="registers_fields" ' +
                '          v-if="registers.length > 0" ' +
                '          sticky-header>' +
                '' +
                '  <!-- For each register -->' +
                '' +
                '  <template v-slot:cell(name)="row">' +
                '    {{registers[row.index].name.join(\' | \')}}' +
                '  </template>' +
                '' +
                '  <template v-slot:cell(ID)="row">' +
                '    {{element_id(registers[row.index].name, architecture.components[register_file_index].type, architecture.components[register_file_index].double_precision)}}' +
                '  </template>' +
                '' +
                '  <template v-slot:cell(properties)="row">' +
                '    <b-badge class="m-1" v-for="propertie in registers[row.index].properties" pill variant="primary">{{propertie}}</b-badge>' +
                '  </template>' +
                '' +
                '  <template v-slot:cell(actions)="row">' +
                '    <b-button @click.stop="edit_register_modal(row.item.name, row.index, $event.target)" ' +
                '              class="btn btn-outline-secondary btn-sm buttonBackground h-100">' +
                '      <span class="far fa-edit"></span>' +
                '      Edit' +
                '    </b-button>' +
                '    <b-button @click.stop="delete_register_modal(row.item.name, row.index, $event.target)"' +
                '              class="btn btn-outline-danger btn-sm buttonBackground h-100">' +
                '      <span class="far fa-trash-alt"></span>' +
                '      Delete' +
                '    </b-button> ' +
                '  </template>' +
                '</b-table>'

  }

  Vue.component('registers', uielto_registers) ;