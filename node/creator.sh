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

   if (typeof bigInt === "undefined") {
        bigInt = BigInt ;
   }

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

   var result = null ;

   try
   {
       // (1) load data
       var architecture = fs.readFileSync(process.argv[2], 'utf8') ;
       var assembly     = fs.readFileSync(process.argv[3], 'utf8') ;

       // (2) load architecture
       result  = creator.load_architecture(architecture) ;
       if (result.status !== "ok") 
       {
           show_error("[Loader] " + result + "\n") ;
           return -1 ;
       }
       else show_success("[Loader] Files loaded successfully.") ;

       // (3) compile
       result = creator.assembly_compile(assembly) ;
       if (result.status !== "ok") 
       {
           show_error("[Compiler] Error at token " + result.tokenIndex + " (" + result.token + ").\n" +
                      "[Compiler] " + result.msg + "\n") ;
           return -1 ;
       }
       else show_success("[Compiler] Code compiled successfully.") ;

       // (4) ejecutar
       result = creator.execute_program() ;
       if (result.status !== "ok") 
       {
           show_error("[Executor] Error found.\n" +
                      "[Executor] " + result.msg + "\n") ;
           return -1 ;
       }
       else show_success("[Executor] Executed successfully.") ;

       // (5) print finalmachine state
       result = creator.print_state() ;
       console.log("[Final state] " + result.msg + "\n") ;
   }
   catch (e)
   {
       console.log(e.error) ;
       return false ;
   }

