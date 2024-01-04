
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

  var uielto_save_library = {

        props:      {
                      id:                  { type: String, required: true }
                    },

        data:       function () {
                      return {
                        /*Saved file name*/
                        name_binary_save: ''
                      }
                    },

        methods:    {
                      //Save a binary in a local file
                      library_save ()
                      {
                        if (assembly_compiler() == -1) {
                          return;
                        }

                        promise.then((message) => 
                        {
                          if (message == "-1") {
                            return;
                          }

                          if (creator_memory_is_segment_empty(memory_hash[0]) === false) {
                            show_notification('You can not enter data in a library', 'danger') ;
                            return;
                          }

                          for (var i = 0; i < instructions_binary.length; i++)
                          {
                            console_log(instructions_binary[i].Label)
                            if (instructions_binary[i].Label == "main_symbol") {
                              show_notification('You can not use the "main" tag in a library', 'danger') ;
                              return;
                            }
                          }

                          var aux = {instructions_binary: instructions_binary, instructions_tag: instructions_tag};

                          var textToWrite = JSON.stringify(aux, null, 2);
                          var textFileAsBlob = new Blob([textToWrite], { type: 'text/json' });
                          var fileNameToSaveAs;

                          if (this.name_binary_save == '') {
                            fileNameToSaveAs = "binary.o";
                          }
                          else {
                            fileNameToSaveAs = this.name_binary_save + ".o";
                          }

                          var downloadLink = document.createElement("a");
                          downloadLink.download = fileNameToSaveAs;
                          downloadLink.innerHTML = "My Hidden Link";

                          window.URL = window.URL || window.webkitURL;

                          downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
                          downloadLink.onclick = destroyClickedElement;
                          downloadLink.style.display = "none";
                          document.body.appendChild(downloadLink);

                          downloadLink.click();

                          this.name_binary_save = '';

                          show_notification('Save binary', 'success') ;
                        });
                      },

                      //Stop user interface refresh
                      debounce: _.debounce(function (param, e) {
                        console_log(param);
                        console_log(e);

                        e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        var re = new RegExp("'","g");
                        e = e.replace(re, '"');
                        re = new RegExp("[\f]","g");
                        e = e.replace(re, '\\f');
                        re = new RegExp("[\n\]","g");
                        e = e.replace(re, '\\n');
                        re = new RegExp("[\r]","g");
                        e = e.replace(re, '\\r');
                        re = new RegExp("[\t]","g");
                        e = e.replace(re, '\\t');
                        re = new RegExp("[\v]","g");
                        e = e.replace(re, '\\v');

                        if(e == ""){
                          this[param] = null;
                          return;
                        }

                        console_log("this." + param + "= '" + e + "'");

                        eval("this." + param + "= '" + e + "'");

                        //this[param] = e.toString();
                        app.$forceUpdate();
                      }, getDebounceTime())
                    },

        template:   '<b-modal  :id = "id"' +
                    '          title = "Save Binary" ' +
                    '          ok-title="Save to File" ' +
                    '          @ok="library_save">' +
                    ' ' +
                    '  <p> Please write the file name: </p> ' +
                    '  <b-form-input v-on:input="debounce(\'name_binary_save\', $event)" ' +
                    '                :value="name_binary_save"' +
                    '                type="text"' +
                    '                placeholder="File name where binary will be saved"' +
                    '                title="File name">' +
                    '  </b-form-input>' +
                    '</b-modal>'
  }

  Vue.component('save-library', uielto_save_library) ;

  /*Determines the refresh timeout depending on the device being used*/
  function getDebounceTime(){
    if(screen.width > 768){
      return 500;
    }
    else{
      return 1000;
    }
  }