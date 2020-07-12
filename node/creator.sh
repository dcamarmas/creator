#!/usr/bin/env node

   var fs      = require('fs') ;
   var colors  = require('colors') ;
   var creator = require('./min.creator_node.js') ;


   //
   // Auxiliar functions
   //

   colors.setTheme({
                     info:    'bgGreen',
                     help:    'green',
                     warn:    'yellow',
                     success: 'cyan',
                     error:   'bgRed'
                   }) ;

   function show_success ( msg ) {
       console.log(msg.success) ;
   }

   function show_error ( msg ) {
       console.log(msg.error) ;
   }

   function show_welcome ( ) 
   {
       console.log("") ;
       console.log("  CREATOR") ;
       console.log(" ---------") ;
       console.log("") ;
       console.log("  version: 1.5.2") ;
       console.log("  website: https://creatorsim.github.io/") ;
       console.log("") ;
   }

   function show_usage ( ) 
   {
       console.log("  Usage: ./creator.sh <architecture> <assembly file>".help) ;
       console.log("") ;
   }


   //
   // Main
   //

   // (1) Welcome

   show_welcome() ; 
   if (process.argv.length < 4)
   {
       show_usage() ; 
       return 0 ;
   }

   // (2) Get work done

   var architec_name = process.argv[2] ;
   var architecture = null ;
   var assembly_name = process.argv[3] ;
   var assembly = null ;
   var result = null ;

   var options = [] ;
   var options_string = process.argv[4] ;
   if (typeof options_string != "undefined") {
       options = options_string.split(",") ;
   }

   var option = '' ;
   var limit_n_instructions = 10000000 ;
   for (var i=0; i<options.length; i++) 
   {
        option = options[i].split("=") ;
        if (option.length != 2) {
            continue ;
        }
        if (option[0].toUpperCase() == "MAXINS") {
            limit_n_instructions = parseInt(option[1]) ;
        }
   }

   try
   {
       // (a) load architecture
       architecture = fs.readFileSync(architec_name, 'utf8') ;
       result = creator.load_architecture(architecture) ;
       if (result.status !== "ok") 
       {
           show_error("[Loader] " + result + "\n") ;
           return -1 ;
       }
       else show_success("[Loader] Architecture loaded successfully.") ;

       // (b) compile
       assembly = fs.readFileSync(assembly_name, 'utf8') ;
       result = creator.assembly_compile(assembly) ;
       if (result.status !== "ok") 
       {
           show_error("[Compiler] Error at token " + result.tokenIndex + " (" + result.token + ").\n" +
                      "[Compiler] " + result.msg + "\n") ;
           return -1 ;
       }
       else show_success("[Compiler] Code compiled successfully.") ;

       // (c) ejecutar
       result = creator.execute_program(limit_n_instructions) ;
       if (result.status !== "ok") 
       {
           show_error("[Executor] Error found.\n" +
                      "[Executor] " + result.msg + "\n") ;
           return -1 ;
       }
       else show_success("[Executor] Executed successfully.") ;

       // (d) print finalmachine state
       result = creator.print_state() ;
       console.log("[Final state] " + result.msg + "\n") ;
   }
   catch (e)
   {
       console.log(e.error) ;
       return false ;
   }

