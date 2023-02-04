
/*
 *  Copyright 2015-2021 Felix Garcia Carballeira, Alejandro Calderon Mateos, Diego Camarmas Alonso, Lucas Elvira Martín, Javier Prieto Cepeda, Saul Alonso Monsalve
 *
 *  This file is part of Creator.
 *
 *  Creator is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  Creator is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with Creator.  If not, see <http://www.gnu.org/licenses/>.
 *
 */


    //
    // Auxiliar functions
    //

    function preload_load_example ( data , url )
    {
      if (url == null)
      {
        show_notification('The example doesn\'t exist', 'info') ;
        return;
      }

      code_assembly = data ;
      uielto_toolbar_btngroup.methods.assembly_compiler(code_assembly);

      // show notification
      show_notification(' The selected example has been loaded.', 'success') ;

      // Google Analytics
      creator_ga('example', 'example.loading', 'example.loading.' + url);
    }

    function preload_find_example ( example_set_available, hash )
    {
      for (var i=0; i<example_set_available.length; i++)
      {
        for (var j = 0; (j < example_available[i].length) &&
                        (example_set_available[i].text == hash.example_set); j++)
        {
          if (example_available[i][j].id === hash.example) 
          {
            return example_available[i][j].url;
          }
        }
      }

      return null ;
    }

    function preload_find_architecture ( arch_availables, arch_name )
    {
      for (var i=0; i<arch_availables.length; i++)
      {
        if (arch_availables[i].alias.includes(arch_name))
        {
          return arch_availables[i] ;
        }
      }

      return null ;
    }

    function preload_example_uri ( asm_decoded )
    {
      if (asm_decoded == null)
      {
        show_notification('Assembly not valid', 'info') ;
        return;
      }

      code_assembly = asm_decoded ;
      uielto_toolbar_btngroup.methods.assembly_compiler(code_assembly);

      // show notification
      show_notification('The assembly code has been loaded.', 'success') ;

      // Google Analytics
      creator_ga('example', 'example.loading', 'example.uri');
    }


    //
    // Preload tasks
    //

    var creator_preload_tasks = [

     // parameter: architecture
     {
        'name':   'architecture',
        'action': function( app, hash )
      {
        var arch_name = hash.architecture.trim() ;
        if (arch_name === "") 
        {
          return new Promise(function(resolve, reject) {
            resolve('Empty architecture.') ;
          }) ;
        }

        return $.getJSON( 'architecture/available_arch.json',
                          function (arch_availables) {
                            var a_i = preload_find_architecture(arch_availables, arch_name) ;
                            uielto_preload_architecture.methods.load_arch_select(a_i) ;
                            return 'Architecture loaded.' ;
                          }
                        ) ;
      }
     },

     // parameter: example_set
     {
        'name':   'example_set',
        'action': function( app, hash )
      {
        var exa_set = hash.example_set.trim() ;
        if (exa_set === "") 
        {
          return new Promise(function(resolve, reject) {
            resolve('Empty example set.') ;
          }) ;
        }

        uielto_preload_architecture.methods.load_examples_available(hash.example_set) ;
        return uielto_preload_architecture.data.example_loaded ;
      }
     },

     // parameter: example
     {
        'name':   'example',
        'action': function( app, hash )
      {
        return new Promise(function(resolve, reject) {
          var url = preload_find_example(example_set_available, hash) ;
          if (null == url) {
            reject('Example not found.') ;
          }

          $.get(url,function(data) {
            preload_load_example(data, url) ;
          }) ;

          resolve('Example loaded.') ;
        }) ;
      }
     },

     // parameter: asm
     {
        'name':   'asm',
        'action': function( app, hash )
      {
        return new Promise(function(resolve, reject) {

          var assembly = hash.asm.trim() ;
          if (assembly === "") 
          {
            return new Promise(function(resolve, reject) {
              resolve('Empty assembly.') ;
            }) ;
          }

          var asm_decoded = decodeURI(assembly) ;
          preload_example_uri ( asm_decoded )

          resolve('Assembly loaded.') ;
        }) ;
      }
     }

     ] ;


    //
    // Preload work
    //

    function creator_preload_get2hash ( window_location )
    {
      var hash       = {} ;
      var hash_field = '' ;
      var uri_obj    = null ;

      // 1.- check params
      if (typeof window_location === "undefined") {
         return hash ;
      }

      // 2.- get parameters
      var parameters = new URL(window_location).searchParams ;
      for (i=0; i<creator_preload_tasks.length; i++)
      {
        hash_field = creator_preload_tasks[i].name ;
        hash[hash_field] = parameters.get(hash_field) ;

        // overwrite null with default values
        if (hash[hash_field] === null) {
          hash[hash_field] = '' ;
        }
      }

      return hash ;
    }

    async function creator_preload_fromHash ( app, hash )
    {
      var key = '' ;
      var act = function() {} ;

      // preload tasks in order
      var o = '' ;
      for (var i=0; i<creator_preload_tasks.length; i++)
      {
        key = creator_preload_tasks[i].name ;
        act = creator_preload_tasks[i].action ;

        if (hash[key] !== '')
        {
          try {
            var v = await act(app, hash) ;
            o = o + v + '<br>' ;
          }
          catch(e) {
            o = o + e + '<br>' ;
          }
        }
      }

      // return ok
      return o ;
    }

