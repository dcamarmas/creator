#!/usr/bin/env node

   //
   // Import
   //

   // filesystem
   var fs   = require('fs') ;
   var path = require('path') ;

   // creator
   var creator = require('./js/min.creator_node.js') ;
   var creator_version = JSON.parse(fs.readFileSync(__dirname + '/package.json', 'utf8')).version ;

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
              .option('directory', {
                  alias:    'd',
                  type:     'string',
                  describe: 'Assemblies directory',
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
       colors.disable() ;
       if (argv.color)
       {
           colors.enable() ;
           colors.setTheme(color_theme) ;
       }

       var limit_n_ins   = parseInt(argv.maxins) ;
       var output_format = argv.output.toUpperCase() ;

       // work: a) help and usage
       if ( (argv.a != "") && (argv.describe != "") )
       {
             var o = help_describe(argv) ;
             console.log(welcome() + '\n' + o) ;
             return process.exit(0) ;
       }

       if ( (argv.a == "") || ((argv.s == "") && (argv.d == "")) )
       {
             var o = help_usage() ;
             console.log(welcome() + '\n' + o) ;
             return process.exit(0) ;
       }

       // work: welcome
       if (output_format == "NORMAL") {
           var msg = welcome() ;
           console.log(msg.success) ;
       }

       // work: b) list assembly files
       var file_names = [] ;
       if (argv.assembly !== '') {
           file_names.push(argv.assembly) ;
       }

       if (argv.directory !== '')
       {
           files = fs.readdirSync(argv.directory) ;
	   files.forEach(function (file) {
	       file_names.push(argv.directory + '/' + file) ;
	   });
       }

       // work: b) commands and switches
       var hdr   = '' ;
       var stage = '' ;
       var ret   = null ;
       for (var i=0; i<file_names.length; i++)
       {
           hdr = 'FileName' ;
	         show_result(output_format, file_names[i], file_names[i], '', true) ;

           ret = one_file(argv.architecture, argv.library, file_names[i], limit_n_ins, argv.result) ;

           // info: show possible errors
           for (var j=0; j<ret.stages.length; j++)
           {
                stage = ret.stages[j] ;
                hdr   = hdr + ',\t' + stage ;

                if (ret[stage].status !== "ok")
	                 show_result(output_format, stage, 'ko', ret[stage].msg.error, true) ;
	              else show_result(output_format, stage, 'ok', ret[stage].msg.success, false) ;
           }

           // info: "check differences" or "print finalmachine state"
           if (argv.result !== '')
           {
               hdr = hdr + ',\tState' ;
	             show_result(output_format, 'State', 'ko', ret['LastState'].msg.error, true) ;
               //continue ;
               if (ret.LastState.status != "ok") {
                   process.exit(-1) ;
               }
           }

           hdr = hdr + ',\tFinalState\n' ;
           ret = creator.get_state() ;
           if (argv.result === '') {
  	       show_result(output_format, 'FinalState', 'is', ret.msg, true) ;
               console.log('') ;
           }
       }

       if (output_format == "TAB") {
           console.log(hdr) ;
       }
       process.exit(0) ;
   }
   catch (e)
   {
       console.log(e.stack) ;
       process.exit(-1) ;
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
              '   ./creator.sh -a <architecture file name> --describe <instructions|pseudo>\n' +
              '\n' +
              ' * To get more information:\n' +
              '   ./creator.sh -h\n' ;
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
             var msg = '\n' + e.toString() ;
	         msg = msg.split("\n").join("\n[Architecture] ") ;
             console.log(msg) ;
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

   function show_result ( output_format, stage, status, msg, show_in_min )
   {
       switch (output_format)
       {
	   case "NORMAL":
                msg = "[" + stage + "] " + msg ;
	        msg = msg.split("\n").join("\n[" + stage + "] ") ;
                console.log(msg.success) ;
	        break;

	   case "MIN":
                if (show_in_min) {
	            console.log(msg) ;
	        }
	        break;

	   case "TAB":
                process.stdout.write(status + ',\t\t') ;
	        break;

	   default:
	        console.log('[' + stage + '] ' + msg + '\n') ;
	        break;
       }
   }

   function one_file ( argv_architecture, argv_library, argv_assembly, limit_n_ins, argv_result )
   {
       var msg1 = '' ;
       var ret  = null ;
       var ret1 = {
                     'Architecture': { 'status': 'ko', 'msg':  'Not loaded' },
                     'Library':      { 'status': 'ok', 'msg':  'Without library' },
                     'Compile':      { 'status': 'ko', 'msg':  'Not compiled' },
                     'Execute':      { 'status': 'ko', 'msg':  'Not executed' },
                     'LastState':    { 'status': 'ko', 'msg':  'Not equals states' },
                     'stages':       [ 'Architecture', 'Library', 'Compile', 'Execute' ]
                  } ;

       // (a) load architecture
       try
       {
           var architecture = fs.readFileSync(argv_architecture, 'utf8') ;
           ret = creator.load_architecture(architecture) ;
           if (ret.status !== "ok") {
               throw ret.errorcode ;
           }

           ret1.Architecture = { 'status': 'ok', 'msg': "Architecture '" + argv.a + "' loaded successfully." } ;
       }
       catch (e)
       {
           ret1.Architecture = { 'status': 'ko', 'msg': e.toString() } ;
           return ret1 ;
       }

       // (b) link
       if (argv_library !== '')
       {
           try
           {
               var library = fs.readFileSync(argv_library, 'utf8') ;
               ret = creator.load_library(library) ;
               if (ret.status !== "ok") {
                   throw ret.msg ;
               }

               ret1.Library = { 'status': 'ok', 'msg': "Code '" + argv.l + "' linked successfully." } ;
           }
           catch (e)
           {
               ret1.Library = { 'status': 'ko', 'msg': e.toString() } ;
               return ret1 ;
           }
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

           ret1.Compile = { 'status': 'ok', 'msg': "Code '" + argv.s + "' compiled successfully." } ;
       }
       catch (e)
       {
           ret1.Compile = { 'status': 'ko', 'msg': e.toString() } ;
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

           ret1.Execute = { 'status': 'ok', 'msg': "Executed successfully." } ;
       }
       catch (e)
       {
           ret1.Execute = { 'status': 'ko', 'msg': e.toString() } ;
           return ret1 ;
       }

       // (e) compare results
       if (argv_result !== '')
       {
           var result = fs.readFileSync(argv_result, 'utf8') ;
           ret = creator.get_state() ;
           ret = creator.compare_states(result, ret.msg) ;

           if (ret.msg !== '')
                ret1.LastState = { 'status': 'ko', 'msg': ret.msg } ;
           else ret1.LastState = { 'status': 'ok', 'msg': 'Equals' } ;

           return ret1 ;
       }

       // the end
       return ret1 ;
   }

