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

  var uielto_registers = {

        props:      {
                      registers:                     { type: Array,   required: true },
                      register_file:                 { type: Number,  required: true }
                    },

        data:       function () {
                      return {
                        //Directives table fields
                        registers_fields: ['name', 'ID', 'nbits', 'default_value', 'properties', 'actions'],
                      }
                    },

        methods:    {
                      


                      //Show edit element modal
                      edit_register_modal(elem, comp, button){
                        app._data.modalEditElement.element = elem;
                        app._data.modalEditElement.type = architecture.components[comp].type;
                        app._data.modalEditElement.double_precision = architecture.components[comp].double_precision;

                        app._data.simple_reg = [];
                        for (var i = 0; i < architecture_hash.length; i++){
                          for (var j = 0; j < architecture.components[i].elements.length && architecture.components[i].type =="floating point" && architecture.components[i].double_precision == false; j++){
                            app._data.simple_reg.push({ text: architecture.components[i].elements[j].name, value: architecture.components[i].elements[j].name},);
                          }
                        }

                        for(var j=0; j < architecture.components[comp].elements.length; j++){
                          if(elem == architecture.components[comp].elements[j].name){
                            app._data.modalEditElement.name = elem;
                            app._data.modalEditElement.properties = architecture.components[comp].elements[j].properties;
                            if(app._data.modalEditElement.double_precision == true){
                              app._data.modalEditElement.simple1 = architecture.components[comp].elements[j].simple_reg[0];
                              app._data.modalEditElement.simple2 = architecture.components[comp].elements[j].simple_reg[1];
                            }
                            else{
                              app._data.modalEditElement.defValue = (architecture.components[comp].elements[j].default_value).toString();
                            }
                          }
                        }

                        var id = 0;
                        for(var i = 0; i < architecture.components.length; i++){
                          for(var j = 0; j < architecture.components[i].elements.length; j++){
                            if(architecture.components[i].elements[j].name == app._data.modalEditElement.name){
                              app._data.modalEditElement.id = id;
                            }
                            if(architecture.components[i].type == architecture.components[comp].type && architecture.components[i].double_precision == architecture.components[comp].double_precision){
                              id++;
                            }
                          }
                        }

                        this.$root.$emit('bv::show::modal', 'edit_register', button);
                      },

                      //Show delete element modal
                      delete_register_modal(elem, button){
                        app._data.modalDeletElement.title = "Delete Register";
                        app._data.modalDeletElement.element = elem;

                        this.$root.$emit('bv::show::modal', 'delete_register', button);
                      },

                      element_id(name, type, double){
                        var id = 0;
                        for(var i = 0; i < architecture.components.length; i++){
                          for(var j = 0; j < architecture.components[i].elements.length; j++){
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
                    '    {{element_id(registers[row.index].name, architecture.components[register_file].type, architecture.components[register_file].double_precision)}}' +
                    '  </template>' +
                    '' +
                    '  <template v-slot:cell(properties)="row">' +
                    '    <b-badge class="m-1" v-for="propertie in registers[row.index].properties" pill variant="primary">{{propertie}}</b-badge>' +
                    '  </template>' +
                    '' +
                    '  <template v-slot:cell(actions)="row">' +
                    '    <b-button @click.stop="edit_register_modal(row.item.name, register_file, $event.target)" ' +
                    '              class="btn btn-outline-secondary btn-sm buttonBackground h-100">' +
                    '      <span class="far fa-edit"></span>' +
                    '      Edit' +
                    '    </b-button>' +
                    '    <b-button @click.stop="delete_register_modal(row.item.name, $event.target)"' +
                    '              class="btn btn-outline-danger btn-sm buttonBackground h-100">' +
                    '      <span class="far fa-trash-alt"></span>' +
                    '      Delete' +
                    '    </b-button> ' +
                    '  </template>' +
                    '</b-table>'

  }

  Vue.component('registers', uielto_registers) ;