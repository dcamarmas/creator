
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

  var uielto_delete_architecture = {

    props:      {
                  id:             { type: String,  required: true },
                  index:          { type: Number,  required: true }
                },

    data:       function () {
                  return {

                  }
                },

    methods:    {
                  //Remove architecture
                  remove_cache_arch(index)
                  {
                    //Get architecture name
                    var id = architecture_available[index].name;

                    //Delete architecture on CREATOR
                    for (var i = 0; i < load_architectures.length; i++)
                    {
                      if(load_architectures[i].id == id){
                        load_architectures.splice(i, 1);
                      }
                    }

                    for (var i = 0; i < load_architectures_available.length; i++)
                    {
                      if(load_architectures_available[i].name == id){
                        load_architectures_available.splice(i, 1);
                      }
                    }

                    architecture_available.splice(index, 1);

                    // Reload cache values
                    var aux_arch = JSON.stringify(load_architectures, null, 2);
                    localStorage.setItem("load_architectures", aux_arch);

                    aux_arch = JSON.stringify(load_architectures_available, null, 2);
                    localStorage.setItem("load_architectures_available", aux_arch);

                    show_notification('Architecture deleted successfully', 'success') ;
                  }
                },

    template:   ' <b-modal :id ="id" ' +
                '          title="Delete Architecture" ' +
                '          ok-variant="danger" ' +
                '          ok-title="Delete" ' +
                '          @ok="remove_cache_arch(index)">' +
                '   <span class="h6">' +
                '     Are you sure you want to delete the architecture?' +
                '   </span>' +
                ' </b-modal >'
  }

  Vue.component('delete-architecture', uielto_delete_architecture) ;