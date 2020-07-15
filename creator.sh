#!/usr/bin/env node

   //
   // Import
   //

   // filesystem
   var fs = require('fs') ;

   // creator
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

   // arguments
   var creator_version = '2.0b1' ;
   var welcome = function () { return '\n' +
                                      'CREATOR\n'.help +
                                      '-------\n'.help +
                                      'version: '.help + creator_version.help + '\n'.help +
                                      'website: https://creatorsim.github.io/\n'.help; } ;

   var argv = require('yargs')
              .usage(welcome() + '\n' +
                     'Usage: $0 -a <file name> -s <file name>')
              .example([['$0 -a architecture/MIPS-32-like.json -s examples/MIPS/example5.txt',
                         'To compile and execute example5.txt'],
                        ['$0 -a architecture/MIPS-32-like.json -s examples/MIPS/example5.txt --maxins 10',
                         'To compile and execute example5.txt, executing 10 instruction at max.']])
              .option('architecture', {
                  alias:    'a',
                  type:     'string',
                  describe: 'Architecture file',
                  nargs:    1,
                  default:  ''
               })
              .option('assembly', {
                  alias:    's',
                  type:     'string',
                  describe: 'Assembly file',
                  nargs:    1,
                  default:  ''
               })
              .option('maxins', {
                  type:     'string',
                  describe: 'Maximum number of instructions to be executed',
                  nargs:    1,
                  default:  '1000000'
               })
              .option('quiet', {
                  type:     'boolean',
                  describe: 'Minimum output',
                  default:  false
               })
              .demandOption(['architecture', 'assembly'], 'Please provide both architecture and assembly files.')
              .help('h')
              .alias('h', 'help')
              .argv ;


   //
   // Main
   //

   var show_success = function ( msg ) { if (false == quiet) console.log(msg.success) ; }
   var show_error   = function ( msg ) { if (false == quiet) console.log(msg.error) ; }

   var limit_n_instructions = parseInt(argv.maxins) ;
   var quiet = argv.quiet ;

   var architec_name = argv.architecture ;
   var architecture  = null ;
   var assembly_name = argv.assembly ;
   var assembly = null ;
   var result = null ;

   if ( (argv.a == "") || (argv.s == "") ) {
         console.log(welcome() + '\n' + 'Usage: ./creator.sh -a <file name> -s <file name>\n')
         return false ;
   }

   try
   {
       show_success(welcome()) ;

       // (a) load architecture
       architecture = fs.readFileSync(architec_name, 'utf8') ;
       result = creator.load_architecture(architecture) ;
       if (result.status !== "ok")
       {
           show_error("[Loader] " + result + "\n") ;
           return -1 ;
       }
       else show_success("[Loader] Architecture '" + argv.a + "' loaded successfully.") ;

       // (b) compile
       assembly = fs.readFileSync(assembly_name, 'utf8') ;
       result = creator.assembly_compile(assembly) ;
       if (result.status !== "ok")
       {
           show_error("[Compiler] Error at token " + result.tokenIndex + " (" + result.token + ").\n" +
                      "[Compiler] " + result.msg + "\n") ;
           return -1 ;
       }
       else show_success("[Compiler] Code '" + argv.s + "' compiled successfully.") ;

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
       if (false == quiet)
            console.log("[Final state] ".success + result.msg + "\n") ;
       else console.log(result.msg + "\n") ;
   }
   catch (e)
   {
       console.log(e.stack) ;
       return false ;
   }

