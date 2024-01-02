
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

  var uielto_preload_architecture = {

    props:      {
                  arch_available: { type: Array,   required: true },
                  back_card:      { type: Array,   required: true },
                  item:           { type: Object,  required: true },
                  index:          { type: Number,  required: true }
                },

    data:       function () {
                  return {
                    architecture_name: '',
                    example_loaded: ''
                  }
                },

    methods:    {
                  //Load the available architectures
                  load_arch_available()
                  {
                    //Read architectures availables JSON
                    $.getJSON('architecture/available_arch.json' + "?v=" + new Date().getTime(), function(cfg){
                      architecture_available = cfg;
                      if (typeof(Storage) !== "undefined")
                      {
                        if(localStorage.getItem("load_architectures_available") != null)
                        {
                          var aux_arch = localStorage.getItem("load_architectures_available");
                          var aux = JSON.parse(aux_arch);
                          for (var i = 0; i < aux.length; i++)
                          {
                            architecture_available.push(aux[i]);
                            load_architectures_available.push(aux[i]);

                            var aux_arch_2 = localStorage.getItem("load_architectures");
                            var aux2 = JSON.parse(aux_arch_2);
                            load_architectures.push(aux2[i]);
                          }
                        }
                      }

                      //Load JSON data
                      app._data.arch_available = architecture_available;

                      //Refresh UI
                      for (var i = 0; i < architecture_available.length; i++){
                        back_card.push({name: architecture_available[i].name , background: "default"});
                      }

                      uielto_preload_architecture.methods.load_default_architecture(architecture_available);
                    });
                  },

                  //Load default architecture in CREATOR
                  load_default_architecture(architecture_available){
                    if (typeof(Storage) !== "undefined"){
                      var e = null;

                      if(localStorage.getItem("conf_default_architecture") != null && localStorage.getItem("conf_default_architecture") != "none" ){
                        var default_architecture = localStorage.getItem("conf_default_architecture");

                        for (var i = 0; i < architecture_available.length; i++)
                        {
                          if (architecture_available[i].name == default_architecture) {
                            e = architecture_available[i];
                          }
                        }

                        //Synchronous JSON read
                        $.ajaxSetup({
                            async: false
                        });

                        //Read architecture JSON
                        $.getJSON('architecture/'+e.file+'.json' + "?v=" + new Date().getTime(), function(cfg){
                          uielto_preload_architecture.methods.load_arch_select_aux(cfg, true, e);

                          //Refresh UI
                          hide_loading();
                          show_notification(e.name + ' architecture has been loaded correctly', 'success');

                          // Google Analytics
                          creator_ga('architecture', 'architecture.loading', 'architectures.loading.preload_cache');

                          }).fail(function() {
                            hide_loading();
                            show_notification(e.name + ' architecture is not currently available', 'info');
                          });
                      }
                    }
                  },

                  //Load selected architecture on CREATOR
                  load_arch_select(e)
                  {
                    show_loading();

                    if (e == null) 
                    {
                      hide_loading();
                      show_notification('The architecture is not currently available', 'info');
                      return;
                    }

                    //Read architecture JSON
                    for (i = 0; i < load_architectures.length; i++)
                    {
                      if (e.name == load_architectures[i].id)
                      {
                        var aux_architecture = JSON.parse(load_architectures[i].architecture);
                        uielto_preload_architecture.methods.load_arch_select_aux(aux_architecture, true, e);

                        //Refresh UI
                        hide_loading();
                        show_notification(e.name + ' architecture has been loaded correctly', 'success');

                        // Google Analytics
                        creator_ga('architecture', 'architecture.loading', 'architectures.loading.preload_' + e.name);

                        return;
                      }
                    }

                    //Synchronous JSON read
                    $.ajaxSetup({
                        async: false
                    });

                    //Read architecture JSON
                    $.getJSON('architecture/'+e.file+'.json' + "?v=" + new Date().getTime(), function(cfg){
                      uielto_preload_architecture.methods.load_arch_select_aux(cfg, true, e);

                      //Refresh UI
                      hide_loading();
                      show_notification(e.name + ' architecture has been loaded correctly', 'success');

                      // Google Analytics
                      creator_ga('architecture', 'architecture.loading', 'architectures.loading.preload_cache');

                      }).fail(function() {
                        hide_loading();
                        show_notification(e.name + ' architecture is not currently available', 'info');
                      });
                  },

                  //Load architecture in CREATOR
                  load_arch_select_aux(cfg, load_associated_examples, e)
                  {
                    //Load architecture
                    var aux_architecture = cfg;
                    architecture = register_value_deserialize(aux_architecture);
                    architecture_json = e.file;
                    uielto_preload_architecture.data.architecture_name = architecture.arch_conf[0].value;
                    app._data.architecture = architecture; 
                    app._data.architecture_name = architecture.arch_conf[0].value;
                    app._data.architecture_guide = e.guide;

                    //Generate architecture hash table
                    architecture_hash = [];
                    for (i = 0; i < architecture.components.length; i++)
                    {
                      architecture_hash.push({name: architecture.components[i].name, index: i});
                      app._data.architecture_hash = architecture_hash; 
                    }

                    //Define stack limits
                    backup_stack_address = architecture.memory_layout[4].value;
                    backup_data_address  = architecture.memory_layout[3].value;

                    //Load examples
                    if (load_associated_examples && typeof e.examples !== "undefined"){
                      uielto_preload_architecture.methods.load_examples_available();
                    }

                    //Reset execution
                    instructions = [];
                    app._data.instructions = instructions;
                    creator_memory_clear() ;

                    //Refresh UI
                    uielto_toolbar_btngroup.methods.change_UI_mode('simulator');
                    uielto_data_view_selector.methods.change_data_view('int_registers');
                    app._data.render++; //Forces vue to reload a component, similar to $forceUpdate()

                    //Save current architecture into cache
                    var aux_object = jQuery.extend(true, {}, architecture);
                    var aux_architecture = register_value_serialize(aux_object);
                    var aux_arch = JSON.stringify(aux_architecture, null, 2);
                  },

                  //Load the available examples
                  load_examples_available( set_name )
                  {
                    example_set_available = [];
                    example_available = [];

                    uielto_preload_architecture.data.example_loaded = new Promise(function(resolve, reject){
                      //Synchronous json read
                      $.ajaxSetup({
                          async: false
                      });

                      //Read examples JSON
                      $.getJSON('examples/example_set.json' + "?v=" + new Date().getTime(), function(set) {
                        //Current architecture in upperCase
                        if (typeof uielto_preload_architecture.data.architecture_name === 'undefined'){
                          var current_architecture = architecture.arch_conf[0].value.toUpperCase();
                        }
                        else{
                          var current_architecture = uielto_preload_architecture.data.architecture_name.toUpperCase();
                        }

                        //Search for architecture name in the example set 'set'
                        for (var i=0; i<set.length; i++)
                        {
                          //If current_architecture active but not the associated with set, skip
                          if  ( (current_architecture != '') && (set[i].architecture.toUpperCase() != current_architecture))
                          {
                            continue ;
                          }

                          //Default example set
                          if (typeof set_name !== 'undefined' && set_name == set[i].id) {
                            uielto_examples.methods.change_example_set ( example_set_available.length ) ;
                          }

                          example_set_available.push({text: set[i].id, value: example_set_available.length}) ;
                          
                          //Synchronous json read
                          $.ajaxSetup({
                              async: false
                          }); 

                          //If no current_architecture loaded then load the associated
                          if (current_architecture == '')
                          {
                            $.getJSON('architecture/'+ set[i].architecture +'.json', function(cfg) {
                              uielto_preload_architecture.methods.load_arch_select_aux(cfg, false, null);
                            }) ;
                          }

                          //Load the associate example list
                          $.getJSON(set[i].url, function(cfg){
                            example_available[example_available.length] = cfg;
                            resolve('Example list loaded.') ;
                          });
                        }

                        app._data.example_set_available = example_set_available;
                        app._data.example_available = example_available ; 

                        if (example_set_available.length === 0)
                        {
                          reject('Unavailable example list.') ;
                        }
                      });
                    }) ;
                  },

                  //Change the background of selected achitecture card
                  change_background(name, type)
                  {
                    if(type === 1)
                    {
                      for (var i = 0; i < this._props.back_card.length; i++)
                      {
                        if(name == this._props.back_card[i].name){
                          this._props.back_card[i].background = "secondary";
                        }
                        else{
                          this._props.back_card[i].background = "default";
                        }
                      }
                    }
                    if(type === 0)
                    {
                      for (var i = 0; i < back_card.length; i++){
                        this._props.back_card[i].background = "default";
                      }
                    }
                  },

                  //Show remove architecture modal
                  modal_remove_cache_arch(index, elem, button)
                  {
                    app._data.modal_delete_arch_index = index;

                    this.$root.$emit('bv::show::modal', 'modalDeletArch', button);
                  },

                  //Check if it is a new architecture
                  default_arch(item)
                  {
                    for (var i = 0; i < load_architectures_available.length; i++)
                    {
                      if(load_architectures_available[i].name == item){
                        return true;
                      }
                    }
                    return false;
                  }
                },

    template:   
                '<b-card no-body class="overflow-hidden arch_card architectureCard" ' +
                '                @mouseover="change_background(item.name, 1)"' +
                '                @mouseout="change_background(item.name, 0)" ' +
                '                :border-variant=back_card[index].background' +
                '                v-if="item.available == 1">' +
                '  <b-row no-gutters>' +
                '    <b-col sm="12" @click="load_arch_select(item)" class="w-100">' +
                '      <b-card-img class="rounded-0"' +
                '                  :src=item.img' +
                '                  :alt=item.alt' +
                '                  thumbnail' + 
                '                  fluid>' +
                '      </b-card-img>' +
                '    </b-col>' +
                ' ' + 
                '    <b-col sm="12" @click="load_arch_select(item)"' +
                '                   v-if="default_arch(item.name) == false">' +
                '      <b-card-body :title=item.name' +
                '                   title-tag="h2">' +
                '        <b-card-text class="justify">' +
                '          {{item.description}}' +
                '        </b-card-text>' +
                '      </b-card-body>' +
                '    </b-col>' +
                ' ' +
                '    <b-col sm="12" @click="load_arch_select(item)"' +
                '                   v-if="default_arch(item.name) == true">' +
                '      <b-card-body :title=item.name' +
                '                   title-tag="h2">' +
                '        <b-card-text class="justify">' +
                '          {{item.description}}' +
                '        </b-card-text>' +
                '      </b-card-body>' +
                '    </b-col>' +
                ' ' +
                '    <b-col sm="12" class="center" v-if="default_arch(item.name) == true">' +
                '      <b-button class="m-2 w-75 btn btn-outline-danger btn-sm buttonBackground arch_delete" ' +
                '                @click.stop="modal_remove_cache_arch(index, item.name, $event.target)"' +
                '                v-if="default_arch(item.name) == true" ' +
                '                :id="\'delete_\'+item.name">' +
                '        <span class="far fa-trash-alt"></span>' +
                '        Delete' +
                '      </b-button>' +
                '    </b-col>' +
                '  </b-row>' +
                '</b-card>'
  }

  Vue.component('preload-architecture', uielto_preload_architecture) ;