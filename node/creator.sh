#!/usr/bin/env node

   var fs      = require('fs') ;
 //var bigInt = require("big-integer");
   var creator = require('./min.creator_node.js') ;


   //
   // (1) Welcome
   //

   console.log("") ;
   console.log("  CREATOR") ;
   console.log(" ---------") ;
   console.log("") ;
   console.log("  version: 1.5.2") ;
   console.log("  website: https://creatorsim.github.io/") ;
   console.log("") ;


   //
   // (2.A) Show usage
   //

   if (process.argv.length < 4)
   {
       console.log("  Usage: ./creator.sh <architecture> <assembly file>") ;
       console.log("") ;

       return 0 ;
   }


   //
   // (2.B) Get work done
   //

   var result = null ;

   try
   {
       // (1) load data
       var architecture = fs.readFileSync(process.argv[2], 'utf8') ;
       var assembly     = fs.readFileSync(process.argv[3], 'utf8') ;

       // (2) load architecture
       result  = creator.load_architecture(architecture) ;
       if (result.status !== "ok") {
           console.log("[Loader] " + result) ;
           console.log("") ;
           return ;
       }
       console.log("[Loader] Files loaded successfully.") ;

       // (3) compile
       result = creator.assembly_compile(assembly) ;
       if (result.status !== "ok") {
           console.log("[Compiler] Error at token " + result.tokenIndex + " (" + result.token + ").") ;
           console.log("[Compiler] " + result.msg) ;
           console.log("") ;
           return ;
       }
       console.log("[Compiler] Code compiled successfully.") ;

       // (4) ejecutar
       result = creator.execute_program() ;
       if (result.status !== "ok") {
           console.log("[Executor] Error found.") ;
           console.log("[Executor] " + result.msg) ;
           console.log("") ;
           return ;
       }
       console.log("[Executor] Executed successfully.") ;

       // (5) print finalmachine state
       result = creator.print_state();
       console.log("[Final state] " + result.msg) ;
       console.log("") ;
   }
   catch (e)
   {
       console.log(e);
       return false ;
   }

