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

  var uielto_instructions_delete = {

        props:      {
                      id:                             { type: String, required: true },
                      instruction:                    { type: Number, required: true }
                    }, 

        data:       function () {
                      return {
                        
                      }
                    },

        methods:    {
                      //Delete the instruction
                      delete_instructions(index){
                        architecture.instructions.splice(index,1);
                      },
                    },

        template:   '<b-modal :id ="id" ' +
                    '         title="Delete Instruction" ' +
                    '         ok-variant="danger" ' +
                    '         ok-title="Delete" ' +
                    '         @ok="delete_instructions(instruction)">' +
                    '  <span class="h6">Are you sure you want to delete the item?</span>' +
                    '</b-modal >'

  }

  Vue.component('instructions-delete', uielto_instructions_delete) ;