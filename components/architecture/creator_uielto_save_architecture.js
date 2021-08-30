/*
 *  Copyright 2018-2021 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos
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

  var uielto_save_architecture = {

        props:      {
                      id:                  { type: String, required: true }
                    },

        data:       function () {
                      return {
                        //Saved file name
                        name_arch_save: ''
                      }
                    },

        methods:    {
                      arch_save(){
                        var auxObject = jQuery.extend(true, {}, architecture);
                        var auxArchitecture = register_value_serialize(auxObject);

                        auxArchitecture.components.forEach((c, i) => {
                          c.elements.forEach((e, j) => {
                            if (e.default_value) e.value = e.default_value;
                            else e.value = "0";
                          });
                        });

                        var textToWrite = JSON.stringify(auxArchitecture, null, 2);
                        var textFileAsBlob = new Blob([textToWrite], { type: 'text/json' });
                        var fileNameToSaveAs;

                        if(this.name_arch_save == ''){
                          fileNameToSaveAs = "architecture.json";
                        }
                        else{
                          fileNameToSaveAs = this.name_arch_save + ".json";
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

                        show_notification('Save architecture', 'success') ;
                      },

                      // Form validator
                      valid(value){
                        if(parseInt(value) != 0){
                          if(!value){
                            return false;
                          }
                          else{
                            return true;
                          }
                        }
                        else{
                          return true;
                        }
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

        template:   '<b-modal  :id ="id" ' +
                    '          title = "Save Architecture" ' +
                    '          ok-title="Save to File" ' +
                    '          @ok="arch_save">' +
                    '  <span class="h6">Enter the name of the architecture to save:</span>' +
                    '  <br>' +
                    '  <b-form-input v-on:input="debounce(\'name_arch_save\', $event)" ' +
                    '                :value="name_arch_save" ' +
                    '                type="text" ' +
                    '                placeholder="Enter the name" ' +
                    '                class="form-control form-control-sm fileForm" ' +
                    '                title="Save Architecture"' +
                    '                :state="valid(name_arch_save)">' +
                    '  </b-form-input>' +
                    '</b-modal>'
  }

  Vue.component('save-architecture', uielto_save_architecture) ;