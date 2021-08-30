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

  var uielto_directives_delete = {

        props:      {
                      id:                             { type: String, required: true },
                      modalDeletDir:                  { type: Object, required: true }
                    }, 

        data:       function () {
                      return {
                        
                      }
                    },

        methods:    {
                      delete_directive(comp){
                        for (var i = 0; i < architecture.directives.length; i++) {
                          if(comp == architecture.directives[i].name){
                            architecture.directives.splice(i,1);
                          }
                        }
                      }
                    },

        template:   '<b-modal :id ="id" ' +
                    '         :title="modalDeletDir.title" ' +
                    '         ok-variant="danger" ' +
                    '         ok-title="Delete" ' +
                    '         @ok="delete_directive(modalDeletDir.element)">' +
                    '  <span class="h6">Are you sure you want to delete the item?</span>' +
                    '</b-modal>'

  }

  Vue.component('directives-delete', uielto_directives_delete) ;