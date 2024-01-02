
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

  var uielto_assembly_error = {

        props:      {
                      id:                    { type: String, required: true },
                      ref:                   { type: String, required: true },
                      modal_assembly_error:  { type: Object, required: true }
                    },

        template:   ' <b-modal :id="id"' +
                    '          title="Assembly Code Error"' +
                    '          :ref="ref"' +
                    '          hide-footer' +
                    '          size="lg">' +
                    ' ' +
                    '   <span class="h6 font-weight-light">Code fragment:</span>' +
                    ' ' +
                    '   <div class="errorAssembly">' +
                    '     <span class="h6 text-monospace" label="Code fragment:">' +
                    '       <b-container>' +
                    '         <b-row>' +
                    '           <b-col class="px-0"         >&nbsp;</b-col>' +
                    '           <b-col class="px-2"         >...</b-col>' +
                    '           <b-col class="pl-2" cols="10">&nbsp;</b-col>' +
                    '         </b-row>' +
                    ' ' +
                    '         <b-row>' +
                    '           <b-col class="px-0"         >&nbsp;</b-col>' +
                    '           <b-col class="px-2"         >{{modal_assembly_error.line1}}</b-col>' +
                    '           <b-col class="pl-2" cols="10">{{modal_assembly_error.code1}}</b-col>' +
                    '         </b-row>' +
                    ' ' +
                    '         <b-row>' +
                    '           <b-col class="px-0"         >*</b-col>' +
                    '           <b-col class="px-2"         >{{modal_assembly_error.line2}}</b-col>' +
                    '           <b-col class="pl-2" cols="10">{{modal_assembly_error.code2}}</b-col>' +
                    '         </b-row>' +
                    ' ' +
                    '         <b-row>' +
                    '           <b-col class="px-0"         >&nbsp;</b-col>' +
                    '           <b-col class="px-2"         >{{modal_assembly_error.line3}}</b-col>' +
                    '           <b-col class="pl-2" cols="10">{{modal_assembly_error.code3}}</b-col>' +
                    '         </b-row>' +
                    ' ' +
                    '         <b-row>' +
                    '           <b-col class="px-0"         >&nbsp;</b-col>' +
                    '           <b-col class="px-2"         >...</b-col>' +
                    '           <b-col class="pl-2" cols="10">&nbsp;</b-col>' +
                    '         </b-row>' +
                    '       </b-container>' +
                    '     </span>' +
                    '   </div>' +
                    '   <br>' +
                    ' ' +
                    '   <span class="h6 font-weight-light">Error description:</span>' +
                    '   <br>' +
                    '   <span class="h6">{{modal_assembly_error.error}}</span>' +
                    '   <br>' +
                    ' </b-modal>'
  }

  Vue.component('assembly-error', uielto_assembly_error) ;