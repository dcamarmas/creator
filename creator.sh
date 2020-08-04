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
              .example([ ['./$0',
                         'To show examples.'] ])
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
              .option('output', {
                  alias:    'o',
                  type:     'string',
                  describe: 'Define output format',
                  nargs:    1,
                  default:  'normal'
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

   try
   {
       if (argv.color) {
           colors.setTheme(color_theme) ;
       }
       var limit_n_ins   = parseInt(argv.maxins) ;
       var output_format = argv.output.toUpperCase() ;

       // work: welcome
       if (output_format == "NORMAL") {
           var msg = welcome() ;
           console.log(msg.success) ;
       }

       // work: a) help and usage
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

       // work: b) commands and switches
       var file_names = [] ;
       if (argv.assembly !== '') {
           file_names.push(argv.assembly) ;
       }

       var ret = null ;
       for (var i=0; i<file_names.length; i++)
       {
           ret = one_file(argv.architecture, argv.library, file_names[i], limit_n_ins, argv.result) ;
    
           // info: show possible errors
           for (var j=0; j<ret.stages.length; j++)
           {
                var stage = ret.stages[j] ;
                if (ret[stage].status !== "ok") {
                    console.log(ret[stage].msg.error) ;
                    return process.exit(-1) ;
                }
    
                if (output_format == "NORMAL") {
                    console.log(ret[stage].msg.success) ;
                }
           }
    
           // info: "check differences" or "print finalmachine state"
           if (argv.result !== '')
           {
               if (output_format == "NORMAL")
                    console.log("\n[State] ".success + ret.laststate.msg + "\n") ;
               else console.log(ret.laststate.msg) ;
               return process.exit(0) ;
           }
    
           ret = creator.get_state() ;
           if (output_format == "NORMAL")
                console.log("\n[Final state] ".success + ret.msg + "\n") ;
           else console.log(ret.msg + "\n") ;
       }
   }
   catch (e)
   {
       console.log(e.stack) ;
       return process.exit(-1) ;
   }


   //
   // Functions
   //

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
              ' * Same as before but execute only 10 instructions:\n' +
              '   ./creator.sh -a <architecture file name> -s <assembly file name> --maxins 10\n' +
              '\n' +
              ' * Same as before and save the final state in a result file:\n' +
              '   ./creator.sh -a <architecture file name> -s <ok assembly file name> -o min > <result file>\n' +
              ' * To compile and execute an assembly file, and check the final state with a result file:\n' +
              '   ./creator.sh -a <architecture file name> -s <assembly file name> -o min -r <result file>\n' +
              '\n' +
              ' * To get a summary of the instructions/pseudoinstructions:\n' +
              '   ./creator.sh -a ./architecture/MIPS-32-like.json --describe <instructions|pseudo>\n' +
              '\n' +
              ' * To get more information:\n' +
              '   ./creator.sh -h\n' ;
   }

	   function prepend_stage ( stage, status, msg )
	   {
	       var ret = {} ;
	       ret.status = status ;
	       ret.msg    = msg.split("\n").join("\n" + stage) ;

	       return ret ;
	   }

   function help_describe ( argv )
   {
         // load architecture
         try
         {
             var architecture = fs.readFileSync(argv.architecture, 'utf8') ;
             ret = creator.load_architecture(architecture) ;
             if (ret.status !== "ok") {
                 throw ret.errorcode ;
             }
         }
         catch (e)
         {
             var ret = prepend_stage("[Loader] ", 'ko', '\n' + e) ;
             console.log(ret.msg) ;
             process.exit(-1) ;
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
                     'laststate':    { 'status': 'ko', 'msg':  'Not equals states' },
                     'stages':       [ 'architecture', 'library', 'compile', 'execute' ]
                  } ;

       // (a) load architecture
       try
       {
           var architecture = fs.readFileSync(argv_architecture, 'utf8') ;
           ret = creator.load_architecture(architecture) ;
           if (ret.status !== "ok") {
               throw ret.errorcode ;
           }

           msg1 = "Architecture '" + argv.a + "' loaded successfully." ;
           ret1['architecture'] = prepend_stage("[Loader] ", 'ok', '\n' + msg1) ;
       }
       catch (e)
       {
           ret1['architecture'] = prepend_stage("[Loader] ", 'ko', '\n' + e) ;
           return ret1 ;
       }

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
       try
       {
           var architecture = fs.readFileSync(argv_architecture, 'utf8') ;
           var assembly = fs.readFileSync(argv_assembly, 'utf8') ;
           ret = creator.assembly_compile(assembly) ;
           if (ret.status !== "ok") {
                                     msg1  = "\nError at line " + (ret.line+1) ;
               if (ret.token !== '') msg1 += " (" + ret.token + ")" ;
                                     msg1 += ":\n" + ret.msg ;
               throw msg1 ;
           }

           msg1 = "Code '" + argv.s + "' compiled successfully." ;
           ret1['compile'] = prepend_stage("[Compiler] ", 'ok', '\n' + msg1) ;
       }
       catch (e)
       {
           ret1['compile'] = prepend_stage("[Compiler] ", 'ko', '\n' + e) ;
           return ret1 ;
       }

       // (d) ejecutar
       try
       {
           ret = creator.execute_program(limit_n_ins) ;
           if (ret.status !== "ok")
           {
               msg1 = "\n Error found." +
                      "\n " + ret.msg ;
               throw msg1 ;
           }

           msg1 = "Executed successfully." ;
           ret1['execute'] = prepend_stage("[Executor] ", 'ok', '\n' + msg1) ;
       }
       catch (e)
       {
           ret1['execute'] = prepend_stage("[Executor] ", 'ko', '\n' + e) ;
           return ret1 ;
       }

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

