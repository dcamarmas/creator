/*
 *  Copyright 2018-2023 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos
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

                      }
                    },

        methods:    {
                      make_uri ()
                      {
                        return "https://dcamarmas.github.io/creator/?architecture=rv&asm=" + encodeURIComponent(code_assembly);
                      },

                      copy_uri ()
                      {
                        // Create a dummy input to copy the string array inside it
                        var dummy = document.createElement("input");

                        // Add it to the document
                        document.body.appendChild(dummy);

                        // Set its ID
                        dummy.setAttribute("id", "dummy_id");

                        // Output the array into it
                        document.getElementById("dummy_id").value="https://dcamarmas.github.io/creator/?architecture=rv&asm=" + encodeURIComponent(code_assembly);

                        // Select it
                        dummy.select();

                        // Copy its contents
                        document.execCommand("copy");

                        // Remove it as its not needed anymore
                        document.body.removeChild(dummy);
                      }
                    },

        template:   '<b-modal  :id = "id"' +
                    '          title = "URI" ' +
                    '          ok-title="Copy" ' +
                    '          @ok="copy_uri">' +
                    ' ' +
                    '  <b-form-textarea v-model="make_uri()" :rows="4"></b-form-textarea> ' +
                    '</b-modal>'
  }

  Vue.component('make-uri', uielto_uri) ;