
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

  var uielto_directives = {

    props:      {
                  directives:                     { type: Array,  required: true }
                },

    data:       function () {
                  return {
                    //Directives table fields
                    directivesFields: ['name', 'action', 'size'],
                  }
                },

    methods:    {

                },

    template:   '<div>' +
                '  <div class="col-lg-12 col-sm-12 mt-3">' +
                '    <b-table small ' +
                '             :items="directives" ' +
                '             :fields="directivesFields" ' +
                '             class="text-center" ' +
                '             sticky-header="60vh">' +
                '    </b-table>' +
                '  </div>' +
                '</div>'

  }

  Vue.component('directives', uielto_directives) ;