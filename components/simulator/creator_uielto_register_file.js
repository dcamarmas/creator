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

  var uielto_register_file = {

  props:      {
                data_mode:               { type: String, required: true },
                register_type:           { type: String, required: true }
              },

  data:       function () {
                return {
                  //Register value representation
                  reg_representation: "hex",
                  reg_representation_options: [
                    { text: 'Signed', value: 'signed' },
                    { text: 'Unsigned', value: 'unsigned' },
                    { text: 'IEEE 754', value: 'decimal'},
                    { text: 'Hexadecimal', value: 'hex' }
                  ],

                  //Register name representation
                  reg_name_representation: "all",
                  reg_name_representation_options: [
                    { text: 'Name', value: 'logical' },
                    { text: 'Alias', value: 'alias' },
                    { text: 'All', value: 'all'}
                  ]
                }
              },


  methods:    {
              
              },

  template:   ' <div class="col-lg-12 col-sm-12 px-0" id="register_file" v-if="data_mode == \'registers\'">' +
              '   <b-container>' +
              '     <b-row>' +
              '       <b-col cols="auto">' +
              '         <b-form-group label="Register value representation:" v-slot="{ ariaDescribedby }">' +
              '           <b-form-radio-group' +
              '             id="btn-radios-1"' +
              '             class="w-100"' +
              '             v-model="reg_representation"' +
              '             :options="reg_representation_options"' +
              '             button-variant="outline-secondary"' +
              '             size="sm"' +
              '             :aria-describedby="ariaDescribedby"' +
              '             name="radios-btn-default"' +
              '             buttons' +
              '           ></b-form-radio-group>' +
              '         </b-form-group>' +
              '       </b-col>' +
              ' ' +
              '       <b-col cols="auto" align-h="end">' +
              '         <b-form-group label="Register name representation:" v-slot="{ ariaDescribedby }">' +
              '           <b-form-radio-group' +
              '             id="btn-radios-2"' +
              '             class="w-100"' +
              '             v-model="reg_name_representation"' +
              '             :options="reg_name_representation_options"' +
              '             button-variant="outline-secondary"' +
              '             size="sm"' +
              '             :aria-describedby="ariaDescribedby"' +
              '             name="radios-btn-default"' +
              '             buttons' +
              '           ></b-form-radio-group>' +
              '         </b-form-group>' +
              '       </b-col>' +
              '     </b-row>' +
              '   </b-container>' +
              '   ' +
              ' ' +
              '   <div class="col-lg-12 col-sm-12" v-for="item in architecture_hash">' +
              '     <div class="col-lg-12 col-sm-12 buttons row mb-2" ' +
              '           v-if="(register_type == architecture.components[item.index].type) || (register_type == \'integer\' && architecture.components[item.index].type == \'control\')">' +
              '       ' +
              '       <div class="col-lg-3 col-sm-4 buttons" ' +
              '            v-for="item2 in architecture.components[item.index].elements">' +
              ' ' +
              '         <register :component="item"' +
              '                   :register="item2"' +
              '                   :name_representation="reg_name_representation"' +
              '                   :value_representation="reg_representation">' +
              '         </register>' +
              ' ' +
              '       </div>' +
              ' ' +
              '     </div>' +
              '   </div>' +
              ' </div>'

  }

  Vue.component('register-file', uielto_register_file) ;