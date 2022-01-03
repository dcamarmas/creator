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

  var uielto_monitor = {

  props:      {
                display:  { type: String, required: true }
              },

template:     ' <div class="col-rt-12 col-lg-6 col-sm-12 my-2 mx-0 p-0">' +
              '   <b-container fluid align-h="start">' +
              '     <b-row cols="2" align-h="start">' +
              '       <b-col cols="1">' +
              '         <span class="fas fa-desktop fa-2x mb-2 consoleIcon"></span>' +
              '       </b-col>' +
              '       <b-col lg="11" cols="12" class="pr-0">' +
              '         <b-form-textarea id="textarea_display" ' +
              '                          v-model="display" ' +
              '                          rows="5" ' +
              '                          disabled ' +
              '                          no-resize ' +
              '                          title="Display">' +
              '         </b-form-textarea>' +
              '       </b-col>' +
              '     </b-row>' +
              '   </b-container>' +
              ' </div>'

  }

  Vue.component('monitor', uielto_monitor) ;