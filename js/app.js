
/*
 *  Copyright 2018-2024 Felix Garcia Carballeira, Alejandro Calderon Mateos, Diego Camarmas Alonso
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


/****************
 * Vue instance *
 ****************/

try
{

  window.app = new Vue({

    /**********
     * DOM ID *
     **********/
    el: "#app",




    /************
     * Vue Data *
     ************/
    data: {

      /********************/
      /* Global Variables */
      /********************/

      //Forces vue to reload a component, similar to $forceUpdate()
      render: 0,

      //
      // General information
      //

      //Version Number
      version: '',

      //Architecture name and guide
      architecture_name: '',
      architecture_guide: '',

      //Accesskey
      os: "",
      browser: "",

      //Displayed notifications
      notifications: notifications, //TODO: copy or only in app?


      //
      // Current view
      //

      creator_mode: "load_architecture",


      //
      // Configuration
      //

      //Stack total list values
      default_architecture: "none",

      //Stack total list values
      stack_total_list: 40,

      //Notification speed
      notification_time: 1500,

      // Instruction help size
      instruction_help_size: 33,

      //Auto Scroll
      autoscroll: true,

      // Font size
      font_size: 15,

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

      arch_available: architecture_available, //TODO: copy or only in app?

      //Architectures card background
      back_card: back_card, //TODO: copy or only in app?

      //Delete architecture modal 
      modal_delete_arch_index: 0, //TODO: include into delete architecture component - modal info



      /****************/
      /* Architecture */
      /****************/

      //Load architecture
      architecture: architecture,
      architecture_hash: architecture_hash,


      //Edit architecture field modal
      modal_edit_arch_field: { //TODO: include into arch_conf component - modal info
        title: '',
        field: '',
        value: '',
        index: ''
      },
      //Reset architecture field modal
      modal_reset_arch_field:{ //TODO: include into arch_conf component - modal info
        title: '',
        index: ''
      },
      

      //Edit register file modal
      modal_edit_register_file: { //TODO: include into register_file component - modal info
        title: '',
        name: '',
        index: null
      },
      //Delete register file modal
      modal_delete_register_file:{ //TODO: include into register_file component - modal info
        title: '',
        index: null
      },


      //New register modal
      modal_new_register:{ //TODO: include into register_file component - modal info
        register_file_index: null,
        type: '',
        double_precision: '',
        double_precision_type: '',
        reg_id: '',
        simple_reg: []
      },
      //Edit register modal
      modal_edit_register:{ //TODO: include into register component - modal info
        title: '',
        register_file_index: null,
        register_index: null,
        type: '',
        double_precision: '',
        double_precision_type: '',
        reg_id: '',
        simple_reg: [],
        register: {}
      },
      //Delete register modal
      modal_delete_register:{ //TODO: include into register component - modal info
        title: '',
        register_file_index: null,
        register_index: null
      },


      //Instructions fields
      modal_field_instruction:{ //TODO: include into instruction component - modal info
        title: '',
        index: null,
        instruction: {}
      },
      //Edit instruction modal
      modal_edit_instruction:{ //TODO: include into instruction component - modal info
        title: '',
        index: null,
        instruction: {},
        number_fields: null
      },
      //Delete instruction modal
      modal_delete_instruction:{ //TODO: include into instruction component - modal info
        title: '',
        index: null,
      },


      //Pseudoinstruction fields
      modal_field_pseudoinstruction:{ //TODO: include into pseudoinstruction component - modal info
        title: '',
        index: null,
        pseudoinstruction: {}
      },
      //Edit pseudoinstruction modal
      modal_edit_pseudoinstruction:{ //TODO: include into pseudoinstruction component - modal info
        title: '',
        index: null,
        pseudoinstruction: {},
        number_fields: null
      },
      //Delete pseudoinstruction modal
      modal_delete_pseudoinstruction:{ //TODO: include into pseudoinstruction component - modal info
        title: '',
        index: null,
      },


      //Edit directive modal
      modal_edit_directive:{ //TODO: include into directives component - modal info
        title: '',
        index: null,
        directive: {}
      },
      //Delete directive modal //TODO: include into directives component - modal info
      modal_delete_directive:{
        title: '',
        index: null
      },

      
      
      /************/
      /* Assembly */
      /************/

      //
      //Available examples
      //

      example_set_available: example_set_available,
      example_available: example_available,

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

      //Instructions
      instructions: instructions,


      //
      //Data view
      //

      data_mode: 'int_registers',

      //
      //Memory
      //

      main_memory: {},
      main_memory_busy: false,

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
      //CLK Cycles
      //

      total_clk_cycles: total_clk_cycles,
      clk_cycles: clk_cycles,
      //CLK Cycles Graph values
      clk_cycles_value: clk_cycles_value,

      //
      //Display and keyboard
      //

      display: '',
      keyboard: '',
      enter: null, // Draw text area border in read

      //
      //Flash
      //

      lab_url: "",
      result_email: "",
      target_ports: { Win: 'rfc2217://host.docker.internal:4000?ign_set_control', Mac: '/dev/cu.usbserial-210', Linux: '/dev/ttyUSB0' }, //TODO: include into flash component - modal info
      target_board: "", //TODO: include into flash component - modal info
      target_port: "", //TODO: include into flash component - modal info
      flash_url: "http://localhost:8080", //TODO: include into flash component - modal info

    },




    /************************
     * Created vue instance *
     ************************/
    created(){
      uielto_navbar.methods.load_num_version();
      uielto_preload_architecture.methods.load_arch_available();
      this.detect_os();
      this.detect_browser();
      this.get_target_port();
    },


    /************************
     * Mounted vue instance *
     ************************/
    mounted(){
      this.validate_browser();
      uielto_backup.methods.backup_modal(this);

      //Pre-load following URL params
      var url_hash = creator_preload_get2hash(window.location) ;
      creator_preload_fromHash(this, url_hash) ;
    },


    /*************
     * Before UI *
     *************/
    beforeUpdate(){
      uielto_configuration.methods.get_configuration();
      uielto_configuration.methods.get_dark_mode();
    },




    /***************
     * Vue methots *
     ***************/

    methods: {

      /*******************
       * General methots *
       *******************/

      //Detects the operating system being used
      detect_os(){
        if (navigator.appVersion.indexOf("Win") != -1) {
          this.os = "Win";
        } 
        else if (navigator.appVersion.indexOf("Mac") != -1) {
          this.os = "Mac";
        }
        else if (navigator.appVersion.indexOf("X11") != -1) {
          this.os = "Linux";
        }
        else if (navigator.appVersion.indexOf("Linux") != -1) {
          this.os = "Linux";
        }
      },

      //Detects the browser being used
      detect_browser(){
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

      //Show modal if the browser is not permited
      validate_browser() {
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
          return
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




      /*************/
      /* Simulator */
      /*************/

      //Exception Notification
      exception(error) //TODO: Move?
      {
        show_notification("There has been an exception. Error description: '" + error, 'danger') ;

        if (execution_index != -1)
        {
          instructions[execution_index]._rowVariant = 'danger';
          app._data.instructions[execution_index]._rowVariant = 'danger';
        }

        /* Google Analytics */
        creator_ga('execute', 'execute.exception', 'execute.exception.' + error);

        return;
      },

      //Get target por by SO
      get_target_port()
      {
        this.target_port = this.target_ports[this.os];
      },
    },
  });




  /*********************
   * General Functions *
   *********************/

  //Error handler
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


  //Codemirror
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


  //Binary string to integer number
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