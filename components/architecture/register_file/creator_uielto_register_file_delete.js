/*
 *  Copyright 2018-2022 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos
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

  var uielto_register_file_delete = {

        props:      {
                      id:                             { type: String, required: true },
                      title:                          { type: String, required: true },
                      element:                        { type: String, required: true }
                    }, 

        data:       function () {
                      return {
                        
                      }
                    },

        methods:    {
                      delete_register_file(comp){
                        for (var i = 0; i < architecture_hash.length; i++){
                          if(comp == architecture_hash[i].name){
                            architecture.components.splice(i,1);
                            architecture_hash.splice(i,1);
                            for (var j = 0; j < architecture_hash.length; j++){
                              architecture_hash[j].index = j;
                            }
                          }
                        }
                      }
                    },

        template:   '<b-modal :id ="id" ' +
                    '         :title="title" ' +
                    '         ok-variant="danger" ' +
                    '         ok-title="Delete" ' +
                    '         @ok="delete_register_file(element)">' +
                    '  <span class="h6">Are you sure you want to delete the register file?</span>' +
                    '</b-modal>'

  }

  Vue.component('register-file-delete', uielto_register_file_delete) ;