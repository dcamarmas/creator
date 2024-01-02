
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

  var uielto_load_assembly = {

        props:      {
                      id:                  { type: String, required: true }
                    },

        data:       function () {
                      return {
                        //Load file name
                        load_assembly: '',
                      }
                    },

        methods:    {
                      //Load new assembly code into text area
                      assembly_update(){
                        if(code_assembly != ""){
                          textarea_assembly_editor.setValue(code_assembly);
                          show_notification(' The selected program has been loaded correctly', 'success') ;
                        }
                        else{
                          show_notification("Please select one program", 'danger');
                        }
                      },

                      /*Load external assembly code*/
                      read_assembly(e){
                        show_loading();
                        var file;
                        var reader;
                        var files = document.getElementById('assembly_file').files;

                        for (var i = 0; i < files.length; i++){
                          file = files[i];
                          reader = new FileReader();
                          reader.onloadend = onFileLoaded;
                          reader.readAsBinaryString(file);
                        }

                        function onFileLoaded(event) {
                          code_assembly = event.currentTarget.result;
                        }
                        hide_loading();

                        /* Google Analytics */
                        creator_ga('assembly', 'assembly.load', 'assembly.load');
                      },
                    },

        template:   ' <b-modal  :id = "id"' +
                    '           title = "Load Assembly"' +
                    '           ok-title="Load from this File"' +
                    '           @ok="assembly_update">' +
                    ' ' +
                    '   <p> Please select the assembly file to be loaded </p> ' +
                    '   <b-form-file v-model="load_assembly"' +
                    '                :state="Boolean(load_assembly)" ' +
                    '                placeholder="Choose a file..." ' +
                    '                accept=".s" ' +
                    '                @change="read_assembly" ' +
                    '                id="assembly_file">' +
                    '   </b-form-file>' +
                    ' </b-modal>'
  }

  Vue.component('load-assembly', uielto_load_assembly) ;