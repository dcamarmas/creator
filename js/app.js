/*
 *  Copyright 2018-2022 Felix Garcia Carballeira, Alejandro Calderon Mateos, Diego Camarmas Alonso
 *
 *  This file is part of CREATOR.
 *
 *  CREATOR is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  CREATOR is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with CREATOR.  If not, see <http://www.gnu.org/licenses/>.
 *
 */


/*General*/
var toHandler = null;


/****************
 * Vue instance *
 ****************/

try
{

  window.app = new Vue({

    /*DOM ID*/
    el: "#app",

    /*Vue data*/
    data: {

      /********************/
      /* Global Variables */
      /********************/

      //
      // General information
      //

      //Version Number
      version: '',

      //Architecture name
      architecture_name: '',


      //
      // Current view
      //

      creator_mode: "load_architecture",


      //
      // Configuration
      //

      //Accesskey
      browser: "",

      //Notification speed
      notificationTime: 1500, //TODO: general variable?
      //Displayed notifications
      notifications: notifications,

      // Instruction help size
      instruction_help_size: 33,

      //Auto Scroll
      autoscroll: true,

      // Font size
      fontSize: 15,

      //Debug
      c_debug: false,

      //Dark Mode
      dark: false,

      

      /*************************/
      /* Architecture Selector */
      /*************************/

      //
      //Available architectures
      //

      arch_available: architecture_available,

      //Architectures card background
      back_card: back_card,

      //Delete architecture modal //TODO: include into preload component
      modalDeletArchIndex: 0,


      //
      //Backup 
      //

      date_copy: '',



      /****************/
      /* Architecture */
      /****************/


      
      //Load architecture
      architecture: architecture,
      architecture_hash: architecture_hash,


      //Advanced mode
      advanced_mode: true,


      //Floating point registers
      simple_reg: [],

      //Edit architecture field modal
      modalEditArchField: { //TODO: include into arch_conf component
        title: '',
        field: '',
        value: '',
        index: '',
      },
      //Reset architecture field modal
      modalResetArchField:{ //TODO: include into arch_conf component
        title: '',
        index: '',
      },


      //Edit memory layout modal
      modalEditMemoryLayout: { //TODO: include into memory_layout component
        memory_layout: ["", "", "", "", "", ""],
      },
      

      //Edit component modal
      modalEditComponent: { //TODO: include into register_file component
        title: '',
        element: '',
        name: '',
      },
      //Delete component modal
      modalDeletComp:{ //TODO: include into register_file component
        title: '',
        element: '',
      },


      //New register modal
      modalNewElement:{ //TODO: include into register_file component
        element: '',
        type: '',
        double_precision: '',
        id: '',
      },

      //Edit register modal
      modalEditElement:{ //TODO: include into register component
        element: '',
        type: '',
        double_precision: '',
        name: '',
        id: '',
        defValue: '',
        properties: [],
        precision: '',
        simple1: '',
        simple2: '',
      },

      //Delete element modal
      modalDeletElement:{ //TODO: include into register component
        title: '',
        element: '',
      },


      //Instruction form
      formInstruction: { //TODO
        name: '',
        type: '',
        co: '',
        cop: '',
        nwords: 1,
        help: '',
        properties: [],
        numfields: "1",
        numfieldsAux: "1",
        nameField: [],
        typeField: [],
        separated: [],
        startBitField: [],
        stopBitField: [],
        valueField: [],
        assignedCop: false,
        signature: '',
        signatureRaw: '',
        signature_definition: '',
        definition: '',
      },

      /*Instructions fields*/
      modalViewFields:{ //TODO: include into instruction component
        title: '',
      },

      /*Edit instruction modal*/
      modalEditInst:{ //TODO: include into instruction component
        title: '',
        element: '',
        co: '',
        cop: '',
      },

      /*Delete instruction modal*/
      modalDeletInst:{ //TODO: include into instruction component
        index: 0,
      },


      //Pseudoinstruction form
      formPseudoinstruction: { //TODO
        name: '',
        nwords: 1,
        numfields: "0",
        numfieldsAux: "0",
        nameField: [],
        typeField: [],
        startBitField: [],
        stopBitField: [],
        signature: '',
        signatureRaw: '',
        signature_definition: '',
        definition: '',
        help: '',
      },

      //Instructions fields
      modalViewPseudoFields:{ //TODO: include into pseudoinstruction component
        title: '',
      },

      //Edit pseudoinstruction modal
      modalEditPseudoinst:{ //TODO: include into pseudoinstruction component
        element: '',
        index: 0,
      },

      //Delete pseudoinstruction modal
      modalDeletPseudoinst:{ //TODO: include into pseudoinstruction component
        index: 0,
      },


      //Edit directive modal
      modalEditDirective:{ //TODO: include into directives component
        title: '',
        element: '',
        name: '',
        action: '',
        size: 0,
      },

      //Delete directive modal //TODO: include into directives component
      modalDeletDir:{
        title: '',
        element: '',
      },

      
      
      /************/
      /* Assembly */
      /************/

      //
      //Available examples
      //

      example_set_available: example_set_available,
      example_available: example_available,
      //example_loaded: null, //TODO

      //
      //Code error modal
      //

      modalAssemblyError:{
        code1: '',
        code2: '',
        code3: '',
        error: '',
      },

      //
      //Assembly code
      //

      assembly_code: "",



      /*************/
      /* Simulator */
      /*************/

      //
      // Execution
      //

      //Run instructions
      instructionsPacked: 20,

      //Run button
      runExecution: false,

      //Reset button
      resetBut: false,

      //Instructions
      instructions: instructions,


      //
      //Data view
      //

      data_mode: 'registers',


      //
      //Registers
      //

      register_type: 'integer',
      name_reg: 'INT Registers',
      reg_type: 'int',


      //
      //Memory
      //

      main_memory: {},

      //Stack
      track_stack_names: track_stack_names,
      callee_subrutine: "",
      caller_subrutine: "",
      stack_pointer: 0,
      begin_caller: 0,
      end_caller: 0,
      begin_callee: 0,
      end_callee: 0,

      //
      //Stats
      //

      totalStats: totalStats,
      stats: stats,
      //Stats Graph values
      stats_value: stats_value,

      //
      //Display and keyboard
      //

      display: '',
      keyboard: '',
      enter: null,
    },



    /*Created vue instance*/
    created(){
      this.load_num_version();
      this.load_arch_available();
      this.detectBrowser();
    },



    /*Mounted vue instance*/
    mounted(){
      this.backupCopyModal();
      this.verifyBrowser();
      this.get_configuration();

      // pre-load following URL params
      var url_hash = creator_preload_get2hash(window.location) ;
      creator_preload_fromHash(this, url_hash) ;
    },



    beforeUpdate(){
      this.get_dark_mode();
    },



    /*Vue methods*/
    methods: {

      /*Generic*/

      load_num_version(){
        $.getJSON('package.json', function(cfg){
          creator_information = cfg;
          app._data.version = cfg.version;
        });
      },

      //Detects the browser being used
      detectBrowser(){
        if(navigator.appVersion.indexOf("Mac")!=-1) {
          this.browser = "Mac";
          return;
        }

        if (navigator.userAgent.search("Chrome") >= 0) {
          this.browser = "Chrome";
        }
        else if (navigator.userAgent.search("Firefox") >= 0) {
          this.browser = "Firefox";
        }
        else if (navigator.userAgent.search("Safari") >= 0 && navigator.userAgent.search("Chrome") < 0) {
          this.browser = "Chrome";
        }
      },

      verifyBrowser() {
        if (navigator.userAgent.indexOf("OPR") > -1) {
          this.$root.$emit('bv::show::modal', 'modalBrowser');
        }
        else if (navigator.userAgent.indexOf("MIE") > -1) {
          this.$root.$emit('bv::show::modal', 'modalBrowser');
        }
        else if (navigator.userAgent.indexOf("Edge") > -1) {
          this.$root.$emit('bv::show::modal', 'modalBrowser');
        }
        else if(navigator.userAgent.indexOf("Chrome") > -1) {
          return;
        }
        else if (navigator.userAgent.indexOf("Safari") > -1) {
          return;
        }
        else if (navigator.userAgent.indexOf("Firefox") > -1) {
          return
        }
        else{
          this.$root.$emit('bv::show::modal', 'modalBrowser');
        }
      },

      /*loads the configuration values from the last use*/
      get_configuration(){
        if(localStorage.getItem("instructionsPacked") != null){
          this.instructionsPacked = parseInt(localStorage.getItem("instructionsPacked"));
        }

        if(localStorage.getItem("autoscroll") != null){
          this.autoscroll = (localStorage.getItem("autoscroll") === "true");
        }

        if(localStorage.getItem("notificationTime") != null){
          this.notificationTime = parseInt(localStorage.getItem("notificationTime"));
        }

        if(localStorage.getItem("instruction_help_size") != null){
          this.instruction_help_size = parseInt(localStorage.getItem("instruction_help_size"));
        }
      },

      /*Verify if dark mode was activated de last use*/
      get_dark_mode(){
        if(localStorage.getItem("dark_mode") != null){
          document.getElementsByTagName("body")[0].style = localStorage.getItem("dark_mode");
          if(localStorage.getItem("dark_mode") == ""){
            app._data.dark = false;
          }
          else{
            app._data.dark = true;
          }
        }
        else{
          var default_style = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if(default_style == true){
            document.getElementsByTagName("body")[0].style = "filter: invert(88%) hue-rotate(160deg) !important; background-color: #111 !important;";
            app._data.dark = true;
          }
          else{
            document.getElementsByTagName("body")[0].style = "";
            app._data.dark = false;
          }
        }
      },













      /*Screen change*/ //TODO
      change_UI_mode(e) {
        if(app._data.creator_mode != e){

          if(app._data.creator_mode == "architecture"){
            app._data.advanced_mode = true;
          }

          // Close codemirror
          if(textarea_assembly_editor != null && e != "assembly"){
            app._data.assembly_code = textarea_assembly_editor.getValue();
            code_assembly = textarea_assembly_editor.getValue();
            codemirrorHistory = textarea_assembly_editor.getHistory();
            textarea_assembly_editor.toTextArea();
          }

          // slow transition <any> => "architecture"
          if (e == "architecture")
          {
              $(".loading").show();
              setTimeout(function(){
                app._data.creator_mode = e;
                app.$forceUpdate();
                 $(".loading").hide();
               }, 50) ;
              return ;
          }

          // fast transition <any> => <any> - "architecture"
          app._data.creator_mode = e;

          if(e == "assembly"){
            setTimeout(function(){
              codemirrorStart();
              if (codemirrorHistory != null ){
                textarea_assembly_editor.setHistory(codemirrorHistory);
                textarea_assembly_editor.undo();
              }
              textarea_assembly_editor.setValue(code_assembly);
              //if(app._data.update_binary != ""){
              if(update_binary != ""){
                $("#divAssembly").attr("class", "col-lg-10 col-sm-12");
                $("#divTags").attr("class", "col-lg-2 col-sm-12");
                $("#divTags").show();
              }
            },50);
          }

          app.$forceUpdate();
        }
      },






























      /*************************/
      /* Architecture Selector */
      /*************************/

      //Load the available architectures and check if exists backup
      load_arch_available() {
        $.getJSON('architecture/available_arch.json' + "?v=" + new Date().getTime(), function(cfg){
          architecture_available = cfg;

          if (typeof(Storage) !== "undefined"){
            if(localStorage.getItem("load_architectures_available") != null){
              var auxArch = localStorage.getItem("load_architectures_available");
              var aux = JSON.parse(auxArch);

              for (var i = 0; i < aux.length; i++){
                architecture_available.push(aux[i]);
                load_architectures_available.push(aux[i]);

                var auxArch2 = localStorage.getItem("load_architectures");
                var aux2 = JSON.parse(auxArch2);
                load_architectures.push(aux2[i]);
              }
            }
          }

          app._data.arch_available = architecture_available;

          for (var i = 0; i < architecture_available.length; i++){
            back_card.push({name: architecture_available[i].name , background: "default"});
          }
        });
      },


      /*Show backup modal*/
      backupCopyModal(){
        if (typeof(Storage) !== "undefined"){
          if(localStorage.getItem("architecture_copy") != null && localStorage.getItem("assembly_copy") != null && localStorage.getItem("date_copy") != null){
            this.date_copy = localStorage.getItem("date_copy");
            this.$root.$emit('bv::show::modal', 'copy');
          }
        }
      },



      /****************/
      /* Architecture */
      /****************/




      /************/
      /* Assembly */
      /************/

      //Empty assembly textarea
      newAssembly(){
        textarea_assembly_editor.setValue("");
      },

      //Compile assembly code
      assembly_compiler(code)
      {

        show_loading();
        promise = new Promise((resolve, reject) => {

          setTimeout(function() {

            // Compile
            if (typeof(code)!=="undefined") {
                code_assembly=code;
            }
            else{
                code_assembly = textarea_assembly_editor.getValue();
            }

            var ret = assembly_compiler() ;

            //Update/reset
            app._data.totalStats   = 0;
            app._data.instructions = instructions;

            tokenIndex = 0;
            app.reset(true);

            //Save a backup in the cache memory
            if (typeof(Storage) !== "undefined")
            {
              var auxObject = jQuery.extend(true, {}, architecture);
              var auxArchitecture = register_value_serialize(auxObject);
              var auxArch = JSON.stringify(auxArchitecture, null, 2);

              var date = new Date();
              var auxDate = date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()+" - "+date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear();
              console_log(app._data.architecture_name);

              localStorage.setItem("arch_name", app._data.architecture_name);
              localStorage.setItem("architecture_copy", auxArch);
              localStorage.setItem("assembly_copy", code_assembly);
              localStorage.setItem("date_copy", auxDate);
            }

            // show error/warning
            hide_loading();

            switch (ret.type)
            {
              case "error":
                   app.compileError(ret.msg, ret.token, ret.line) ;
                   break;

              case "warning":
                   show_notification(ret.token, ret.bgcolor) ;
                   break;

              default:
                   show_notification('Compilation completed successfully', 'success') ;
                   break;
            }

            // end
            resolve("0");

          }, 25);
        });
      },












      //Show error message in the compilation
      compileError(msg, token, line)
      {
        var code_assembly_segment = code_assembly.split('\n') ;

        this.change_UI_mode('assembly');

        setTimeout(function() {
          app.$root.$emit('bv::show::modal', 'modalAssemblyError') ;

          // line 1
          app.modalAssemblyError.line1 = "" ;
          app.modalAssemblyError.code1 = "" ;
          if (line > 0) {
              app.modalAssemblyError.line1 = line ;
              app.modalAssemblyError.code1 = code_assembly_segment[line - 1] ;
          }

          // line 2
          app.modalAssemblyError.line2 = line + 1 ;
          app.modalAssemblyError.code2 = code_assembly_segment[line] ;

          // line 3
          app.modalAssemblyError.line3 = "" ;
          app.modalAssemblyError.code3 = ""  ;
          if (line < code_assembly_segment.length - 1) {
              app.modalAssemblyError.line3 = line + 2 ;
              app.modalAssemblyError.code3 = code_assembly_segment[line + 1] ;
          }

          app.modalAssemblyError.error = msg ;

        },75);
      },





      //Remove a loaded binary
      removeLibrary(){
          update_binary = "";
          load_binary = false;
          $("#divAssembly").attr("class", "col-lg-12 col-sm-12");
          $("#divTags").attr("class", "col-lg-0 col-sm-0");
          $("#divTags").hide();
      },



      /*************/
      /* Simulator */
      /*************/

      // Reset execution //TODO: include into navbar component
      reset ( reset_graphic )
      {
        creator_ga('execute', 'execute.reset', 'execute.reset');

        show_loading();
        setTimeout(function() {

          // UI: reset I/O
          app._data.resetBut = true ;
          app._data.keyboard = "" ;
          app._data.display  = "" ;
          app._data.enter    = null ;

          // UI: reset row color...
          for (var i = 0; i < instructions.length; i++) {
               instructions[i]._rowVariant = '' ;
          }

          reset(reset_graphic) ;

          // UI: set default row color...
          for (var i = 0; i < instructions.length; i++) {
               if (instructions[i].Label == "main") {
                   instructions[i]._rowVariant = 'success' ;
               }
          }

          if(executionIndex >= 0 && (executionIndex + 4) < instructions.length){
            var id = "#inst_table__row_" + instructions[executionIndex + 4].Address;
            var rowpos = $(id).position();
            if(rowpos){
              var pos = rowpos.top - $('.instructions_table').height();
              $('.instructions_table').animate({scrollTop: (pos)}, 200);
            }
          }
          else if(executionIndex > 0 && (executionIndex + 4) >= instructions.length){
            $('.instructions_table').animate({scrollTop: ($('.instructions_table').height())}, 300);
          }

          if(reset_graphic == true && app._data.data_mode == "stats"){
            ApexCharts.exec('graphic', 'updateSeries', stats_value);
          }

          hide_loading();

        }, 25);

      },

      //Exception Notification
      exception(error)
      {
        show_notification("There has been an exception. Error description: '" + error, 'danger') ;

        if (executionIndex != -1) {
          instructions[executionIndex]._rowVariant = 'danger';
        }
        
        executionIndex = -1;

        /* Google Analytics */
        creator_ga('execute', 'execute.exception', 'execute.exception.' + error);

        return;
      },

      //Convert hexadecimal number to floating point number
      hex2float ( hexvalue )
      {
        return hex2float(hexvalue) ;
      },

      //Convert hexadecimal number to double floating point number
      hex2double ( hexvalue ){
          return hex2double(hexvalue) ;
      },

      //Convert hexadecimal number to char
      hex2char8 ( hexvalue )
      {
          return hex2char8(hexvalue) ;
      },

      //Convert floating point number to binary
      float2bin (number)
      {
          return float2bin(number) ;
      },

      //Convert double floating point number to binary
      double2bin(number)
      {
          return double2bin(number) ;
      },

      //Convert binary number to hexadecimal number
      bin2hex(s)
      {
          return bin2hex(s) ;
      },




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

      change_data_view(e, type)
      {
        app._data.data_mode = e;

        if(e == "registers" && type != ''){
          if(type == "int"){
            app._data.register_type = 'integer';
            app._data.name_reg = 'INT Registers';
            app._data.reg_type = 'int';
          }
          else if(type == "fp"){
            app._data.register_type = 'floating point';
            app._data.name_reg = 'FP Registers';
            app._data.reg_type = 'fp';
          }
        }
        if(e == "memory"){
          app._data.data_mode = e; //TODO: vue bidirectional updates
          app._data.reg_type = '';
        }
        if(e == "stat"){
          app._data.data_mode = e; //TODO: vue bidirectional updates
          app._data.reg_type = ''; 
        }
        
        app.$forceUpdate();

        // Google Analytics
        creator_ga('data', 'data.view', 'data.view.' + app._data.data_mode);
      },


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    },
  });


  /*************
   * Functions *
   *************/

  /*All modules*/

  /*Error handler*/
  Vue.config.errorHandler = function (err, vm, info) {
      show_notification('An error has ocurred, the simulator is going to restart.  \n Error: ' + err, 'danger') ;
      setTimeout(function(){
        location.reload(true)
      }, 3000);
  }

  /*Closing alert*/
  window.onbeforeunload = confirmExit;
  function confirmExit(){
    return "He's tried to get off this page. Changes may not be saved.";
  }

  /*Stop the transmission of events to children*/
  function destroyClickedElement(event) {
    document.body.removeChild(event.target);
  }

  /*console.log*/
  function console_log(m){
    if(app._data.c_debug){
      console.log(m);
    }
  }

  /*Architecture editor*/

  /*Codemirror*/
  function codemirrorStart(){
    var editor_cfg = {
      lineNumbers: true,
      autoRefresh:true
    };

    var textarea_assembly_obj = document.getElementById("textarea_assembly");

    if (textarea_assembly_obj != null) {
      textarea_assembly_editor = CodeMirror.fromTextArea(textarea_assembly_obj, editor_cfg);
      textarea_assembly_editor.setOption('keyMap', 'sublime') ; // vim -> 'vim', 'emacs', 'sublime', ...
      textarea_assembly_editor.setValue(app._data.assembly_code);
      textarea_assembly_editor.setSize("auto", "70vh");

      // add Ctrl-m
      var map = {
        'Ctrl-M': function(cm) { cm.execCommand('toggleComment'); }
      } ;
      textarea_assembly_editor.addKeyMap(map);
    }
  }

  /*Simulator*/

  /*Binary string to integer number*/
  function binaryStringToInt( b ) {
    return parseInt(b, 2);
  }
}
catch(e)
{
  show_notification('An error has ocurred, the simulator is going to restart.  \n Error: ' + e, 'danger') ;

  /* Google Analytics */
  creator_ga('creator', 'creator.exception', 'creator.exception.' + e);

  setTimeout(function(){
    location.reload(true)
  }, 3000);
}

