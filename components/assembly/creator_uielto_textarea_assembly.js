
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

  var uielto_textarea_assembly = {

  props:      {
                browser:   { type: String, required: true }
              },

  template:   ' <div>' +
              '   <span id="assemblyInfo" class="fas fa-info-circle"></span> <span class="h5">Assembly:</span>' +
              ' ' +
              '   <popover-shortcuts target="assemblyInfo" :browser="browser"></popover-shortcuts>' +
              ' ' +
              '   <textarea id="textarea_assembly" rows="14" class="code-scroll-y d-none" title="Asembly Code"></textarea>' +
              ' </div>'

  }

  Vue.component('textarea-assembly', uielto_textarea_assembly) ;