#!/usr/bin/env node

   //
   // Import
   //

   // filesystem
   var fs = require('fs') ;

   // creator
   var creator = require('./js/min.creator_node.js') ;

   // color
   var color_theme = {
                       info:    'bgGreen',
                       help:    'green',
                       warn:    'yellow',
                       success: 'cyan',
                       error:   'bgRed'
                     } ;
   var gray_theme  = {
                       info:    'white',
                       help:    'gray',
                       warn:    'white',
                       success: 'white',
                       error:   'brightWhite'
                     } ;
   var colors = require('colors') ;
   colors.setTheme(gray_theme) ;

   // arguments

   var creator_version = JSON.parse(fs.readFileSync('package.json', 'utf8')).version ;
   var welcome = function () { return '\n' +
                                      'CREATOR\n'.help +
                                      '-------\n'.help +
                                      'version: '.help + creator_version.help + '\n'.help +
                                      'website: https://creatorsim.github.io/\n'.help; } ;

   var argv = require('yargs')
              .usage(welcome() + '\n' +
                     'Usage: $0 -a <file name> -s <file name>\n' +
                     'Usage: $0 -h')
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
              .option('library', {
                  alias:    'l',
                  type:     'string',
                  describe: 'Assembly library file',
                  nargs:    1,
                  default:  ''
               })
              .option('result', {
                  alias:    'r',
                  type:     'string',
                  describe: 'Result file to compare with',
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
              .option('color', {
                  type:     'boolean',
                  describe: 'Colored output',
                  default:  false
               })
              .demandOption(['architecture', 'assembly'], 'Please provide both architecture and assembly files.')
              .help('h')
              .alias('h', 'help')
              .argv ;


   //
   // Main
   //

   var show_success = function ( msg ) { if (false == argv.quiet) console.log(msg.success) ; }
   var show_error   = function ( msg ) {                          console.log(msg.error) ; }

   var limit_n_instructions = parseInt(argv.maxins) ;

   var architecture  = '' ;
   var assembly = '' ;
   var library  = '' ;
   var result   = '' ;
   var ret      = null ;

   if ( (argv.a == "") || (argv.s == "") ) {
         console.log(welcome() + '\n' + 
                     'Usage:\n' + 
                     ' * To compile and execute an assembly file on an architecture:\n' + 
                     '   ./creator.sh -a <architecture file name> -s <assembly file name>\n' + 
                     ' * To get more information:\n' + 
                     '   ./creator.sh -h\n')
         return false ;
   }

   try
   {
       if (argv.color) {
           colors.setTheme(color_theme) ;
       }
       show_success(welcome()) ;

       // (a) load architecture
       architecture = fs.readFileSync(argv.architecture, 'utf8') ;
       ret = creator.load_architecture(architecture) ;
       if (ret.status !== "ok")
       {
           show_error("[Loader] " + ret + "\n") ;
           return -1 ;
       }
       else show_success("[Loader] Architecture '" + argv.a + "' loaded successfully.") ;

       // (b) compile
       assembly = fs.readFileSync(argv.assembly, 'utf8') ;
       ret = creator.assembly_compile(assembly) ;
       if (ret.status !== "ok")
       {
           show_error("[Compiler] Error at line " + (ret.line+1) + " (" + ret.token + ").\n" +
                      "[Compiler] " + ret.msg + "\n") ;
           return -1 ;
       }
       else show_success("[Compiler] Code '" + argv.s + "' compiled successfully.") ;

       // (c) link
       if (argv.library !== '')
       {
           library = fs.readFileSync(argv.library, 'utf8') ;
           ret = creator.load_library(library) ;
           if (ret.status !== "ok")
           {
               show_error("[Linker] " + ret.msg + "\n") ;
               return -1 ;
           }
           else show_success("[Linker] Code '" + argv.l + "' linked successfully.") ;
       }

       // (d) ejecutar
       ret = creator.execute_program(limit_n_instructions) ;
       if (ret.status !== "ok")
       {
           show_error("[Executor] Error found.\n" +
                      "[Executor] " + ret.msg + "\n") ;
           return -1 ;
       }
       else show_success("[Executor] Executed successfully.") ;

       // (e) compare results
       if (argv.result !== '')
       {
           result = fs.readFileSync(argv.result, 'utf8') ;
           ret = creator.get_state() ;
           ret = creator.compare_states(result, ret.msg) ;
           if (false == argv.quiet)
                console.log("[state] ".success + ret.msg + "\n") ;
           else console.log(ret.msg) ;
           return 1 ;
       }

       // (f) print finalmachine state
       ret = creator.get_state() ;
       if (false == argv.quiet)
            console.log("[Final state] ".success + ret.msg + "\n") ;
       else console.log(ret.msg + "\n") ;
   }
   catch (e)
   {
       console.log(e.stack) ;
       return false ;
   }

