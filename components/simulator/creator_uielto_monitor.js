
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

  var uielto_monitor = {

  props:      {
                display:  { type: String, required: true }
              },

template:     ' <b-container fluid align-h="start" class="mx-0 px-0">' +
              '   <b-row cols="2" align-h="start">' +
              '     <b-col cols="1">' +
              '       <span class="fas fa-desktop fa-2x mb-2 consoleIcon"></span>' +
              '     </b-col>' +
              '     <b-col lg="11" cols="12">' +
              '       <b-form-textarea id="textarea_display" ' +
              '                        v-model="display" ' +
              '                        rows="5" ' +
              '                        disabled ' +
              '                        no-resize ' +
              '                        title="Display">' +
              '       </b-form-textarea>' +
              '     </b-col>' +
              '   </b-row>' +
              ' </b-container>'

  }

  Vue.component('monitor', uielto_monitor) ;