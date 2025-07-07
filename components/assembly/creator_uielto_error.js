
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

  var uielto_assembly_error = {

        props:      {
                      id:                    { type: String, required: true },
                      ref:                   { type: String, required: true },
                      modal_assembly_error:  { type: Object, required: true },
                      dark_mode:             { type: String, required: true }
                    },

        template:   ' <b-modal :id="id"' +
                    '          title="Assembly Code Error"' +
                    '          :ref="ref"' +
                    '          hide-footer' +
                    '          size="lg">' +
                    ' ' +
                    '   <span class="h6 font-weight-light">Error message:</span>' +
                    ' ' +
                    '   <div :error_dark="dark_mode" class="errorAssembly" >' +
                    '     <span class="h6 text-monospace" label="Error message:" v-html="modal_assembly_error.error">' +
                    '     </span>' +
                    '   </div>' +
                    '   <br>' +
                    ' </b-modal>'
  }

  Vue.component('assembly-error', uielto_assembly_error) ;
