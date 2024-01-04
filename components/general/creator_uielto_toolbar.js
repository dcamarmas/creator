
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

  var uielto_toolbar = {

    props:      {
                  id:                           { type: String,  required: true },
                  components:                   { type: String,  required: true },
                  browser:                      { type: String,  required: true },
                  arch_available:               { type: Array,   required: true }
                },

    computed:   {
                  components_array: function () {
                                                  return this._props.components.split('|')
                                                }
                },

    methods:    {
                  
                },

    template: '<b-container :id="id" fluid align-h="center" class="menu my-3 mx-0 px-0">' +
              ' <b-row cols-xl="4" cols-lg="3" cols-md="3" cols-sm="2" cols-xs="1" cols="1">' +
              '   <b-cols class="px-2 py-1"' +
              '           v-for="(item, index) in components_array">' +
              '     <toolbar-btngroup :group="item.split(\',\')"' +
              '                       :browser="browser"' +
              '                       :arch_available="arch_available">' +
              '     </toolbar-btngroup>' +
              ' ' +
              '     <div class="w-100 d-block d-sm-none"></div>' +
              '   </b-cols>' +
              ' </b-row>' +
              '</b-container>'
  }

  Vue.component('uielto-toolbar', uielto_toolbar) ;