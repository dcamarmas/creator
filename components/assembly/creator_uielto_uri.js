
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

  var uielto_uri = {

        props:      {
                      id:                  { type: String, required: true }
                    },

        data:       function () {
                      return {
                        uri: ""
                      }
                    },

        methods:    {
                      make_uri ()
                      {
                        this.uri = (window.location.href.split('?')[0]).split('#')[0] + "?architecture="+ encodeURIComponent(app._data.architecture_name) + "&asm=" + encodeURIComponent(textarea_assembly_editor.getValue());
                      },

                      copy_uri ()
                      {
                        navigator.clipboard.writeText(this.uri);
                      }
                    },

        template:   '<b-modal  :id = "id"' +
                    '          title = "URI" ' +
                    '          hide-footer' +
                    '          class="text-center"' +
                    '          @shown=make_uri>' +
                    ' ' +
                    '  <div class="text-center">' +
                    '    <b-form-textarea v-model="uri" :rows="5"></b-form-textarea> ' +
                    '    <br> ' +
                    '    <b-button variant="info" @click="copy_uri()">' +
                    '      <span class="fas fa-copy"></span> Copy' +
                    '    </b-button>' +
                    '  </div>' +
                    '</b-modal>'
  }

  Vue.component('make-uri', uielto_uri) ;