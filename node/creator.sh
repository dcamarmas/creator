#!/usr/bin/env node

   var fs      = require('fs') ;
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
 
   try 
   {
       var architecture = fs.readFileSync(process.argv[2], 'utf8') ;
       var result       = creator.load_architecture(architecture) ;
       console.log(result) ;

       var assembly     = fs.readFileSync(process.argv[3], 'utf8') ;
       var result       = creator.assembly_compile(assembly) ;       
       console.log(result) ;
   }
   catch (e)
   {
       console.log(e);
       return false ;
   }

