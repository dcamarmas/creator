
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

  var uielto_arch_conf_reset = {

    props:      {
                  id:                             { type: String, required: true },
                  title:                          { type: String, required: true },
                  arch_field_index:               { type: Number, required: true },
                  arch_field_value:               { type: String, required: true },
                  architecture_name:              { type: String, required: true },
                }, 

    data:       function () {
                  return {
                    
                  }
                },

    methods:    {
                  //Reset the architecture field
                  reset_arch_field(index)
                  {
                    show_loading();

                    //Read original value from JSON
                    for (var i = 0; i < load_architectures.length; i++)
                    {
                      if(architecture_json == load_architectures[i].file)
                      {
                        var aux_arch = JSON.parse(load_architectures[i].architecture);
                        var aux_architecture = register_value_deserialize(aux_arch);

                        architecture.arch_conf[index].value = aux_architecture.arch_conf[index].value;
                        app._data.architecture = architecture;

                        hide_loading();
                        show_notification('The architecture field has been reset correctly', 'success') ;
                        return;
                      }
                    }

                    $.getJSON('architecture/'+architecture_json+'.json', function(cfg){
                      var aux_architecture = cfg;

                      var aux_architecture_2 = register_value_deserialize(aux_architecture);
                      architecture.arch_conf[index].value = aux_architecture_2.arch_conf[index].value;

                      app._data.architecture = architecture;

                      hide_loading();
                      show_notification('The architecture field has been reset correctly', 'success') ;
                    });
                  },
                },

    template:   '<b-modal :id ="id" ' +
                '         :title="title" ' +
                '         ok-variant="danger" ' +
                '         ok-title="Delete" ' +
                '         @ok="reset_arch_field(arch_field_index)">' +
                '  <span class="h6">Are you sure you want to reset the item?</span>' +
                '</b-modal >'

  }

  Vue.component('arch-conf-reset', uielto_arch_conf_reset) ;