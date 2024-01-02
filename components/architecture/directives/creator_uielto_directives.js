
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

  var uielto_directives = {

    props:      {
                  directives:                     { type: Array,  required: true }
                },

    data:       function () {
                  return {
                    //Directives table fields
                    directivesFields: ['name', 'action', 'size', 'actions'],
                  }
                },

    methods:    {
                  //Show edit directive modal
                  edit_directive_modal(name, index, button)
                  {
                    app._data.modal_edit_directive.title = "Edit " + name;
                    app._data.modal_edit_directive.index = index;
                    app._data.modal_edit_directive.directive = Object.assign({}, architecture.directives[index]);

                    this.$root.$emit('bv::show::modal', 'edit_directive', button);
                  },
                  
                  //Show delete directive modal
                  delete_directive_modal(name, index, button)
                  {
                    app._data.modal_delete_directive.title = "Delete " + name;
                    app._data.modal_delete_directive.index = index;

                    this.$root.$emit('bv::show::modal', 'delete_directive', button);
                  }
                },

    template:   '<div>' +
                '  <br>' +
                '  <span class="h6">Directives set:</span>' +
                '' +
                '  <div class="col-lg-12 col-sm-12 row">' +
                '    <div class="compMenu">' +
                '      <b-button class="btn btn-outline-secondary btn-sm buttonBackground h-100" ' +
                '                id="newDirectiveBtn" ' +
                '                v-b-modal.new_directive> ' +
                '        <span class="fas fa-plus-circle"></span>' +
                '        New Directive' +
                '      </b-button>' +
                '    </div>' +
                '' +
                '    <div class="compMenu">' +
                '      <b-button class="btn btn-outline-danger btn-sm buttonBackground h-100" ' +
                '                id="resetDirectives" ' +
                '                v-b-modal.reset_directives> ' +
                '        <span class="fas fa-power-off"></span>' +
                '        Reset Directives' +
                '      </b-button>' +
                '    </div>' +
                '  </div>' +
                '' +
                '  <div class="col-lg-12 col-sm-12 mt-3">' +
                '    <b-table small ' +
                '             :items="directives" ' +
                '             :fields="directivesFields" ' +
                '             class="text-center" ' +
                '             sticky-header="60vh">' +
                '      <template v-slot:cell(actions)="row" class="">' +
                '        <b-button @click.stop="edit_directive_modal(row.item.name, row.index, $event.target)" ' +
                '                  class="btn btn-outline-secondary btn-sm buttonBackground h-100">' +
                '          <span class="far fa-edit"></span> ' +
                '          Edit' +
                '        </b-button>' +
                '        <b-button @click.stop="delete_directive_modal(row.item.name, row.index, $event.target)"' +
                '                  class="btn btn-outline-danger btn-sm buttonBackground h-100">' +
                '          <span class="far fa-trash-alt"></span>' +
                '          Delete' +
                '        </b-button> ' +
                '      </template>' +
                '    </b-table>' +
                '  </div>' +
                '</div>'

  }

  Vue.component('directives', uielto_directives) ;