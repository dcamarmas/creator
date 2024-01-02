
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

  var uielto_register_file_edit = {

    props:      {
                  id:                             { type: String, required: true },
                  title:                          { type: String, required: true },
                  name:                           { type: String, required: true },
                  index:                          { type: Number, required: true }
                  
                },

    data:       function () {
                  return {
                    //Modal register file
                    show_modal: false,
                  }
                },

    methods:    {
                  //Verify all field of modified register file
                  verify_edit_register_file(evt)
                  {
                    evt.preventDefault();

                    if (!this._props.name) {
                      show_notification('Please complete all fields', 'danger') ;
                    }
                    else {
                      for (var i = 0; i < architecture_hash.length; i++)
                      {
                        if ((this._props.name == architecture_hash[i].name) && (this._props.index != i))
                        {
                            show_notification('The component already exists', 'danger') ;
                            return;
                        }
                      }
                      
                      this.edit_register_file();
                    }
                  },

                  //Edit the register file
                  edit_register_file(){ 
                    this.show_modal = false;

                    architecture_hash[this._props.index].name       = this._props.name;
                    architecture.components[this._props.index].name = this._props.name;

                    show_notification('Register file correctly modified', 'success') ;
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

    template:   '<b-modal :id ="id" ' +
                '         :title = "title" ' +
                '         ok-title="Save" ' +
                '         @ok="verify_edit_register_file($event)" ' +
                '         v-model="show_modal">' +
                '  <b-form>' +
                '    <b-form-group label="Name:">' +
                '      <b-form-input type="text" ' +
                '                    :state="valid(name)" ' +
                '                    v-model="name" ' +
                '                    required ' +
                '                    placeholder="Enter name" ' +
                '                    size="sm" ' +
                '                    title="Name">' +
                '      </b-form-input>' +
                '    </b-form-group>' +
                '  </b-form>' +
                '</b-modal >'

  }

  Vue.component('register-file-edit', uielto_register_file_edit) ;