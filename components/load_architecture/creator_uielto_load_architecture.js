
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

  var uielto_load_architecture = {

    props:      {

                },

    data:       function () {
                  return {
                    //Form inputs
                    name_arch: '',
                    description_arch: '',
                    load_arch: '',

                    //Show modal
                    show_modal: false
                  }
                },

    methods:    {
                  //Read the JSON of new architecture
                  read_arch(e)
                  {
                    show_loading();
                    e.preventDefault();

                    //Verify all form fields
                    if(!this.name_arch || !this.load_arch)
                    {
                      hide_loading();
                      show_notification('Please complete all fields', 'danger');
                      return;
                    }

                    this.show_modal = false;

                    //Read JSON and add the new architecture on CREATOR
                    var file;
                    var reader;
                    var files = document.getElementById('arch_file').files;

                    //Read one or more files
                    for (var i = 0; i < files.length; i++)
                    {
                      file = files[i];
                      reader = new FileReader();

                      reader.onloadend = (function(name_arch, description_arch){
                        return function(e){
                          //Add the new architecture on CREATOR
                          architecture_available.push({name: name_arch, img: "./images/personalized_logo.png", alt: name_arch + " logo" , id:"select_conf"+name_arch , description: description_arch , available: 1});
                          load_architectures_available.push({name: name_arch, img: "./images/personalized_logo.png", alt: name_arch + " logo" , id:"select_conf"+name_arch , description: description_arch , available: 1});
                          back_card.push({name: architecture_available[architecture_available.length-1].name , background: "default"});
                          load_architectures.push({id: name_arch, architecture: event.currentTarget.result});

                          //Refresh cache values
                          if (typeof(Storage) !== "undefined")
                          {
                            var auxArch = JSON.stringify(load_architectures, null, 2);
                            localStorage.setItem("load_architectures", auxArch);

                            auxArch = JSON.stringify(load_architectures_available, null, 2);
                            localStorage.setItem("load_architectures_available", auxArch);
                          }

                          show_notification('The selected architecture has been loaded correctly', 'success');
                          hide_loading();
                        }
                      })(this.name_arch, this.description_arch)

                      reader.readAsBinaryString(file);
                    }

                    //Clean form
                    this.name_arch = '';
                    this.description_arch = '';
                    this.load_arch = '';
                  },

                  //Form validator
                  valid(value)
                  {
                    if(parseInt(value) !== 0)
                    {
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
                },

    template:   '<b-card no-body class="overflow-hidden arch_card architectureCard" ' +
                '        v-b-modal.load_arch>' +
                '  <b-row no-gutters>' +
                '    <b-col sm="12" class="center w-100 my-2">' +
                '      <b-card-img src="./images/load_icon.png" ' +
                '                  alt="load icon"' +
                '                  class="w-75 rounded-0 architectureImg">' +
                '      </b-card-img>' +
                '    </b-col>' +
                ' ' +
                '    <b-col sm="12">' +
                '      <b-card-body title="Load Architecture"' +
                '                   title-tag="h2">' +
                '        <b-card-text class="justify">' +
                '          Allows to load the definition of an already created architecture.' +
                '        </b-card-text>' +
                '      </b-card-body>' +
                '    </b-col>' +
                '  </b-row>' +
                ' ' +
                '  <b-modal id="load_arch"' +
                '           title="Load Architecture"' + 
                '           v-model="show_modal"' +
                '           @ok="read_arch">' +
                '    <b-form>' +
                '      <b-form-input v-model="name_arch" ' +
                '                    placeholder="Enter the name of the architecture" ' +
                '                    :state="valid(name_arch)" ' +
                '                    title="Architecture Name">' +
                '      </b-form-input>' +
                '      <br>' +
                '      <b-form-textarea v-model="description_arch" ' +
                '                       placeholder="Enter a description of the architecture" ' +
                '                       rows="3" ' +
                '                       title="Architecture Description">' +
                '      </b-form-textarea>' +
                '      <br>' +
                '      <b-form-file v-model="load_arch" ' +
                '                   placeholder="Choose a file..." ' +
                '                   id="arch_file" ' +
                '                   accept=".json" ' +
                '                   :state="valid(load_arch)">' +
                '      </b-form-file>' +
                '    </b-form>' +
                '  </b-modal>' +
                ' ' +
                '</b-card>'
  }

  Vue.component('load-architecture', uielto_load_architecture) ;
