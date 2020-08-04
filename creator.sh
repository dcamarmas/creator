#!/usr/bin/env node

   //
   // Import
   //

   // filesystem
   var fs = require('fs') ;

   // creator
   var creator = require('./js/min.creator_node.js') ;
   var creator_version = JSON.parse(fs.readFileSync('package.json', 'utf8')).version ;

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
              .option('describe', {
                  type:     'string',
                  describe: 'Help on element',
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

   // help...
   if ( (argv.a != "") && (argv.describe != "") )
   {
         var o = help_describe(argv) ;
         console.log(welcome() + '\n' + o) ;
         return process.exit(0) ;
   }

   if ( (argv.a == "") || (argv.s == "") )
   {
         var o = help_usage() ;
         console.log(welcome() + '\n' + o) ;
         return process.exit(0) ;
   }

   // commands and switches...
   try
   {
       if (argv.color) {
           colors.setTheme(color_theme) ;
       }

       // welcome
       if (false == argv.quiet) {
           var msg = welcome() ;
           console.log(msg.success) ;
       }

       // work with one file
       var limit_n_ins = parseInt(argv.maxins) ;
       var ret = one_file(argv.architecture, argv.library, argv.assembly, limit_n_ins, argv.result) ;

       // info: show possible errors
       var stages = [ 'architecture', 'library', 'compile', 'execute' ] ;
       for (var i=0; i<stages.length; i++)
       {
            var stage = stages[i] ;
            if (ret[stage].status !== "ok") {
                console.log(ret[stage].msg.error) ;
                return process.exit(-1) ;
            }

            if (false == argv.quiet) {
                console.log(ret[stage].msg.success) ;
            }
       }

       // info: "check differences" or "print finalmachine state"
       if (argv.result !== '')
       {
           if (false == argv.quiet)
                console.log("\n[State] ".success + ret.laststate.msg + "\n") ;
           else console.log(ret.laststate.msg) ;
           return process.exit(0) ;
       }

       ret = creator.get_state() ;
       if (false == argv.quiet)
            console.log("\n[Final state] ".success + ret.msg + "\n") ;
       else console.log(ret.msg + "\n") ;
   }
   catch (e)
   {
       console.log(e.stack) ;
       return process.exit(-1) ;
   }


   //
   // Functions
   //

   function prepend_stage ( stage, status, msg )
   {
       var ret = {} ;
       ret.status = status ;
       ret.msg    = msg.split("\n").join("\n" + stage) ;

       return ret ;
   }

   function welcome ( )
   {
       return '\n' +
              'CREATOR\n'.help +
              '-------\n'.help +
              'version: '.help + creator_version.help + '\n'.help +
              'website: https://creatorsim.github.io/\n'.help;
   }

   function help_usage ( )
   {
       return 'Usage:\n' +
              ' * To compile and execute an assembly file on an architecture:\n' +
              '   ./creator.sh -a <architecture file name> -s <assembly file name>\n' +
              ' * To get more information:\n' +
              '   ./creator.sh -h\n' ;
   }

   function help_describe ( argv )
   {
         // load architecture
         var architecture = fs.readFileSync(argv.architecture, 'utf8') ;
         ret = creator.load_architecture(architecture) ;
         if (ret.status !== "ok")
         {
             var ret = prepend_stage("[Loader] ", 'ko', '\n' + ret.errorcode) ;
             console.log(ret.msg) ;
             return process.exit(-1) ;
         }

         // show description
         var o = '' ;
         if (argv.describe.toUpperCase().startsWith('INS')) {
             o = creator.help_instructions() ;
         }
         if (argv.describe.toUpperCase().startsWith('PSEUDO')) {
             o = creator.help_pseudoins() ;
         }

         return o ;
   }

   function one_file ( argv_architecture, argv_library, argv_assembly, limit_n_ins, argv_result )
   {
       var msg1 = '' ;
       var ret1 = {
                     'architecture': { 'status': 'ko', 'msg':  'Not loaded' },
                     'library':      { 'status': 'ko', 'msg':  'Not linked' },
                     'compile':      { 'status': 'ko', 'msg':  'Not compiled' },
                     'execute':      { 'status': 'ko', 'msg':  'Not executed' },
                     'laststate':    { 'status': 'ko', 'msg':  'Not equals states' }
                  } ;

       // (a) load architecture
       var architecture = fs.readFileSync(argv_architecture, 'utf8') ;
       ret = creator.load_architecture(architecture) ;
       if (ret.status !== "ok")
       {
           ret1['architecture'] = prepend_stage("[Loader] ", 'ko', '\n' + ret.errorcode) ;
           return ret1 ;
       }
       ret1['architecture'] = prepend_stage("[Loader] ", 'ok',
                                            "\nArchitecture '" + argv.a + "' loaded successfully.") ;

       // (b) link
       if (argv_library !== '')
       {
           var library = fs.readFileSync(argv_library, 'utf8') ;
           ret = creator.load_library(library) ;
           if (ret.status !== "ok")
           {
               ret1['library'] = prepend_stage("[Linker] ", 'ko', '\n' + ret.msg) ;
               return ret1 ;
           }
           ret1['library'] = prepend_stage("[Linker] ", 'ok', "\nCode '" + argv.l + "' linked successfully.") ;
       }
       else
       {
           ret1['library'] = prepend_stage("[Linker] ", 'ok', "\nWithout library.") ;
       }

       // (c) compile
       var assembly = fs.readFileSync(argv_assembly, 'utf8') ;
       ret = creator.assembly_compile(assembly) ;
       if (ret.status !== "ok")
       {
                                 msg1  = "\nError at line " + (ret.line+1) ;
           if (ret.token !== '') msg1 += " (" + ret.token + ")" ;
                                 msg1 += ":\n" + ret.msg ;
           ret1['compile'] = prepend_stage("[Compiler] ", 'ko', '\n' + msg1) ;
           return ret1 ;
       }
       ret1['compile'] = prepend_stage("[Compiler] ", 'ok', "\nCode '" + argv.s + "' compiled successfully.") ;

       // (d) ejecutar
       ret = creator.execute_program(limit_n_ins) ;
       if (ret.status !== "ok")
       {
           msg1 = "\n Error found." +
                  "\n " + ret.msg ;
           ret1['execute'] = prepend_stage("[Executor] ", 'ko', '\n' + msg1) ;
           return ret1 ;
       }
       ret1['execute'] = prepend_stage("[Executor] ", 'ok', "\nExecuted successfully.") ;

       // (e) compare results
       if (argv_result !== '')
       {
           var result = fs.readFileSync(argv_result, 'utf8') ;
           ret = creator.get_state() ;
           ret = creator.compare_states(result, ret.msg) ;

           if (ret.msg !== '')
                ret1['laststate'] = prepend_stage("",         'ko', ret.msg) ;
           else ret1['laststate'] = prepend_stage("[State] ", 'ok', "Equals") ;

           return ret1 ;
       }

       // the end
       return ret1 ;
   }

