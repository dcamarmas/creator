
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

  var uielto_shortcuts = {

        props:      {
                      target:  { type: String, required: true },
                      browser:  { type: String, required: true }
                    },

        template:   ' <b-popover :target="target" title="Shortcuts" triggers="hover focus" placement="bottomright">' +
                    '   <b-list-group>' +
                    '     <b-list-group-item class="d-flex justify-content-between align-items-center">' +
                    '       Copy &nbsp&nbsp' +
                    '       <b-badge variant="primary" pill v-if="browser != \'Mac\'"> Ctrl + c</b-badge>' +
                    '       <b-badge variant="primary" pill v-if="browser == \'Mac\'"> ⌘ + c</b-badge>' +
                    '     </b-list-group-item>' +
                    ' ' +
                    '     <b-list-group-item class="d-flex justify-content-between align-items-center">' +
                    '       Cut&nbsp &nbsp&nbsp' +
                    '       <b-badge variant="primary" pill v-if="browser != \'Mac\'"> Ctrl + x</b-badge>' +
                    '       <b-badge variant="primary" pill v-if="browser == \'Mac\'"> ⌘ + x</b-badge>' +
                    '     </b-list-group-item>' +
                    ' ' +
                    '     <b-list-group-item class="d-flex justify-content-between align-items-center">' +
                    '       Paste &nbsp&nbsp' +
                    '       <b-badge variant="primary" pill v-if="browser != \'Mac\'"> Ctrl + v</b-badge>' +
                    '       <b-badge variant="primary" pill v-if="browser == \'Mac\'"> ⌘ + v</b-badge>' +
                    '     </b-list-group-item>' +
                    ' ' +
                    '     <b-list-group-item class="d-flex justify-content-between align-items-center">' +
                    '       Select all &nbsp&nbsp' +
                    '       <b-badge variant="primary" pill v-if="browser != \'Mac\'"> Ctrl + a</b-badge>' +
                    '       <b-badge variant="primary" pill v-if="browser == \'Mac\'"> ⌘ + a</b-badge>' +
                    '     </b-list-group-item>' +
                    ' ' +
                    '     <b-list-group-item class="d-flex justify-content-between align-items-center">' +
                    '       Undo &nbsp&nbsp' +
                    '       <b-badge variant="primary" pill v-if="browser != \'Mac\'"> Ctrl + z</b-badge>' +
                    '       <b-badge variant="primary" pill v-if="browser == \'Mac\'"> ⌘ + z</b-badge>' +
                    '     </b-list-group-item>' +
                    ' ' +
                    '     <b-list-group-item class="d-flex justify-content-between align-items-center">' +
                    '       Redo &nbsp&nbsp' +
                    '       <b-badge variant="primary" pill v-if="browser != \'Mac\'"> Ctrl + y</b-badge>' +
                    '       <b-badge variant="primary" pill v-if="browser == \'Mac\'"> ⌘ + y</b-badge>' +
                    '     </b-list-group-item>' +
                    ' ' +
                    '     <b-list-group-item class="d-flex justify-content-between align-items-center">' +
                    '       Block code comment &nbsp&nbsp' +
                    '       <b-badge variant="primary" pill> Ctrl + m</b-badge>' +
                    '     </b-list-group-item>' +
                    '   </b-list-group>' +
                    ' </b-popover>'
  }

  Vue.component('popover-shortcuts', uielto_shortcuts) ;