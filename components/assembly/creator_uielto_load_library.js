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


  var uielto_load_library = {

        props:      {
                      id:                  { type: String, required: true }
                    },

        data:       function () {
                      return {
                        //Binary code loaded
                        name_binary_load: ''
                      }
                    },
                    

        methods:    {
          closeModal() {
            // Cierra el modal
            this.$bvModal.hide(this.id);
          },            
          library_update(){
                        if (code_binary.length !== 0){
                            update_binary = JSON.parse(code_binary);
                            load_binary = true;
                            $("#divAssembly").attr("class", "col-lg-10 col-sm-12");
                            $("#divTags").attr("class", "col-lg-2 col-sm-12");
                            $("#divTags").show();
                            show_notification("The selected library has been loaded correctly", 'success');
                        }
                        else{
                            show_notification("Please select one library", 'danger');
                        }
                      },

                      //Load binary file
                      library_load(e){
                        var file;
                        var reader;
                        var files = document.getElementById('binary_file').files;

                        for (var i = 0; i < files.length; i++) {
                             file = files[i];
                             reader = new FileReader();
                             reader.onloadend = onFileLoaded;
                             reader.readAsBinaryString(file);
                        }

                        function onFileLoaded(event) {
                           code_binary = event.currentTarget.result;
                           this.$bvModal.hide(this.id);
                        }
                      },

                      library_load_creatino() {
                        var reader;
                        var baseUrl = window.location.origin; 
                        var filePath = baseUrl + '/creator/test/riscv/correct/libraries/creatino.o';
                        
                        fetch(filePath, {
                            method: 'GET',
                        })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Error al cargar el archivo: ' + response.statusText);
                            }
                            return response.arrayBuffer();
                        })
                        .then(data => {
                            var blob = new Blob([data]);
                            reader = new FileReader();
                    
                            reader.onloadend = () => {
                                code_binary = reader.result;
                                console.log('Archivo cargado correctamente');
                                this.library_update(); // Llamar a library_update después de cargar el archivo
                                this.$bvModal.hide(this.id);
                            };
                    
                            reader.readAsBinaryString(blob);
                        })
                        .catch(error => {
                            console.error('Error:', error);
                        });
                    },
                    

                        
                    },
            // Hooks de ciclo de vida
    created() {
      console.log('Componente creado');
      // Escuchar el evento global
      this.$root.$on('library_load_creatino', this.library_load_creatino);
    },

  beforeDestroy() {
      console.log('Componente va a ser destruido');
      // Remover el listener del evento global
      this.$root.$off('library_load_creatino', this.library_load_creatino);
    },            

        template:   ' <b-modal  :id = "id"' +
                    '           title = "Load Binary" ' +
                    '           ok-title="Load from this File" ' +
                    '           @ok="library_update">' +
                    ' ' +
                    '   <p> Please select the binary file to be loaded </p> ' +
                    '   <b-form-file v-model="name_binary_load" ' +
                    '                :state="Boolean(name_binary_load)" ' +
                    '                placeholder="Choose a file..." ' +
                    '                accept=".o" ' +
                    '                @change="library_load" ' +
                    '                id="binary_file">' +
                    '   </b-form-file>' +
                    '<template #modal-footer>'+
                    '   <b-button @click="closeModal" variant="secondary">Cancel</b-button>'+
                    '   <b-button  variant="primary" @click="library_update">Load from this File</b-button>'+
                    '</template>'+
                    ' </b-modal>'
                    
  }

                      
  Vue.component('load-library', uielto_load_library) ;