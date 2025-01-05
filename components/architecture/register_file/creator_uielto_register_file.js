
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

  var uielto_register_file = {

    props:      {
                  register_file:                     { type: Array,    required: true }
                },

    data:       function () {
                  return {
                    
                  }
                },

    methods:    {
                  
                },

    template:   '<div>' +
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
                '            <registers  :registers="architecture.components[index].elements"' +
                '                        :register_file_index="index">' +
                '            </registers>' +
                '' +
                '          </b-card-body>' +
                '        </b-collapse>' +
                '      </b-card>' +
                '    </div>' +
                '  </div>' +
                '</div>'

  }

  Vue.component('register-file-arch', uielto_register_file) ;