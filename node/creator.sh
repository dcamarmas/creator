#!/usr/bin/env node

   var fs      = require('fs') ;
   //var bigInt = require("big-integer");
   var creator = require('./min.creator_node.js') ;


   //
   // (1) Usage
   //

   if (process.argv.length < 4)
   {
       console.log("") ;
       console.log("Usage: creator.sh <architecture> <assembly file>") ;
       console.log("") ;

       return 0 ;
   }


   //
   // (2) Get arguments
   //
 
   var result = null ;

   try 
   {
       // (1) load data
       var architecture = fs.readFileSync(process.argv[2], 'utf8') ;
       var assembly     = fs.readFileSync(process.argv[3], 'utf8') ;

       // (2) load architecture
       result  = creator.load_architecture(architecture) ;
       if (result.xxx == false) {
           console.log(result) ;
           return ;
       }  

       // (3) compile
       result = creator.assembly_compile(assembly) ;     
       if (result.status !== "ok") {
           console.log("[ERROR 1]: " + result) ;
           return ;
       }  

       // (4) ejecutar
       result = creator.execute_program() ;     
       if (result.status !== "ok") {
           console.log("[ERROR 2]: " + result.msg) ;
           return ;
       }  

       // (5) print finalmachine state
       result = creator.print_state();
       console.log(result.msg) ;
   }
   catch (e)
   {
       console.log(e);
       return false ;
   }

