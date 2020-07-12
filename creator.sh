#!/usr/bin/env node

   //
   // Import
   //

   // filesystem
   var fs = require('fs') ;

   // filesystem
   var creator = require('./js/min.creator_node.js') ;

   // color
   var colors = require('colors') ;
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

   // arguments
   console.log("\n" +
               "CREATOR\n".help +
               "-------\n".help +
               "version: 1.5.2\n".help +
               "website: https://creatorsim.github.io/\n".help) ;

   var argv = require('yargs')
              .usage('Usage: $0 --arc <file name> --asm <file name> [--maxins <limit # instructions>]')
              .example('./creator.sh --arc architecture/MIPS-32-like.json --asm examples/MIPS/example11.txt --maxins 10000')
              .describe('--arc', 'Architecture')
              .nargs('--arc', 1)
              .describe('--asm', 'Assembly file')
              .nargs('--asm', 1)
              .describe('--maxins', 'Maximum number of instructions to be executed')
              .nargs('--maxins', 1)
              .help('h')
              .alias('h', 'help')
              .demandOption(['arc', 'asm'])
              .argv ;

   var limit_n_instructions = 10000000 ;
   if (typeof argv.maxins !== "undefined") {
       limit_n_instructions = parseInt(argv.maxins) ;
   }


   //
   // Main
   //

   var architec_name = argv.arc ;
   var architecture = null ;
   var assembly_name = argv.asm ;
   var assembly = null ;
   var result = null ;

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
       else show_success("[Loader] Architecture '" + argv.arc + "' loaded successfully.") ;

       // (b) compile
       assembly = fs.readFileSync(assembly_name, 'utf8') ;
       result = creator.assembly_compile(assembly) ;
       if (result.status !== "ok") 
       {
           show_error("[Compiler] Error at token " + result.tokenIndex + " (" + result.token + ").\n" +
                      "[Compiler] " + result.msg + "\n") ;
           return -1 ;
       }
       else show_success("[Compiler] Code '" + argv.asm + "' compiled successfully.") ;

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
       console.log("[Final state] ".success + result.msg + "\n") ;
   }
   catch (e)
   {
       console.log(e.error) ;
       return false ;
   }

