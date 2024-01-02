
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

  var uielto_register_file = {

    props:      {
                  register_file:                     { type: Array,    required: true }
                },

    data:       function () {
                  return {
                    
                  }
                },

    methods:    {
                  //Show edit component modal
                  edit_register_file_modal(name, index, button)
                  {
                    app._data.modal_edit_register_file.title = "Edit " + name;
                    app._data.modal_edit_register_file.name  = name;
                    app._data.modal_edit_register_file.index = index;

                    this.$root.$emit('bv::show::modal', 'edit_register_file', button);
                  },

                  //Show delete component modal
                  delete_register_file_modal(index, button)
                  {
                    app._data.modal_delete_register_file.title = "Delete " + name;
                    app._data.modal_delete_register_file.index = index;

                    this.$root.$emit('bv::show::modal', 'delete_register_file', button);
                  },

                  //Show new register modal
                  new_register_modal(name, index, button)
                  {
                    app._data.modal_new_register.register_file_index   = index;
                    app._data.modal_new_register.type                  = architecture.components[index].type;
                    app._data.modal_new_register.double_precision      = architecture.components[index].double_precision;
                    app._data.modal_new_register.double_precision_type = architecture.components[index].double_precision_type;
                    
                    //Load all simple precision registers at the moment //TODO: improve the search
                    app._data.modal_new_register.simple_reg = [];
                    for (var i = 0; i < architecture_hash.length; i++)
                    {
                      for (var j = 0; j < architecture.components[i].elements.length && architecture.components[i].type =="fp_registers" && architecture.components[i].double_precision === false; j++){
                        app._data.modal_new_register.simple_reg.push({ text: architecture.components[i].elements[j].name, value: architecture.components[i].elements[j].name},);
                      }
                    }

                    //Generate new register ID //TODO: improve the search
                    var id = 0;
                    for(var i = 0; i < architecture.components.length; i++)
                    {
                      for(var j = 0; j < architecture.components[i].elements.length; j++)
                      {
                        if(architecture.components[i].name == name && architecture.components[i].elements.length-1 == j)
                        {
                          id++;
                          app._data.modal_new_register.reg_id = id;
                        }
                        if(architecture.components[i].type == architecture.components[index].type && architecture.components[i].double_precision == architecture.components[index].double_precision){
                          id++;
                        }
                      }
                    }

                    this.$root.$emit('bv::show::modal', 'new_register', button);
                  },
                },

    template:   '<div>' +
                '  <br>' +
                '  <span class="h6">Register file of the architecture:</span>' +
                '' +
                '  <div class="col-lg-12 col-sm-12 row">' +
                '    <div class="compMenu">' +
                '      <b-button class="btn btn-outline-secondary btn-sm buttonBackground h-100" ' +
                '                id="newComponentBtn" ' +
                '                v-b-modal.new_register_file> ' +
                '        <span class="fas fa-plus-circle"></span> ' +
                '        New Register File' +
                '      </b-button>' +
                '    </div>' +
                '' +
                '    <div class="compMenu">' +
                '      <b-button class="btn btn-outline-danger btn-sm buttonBackground h-100"' +
                '                id="resetArchitecture"' +
                '                v-b-modal.reset_register_file>' +
                '        <span class="fas fa-power-off"></span>' +
                '        Reset Register Rile' +
                '      </b-button>' +
                '    </div>' +
                '' +
                '  </div>' +
                '' +
                '' +
                '  <!-- Register File table -->' +
                '  <div class="col-lg-12 col-sm-12 p-0">' +
                '    <br>' +
                '    <div class="col-lg-12 col-sm-12 px-0" v-for="(item, index) in register_file">' +
                '' +
                '      <!-- For each register file -->' +
                '      <b-card no-body class="mb-1">' +
                '        <b-card-header header-tag="header" class="p-1" role="tab">' +
                '          <b-btn block href="#" ' +
                '                 v-b-toggle="index.toString()" ' +
                '                 class="btn btn-outline-secondary btn-sm buttonBackground">' +
                '            {{item.name}}' +
                '          </b-btn>' +
                '        </b-card-header>' +
                '        <b-collapse :id="index.toString()"' +
                '                    visible accordion="my-accordion" ' +
                '                    role="tabpanel" ' +
                '                    class="architecture-scroll-y">' +
                '          <b-card-body>' +
                '' +
                '' +
                '            <registers  :registers="architecture.components[index].elements"' +
                '                        :register_file_index="index">' +
                '            </registers>' +
                '' +
                '' +
                '            <b-button class="btn btn-outline-secondary btn-sm buttonBackground h-100" ' +
                '                      :id="\'new \'+item.name" ' +
                '                      @click="new_register_modal(item.name, index, $event.target)"> ' +
                '              <span class="fas fa-plus-circle"></span> ' +
                '              New Register' +
                '            </b-button>' +
                '' +
                '            <b-button class="btn btn-outline-secondary btn-sm buttonBackground h-100" ' +
                '                      :id="\'edit \'+item.name" ' +
                '                      @click="edit_register_file_modal(item.name, index, $event.target)">' +
                '                      <span class="far fa-edit"></span>' +
                '              Edit Register File' +
                '            </b-button>' +
                '' +
                '            <b-button class="btn btn-outline-danger btn-sm buttonBackground h-100" ' +
                '                      :id="\'delete \'+item.name"' +
                '                      @click="delete_register_file_modal(index, $event.target)">' +
                '              <span class="far fa-trash-alt"></span>' +
                '              Delete Register File' +
                '            </b-button>' +
                '          </b-card-body>' +
                '        </b-collapse>' +
                '      </b-card>' +
                '    </div>' +
                '  </div>' +
                '</div>'

  }

  Vue.component('register-file-arch', uielto_register_file) ;