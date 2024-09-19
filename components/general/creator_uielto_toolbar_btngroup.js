
/*
 *  Copyright 2018-2024 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos
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


  /* jshint esversion: 6 */

  var this_compiling = null;

  var uielto_toolbar_btngroup = {

        props:      {
                      group:                        { type: Array,   required: true },
                      browser:                      { type: String,  required: true },
                      arch_available:               { type: Array,   required: true }
                    },

        data:       function () {
                      return {
                        compiling: false,
                        reset_disable: false,
                        instruction_disable: false,
                        run_disable: false,
                        stop_disable: true
                      }
                    },

        methods:    {
                      //
                      //Screen change
                      //

                      change_UI_mode(e)
                      {
                        if(app._data.creator_mode != e)
                        {
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

                          //Assembly view
                          if(e == "assembly")
                          {
                            setTimeout(function(){
                              codemirrorStart();
                              if (codemirrorHistory != null ){
                                textarea_assembly_editor.setHistory(codemirrorHistory);
                                textarea_assembly_editor.undo();
                              }
                              textarea_assembly_editor.setValue(code_assembly);
                              if(update_binary != ""){
                                $("#divAssembly").attr("class", "col-lg-10 col-sm-12");
                                $("#divTags").attr("class", "col-lg-2 col-sm-12");
                                $("#divTags").show();
                              }
                            },50);
                          }

                          //Architecture or simulator view => Close codemirror
                          if(textarea_assembly_editor != null && e != "assembly")
                          {
                            app._data.assembly_code = textarea_assembly_editor.getValue();
                            code_assembly = textarea_assembly_editor.getValue();
                            codemirrorHistory = textarea_assembly_editor.getHistory();
                            textarea_assembly_editor.toTextArea();
                          }

                           //Close all toast and refresh
                          app.$bvToast.hide()
                        }
                      },

                      //
                      // Architecture Selector
                      //

                      load_arch_select(arch)
                      {
                        uielto_preload_architecture.methods.load_arch_select(arch);

                        //Close all toast and refresh
                        app.$bvToast.hide()
                      },

                      //
                      // Assembly
                      //

                      new_assembly()
                      {
                        textarea_assembly_editor.setValue("");
                      },

                      //Compile assembly code
                      assembly_compiler(code)
                      {
                        //Change buttons status
                        this_compiling = this;
                        this_compiling.compiling = true;

                        promise = new Promise((resolve, reject) => {
                          setTimeout(function() {

                            // Compile
                            if (typeof(code)!=="undefined") {
                                code_assembly = code;
                            }
                            else{
                                code_assembly = textarea_assembly_editor.getValue();
                            }
                            var ret = assembly_compiler() ;

                            //Update/reset
                            app._data.totalStats   = 0;
                            app._data.instructions = instructions;
                            tokenIndex = 0; //TODO: change to token_index in all files
                            uielto_toolbar_btngroup.methods.reset(true);

                            //Save a backup in the cache memory
                            if (typeof(Storage) !== "undefined")
                            {
                              var aux_object = jQuery.extend(true, {}, architecture);
                              var aux_architecture = register_value_serialize(aux_object);
                              var aux_arch = JSON.stringify(aux_architecture, null, 2);

                              var date = new Date();
                              var auxDate = date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()+" - "+date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear();

                              localStorage.setItem("backup_arch_name", app._data.architecture_name);
                              localStorage.setItem("backup_arch", aux_arch);
                              localStorage.setItem("backup_asm", code_assembly);
                              localStorage.setItem("backup_date", auxDate);
                            }

                            //show error/warning
                            
                            //Change buttons status
                            this_compiling.compiling = false;

                            switch (ret.type)
                            {
                              case "error":
                                   uielto_toolbar_btngroup.methods.compile_error(ret.msg, ret.token, ret.line) ;
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

                        // Close all toast
                        app.$bvToast.hide()
                      },

                      //Show error message in the compilation
                      compile_error(msg, token, line)
                      {
                        var code_assembly_segment = code_assembly.split('\n');
                        uielto_toolbar_btngroup.methods.change_UI_mode('assembly');

                        setTimeout(function() {
                          app.$root.$emit('bv::show::modal', 'modalAssemblyError') ;

                          // line 1
                          app.modalAssemblyError.line1 = "" ;
                          app.modalAssemblyError.code1 = "" ;
                          if (line > 0) 
                          {
                            app.modalAssemblyError.line1 = line ;
                            app.modalAssemblyError.code1 = code_assembly_segment[line - 1] ;
                          }

                          // line 2
                          app.modalAssemblyError.line2 = line + 1 ;
                          app.modalAssemblyError.code2 = code_assembly_segment[line] ;

                          // line 3
                          app.modalAssemblyError.line3 = "" ;
                          app.modalAssemblyError.code3 = ""  ;
                          if (line < code_assembly_segment.length - 1) 
                          {
                            app.modalAssemblyError.line3 = line + 2 ;
                            app.modalAssemblyError.code3 = code_assembly_segment[line + 1] ;
                          }

                          app.modalAssemblyError.error = msg ;
                        },75);
                      },

                      //Remove a loaded binary
                      remove_library()
                      {
                        update_binary = "";
                        load_binary = false;
                        $("#divAssembly").attr("class", "col-lg-12 col-sm-12");
                        $("#divTags").attr("class", "col-lg-0 col-sm-0");
                        $("#divTags").attr("class", "d-none");
                      },


                      //
                      // Simulator actions
                      //

                      execution_UI_update (ret)
                      {
                        if (typeof ret === "undefined") {
                            return ;
                        }

                        for (var i=0; i<ret.draw.space.length; i++) {
                          instructions[ret.draw.space[i]]._rowVariant = '';
                        }
                        for (var i=0; i<ret.draw.success.length; i++) {
                          instructions[ret.draw.success[i]]._rowVariant = 'success';
                        }
                        for (var i=0; i<ret.draw.info.length; i++) {
                          instructions[ret.draw.info[i]]._rowVariant = 'info';
                        }
                        for (var i=0; i<ret.draw.warning.length; i++) {
                          instructions[ret.draw.warning[i]]._rowVariant = 'warning';
                        }
                        for (var i=0; i<ret.draw.danger.length; i++) {
                          instructions[ret.draw.danger[i]]._rowVariant = 'danger';
                        }

                        //Auto-scroll
                        if ((app._data.autoscroll === true) && (run_program != 1))
                        {
                          if(execution_index >= 0 && (execution_index + 4) < instructions.length)
                          {
                            var id = "#inst_table__row_" + instructions[execution_index + (parseInt(architecture.arch_conf[1].value) / 8)].Address;
                            var row_pos = $(id).position();
                            if(row_pos)
                            {
                              var pos = row_pos.top - $('.instructions_table').height();
                              $('.instructions_table').animate({scrollTop: (pos)}, 200);
                            }
                          }
                          else if(execution_index > 0 && (execution_index + 4) >= instructions.length){
                            $('.instructions_table').animate({scrollTop: ($('.instructions_table').height())}, 300);
                          }
                        }

                        if(app._data.data_mode == "stats"){
                          ApexCharts.exec('stat_plot', 'updateSeries', stats_value);
                        }

                        if(app._data.data_mode == "clk_cycles"){
                          ApexCharts.exec('clk_plot',  'updateSeries', clk_cycles_value);
                        }
                      },

                      // Reset execution
                      reset ( reset_graphic )
                      {
                        // Google Analytics
                        creator_ga('execute', 'execute.reset', 'execute.reset');

                        var draw = {
                            space:   [],
                            info:    [],
                            success: [],
                            warning: [],
                            danger:  [],
                            flash:   []
                        } ;

                        // UI: reset I/O
                        app._data.keyboard = "" ;
                        app._data.display  = "" ;
                        app._data.enter    = null ;

                        reset(reset_graphic);

                        for (var i = 0; i < instructions.length; i++) {
                          draw.space.push(i);
                        }
                        
                        draw.success = [];
                        draw.info = [];

                        // UI: set default row color...
                        for (var i = 0; i < instructions.length; i++) 
                        {
                          if (instructions[i].Label == "main") {
                            draw.success.push(i);
                          }
                        }

                        var ret = packExecute(false, null, null, draw) ;
                        this.execution_UI_update (ret);

                        // Close all toast
                        app.$bvToast.hide()
                      },

                      //Execute one instruction
                      execute_instruction ()
                      {
                        // Google Analytics
                        creator_ga('execute', 'execute.instruction', 'execute.instruction');

                        execution_mode = 0;

                        var ret = execute_instruction();

                        if (typeof ret === "undefined") {
                          console.log("Something weird happened :-S") ;
                        }

                        if (ret.msg != null) {
                          show_notification(ret.msg, ret.type);
                        }

                        if (ret.draw != null)
                        {
                          this.execution_UI_update (ret);
                        }
                      },

                      //Execute all program
                      execute_program ()
                      {
                        var ret;

                        // Google Analytics
                        creator_ga('execute', 'execute.run', 'execute.run');

                        execution_mode = 1;

                        if (run_program == 0) {
                          run_program = 1;
                        }

                        if (instructions.length === 0)
                        {
                          show_notification('No instructions in memory', 'danger') ;
                          run_program = 0;
                          return;
                        }
                        if (execution_index < -1)
                        {
                          show_notification('The program has finished', 'warning') ;
                          run_program = 0;
                          return;
                        }
                        if (execution_index == -1)
                        {
                          show_notification('The program has finished with errors', 'danger') ;
                          run_program = 0;
                          return;
                        }

                        //Change buttons status
                        this.reset_disable = true;
                        this.instruction_disable = true;
                        this.run_disable = true;
                        this.stop_disable = false;
                        app._data.main_memory_busy = true;

                        uielto_toolbar_btngroup.methods.execute_program_packed(ret, this);
                      },

                      execute_program_packed(ret,local_this)
                      {

                        for (var i=0; (i<instructions_packed) && (execution_index >= 0); i++)
                        {
                          if  ( 
                                (run_program == 0)  ||                                                  // stop button pressed
                                (run_program == 3)  ||                                                  // wait for user input at keyboard
                                ((instructions[execution_index].Break === true) && (run_program != 2))  // stop because a breakpoint
                              )
                          {
                            local_this.execution_UI_update (ret);

                            //Change buttons status
                            local_this.reset_disable = false;
                            local_this.instruction_disable = false;
                            local_this.run_disable = false;
                            local_this.stop_disable = true;
                            app._data.main_memory_busy = false;
                            
                            if (instructions[execution_index].Break === true){
                              run_program = 2; //In case breakpoint --> stop
                            }
                            return;
                          }
                          else
                          {
                            if (run_program == 2) {
                              run_program = 1;
                            }

                            ret = execute_instruction();

                            if (typeof ret === "undefined") {
                              console.log("Something weird happened :-S") ;
                              run_program = 0;

                              local_this.execution_UI_update (ret);

                              //Change buttons status
                              local_this.reset_disable = false;
                              local_this.instruction_disable = false;
                              local_this.run_disable = false;
                              local_this.stop_disable = true;
                              app._data.main_memory_busy = false;

                              return;
                            }

                            if (ret.msg != null) {
                              show_notification(ret.msg, ret.type);

                              local_this.execution_UI_update (ret);

                              //Change buttons status
                              local_this.reset_disable = false;
                              local_this.instruction_disable = false;
                              local_this.run_disable = false;
                              local_this.stop_disable = true;
                              app._data.main_memory_busy = false;
                            }
                          }
                        }

                        if(execution_index >= 0){
                          setTimeout(uielto_toolbar_btngroup.methods.execute_program_packed, 15, ret, local_this);
                        }
                        else{
                          local_this.execution_UI_update (ret);
                          //Change buttons status
                          local_this.reset_disable = false;
                          local_this.instruction_disable = false;
                          local_this.run_disable = false;
                          local_this.stop_disable = true;
                          app._data.main_memory_busy = false;
                        }
                      },

                      //Flash program
                      flash_program() 
                      {
                        
                      },

                      //Stop program excution
                      stop_execution() 
                      {
                        run_program = 0;

                        //Change buttons status
                        this.reset_disable = false;
                        this.instruction_disable = false;
                        this.run_disable = false;
                        this.stop_disable = true;
                        app._data.main_memory_busy = false;
                      },
                    },
                    
        template: '     <b-container fluid>' +
                  '       <b-row>' +
                  ' ' +
                  '         <span class="col px-0 mr-1" v-for="(item, index) in group">' +
                              button_architecture() +
                              button_assembly() +
                              button_simulator() +
                              button_save_architecture() +
                              dropdown_assembly_file() +
                              button_compile() +
                              dropdown_library() +
                              button_reset() +
                              button_instruction() +
                              button_run() +
                              button_flash() +
                              button_stop() +
                              button_examples() +
                              button_calculator() +
                              button_configuration() +
                              button_information() +
                  '         </span>' +
                  ' ' +
                  '       </b-row>' +
                  '     </b-container>'
  }

  Vue.component('toolbar-btngroup', uielto_toolbar_btngroup) ;





  function button_architecture(){
    return  '<b-dropdown class="btn btn-block menuGroup arch_btn h-100 mr-1 p-0"' +
            '            split' +
            '            v-if="item==\'btn_architecture\'"' +
            '            right' +
            '            text="Architecture"' +
            '            size="sm"' +
            '            variant="outline-secondary"' +
            '            @click="change_UI_mode(\'architecture\')">' +
            '  <b-dropdown-item v-for="item in arch_available" v-if="item.available == 1" @click="load_arch_select(item)">{{item.name}}</b-dropdown-item>' +
            '</b-dropdown>'
  }

  function button_assembly(){
    return  '<b-button v-if="item==\'btn_assembly\'" class="btn btn-block btn-outline-secondary menuGroup btn-sm assembly_btn h-100 text-truncate"' +
            '          id="assembly_btn_sim"' +
            '          @click="change_UI_mode(\'assembly\')">' +
            '  <span class="fas fa-hashtag"></span>' +
            '  Assembly' +
            '</b-button>'
  }

  function button_simulator(){
    return  '<b-button v-if="item==\'btn_simulator\'" class="btn btn-block btn-outline-secondary menuGroup btn-sm simulator_btn btn_arch h-100"' +
            '          id="sim_btn_arch"' +
            '          @click="change_UI_mode(\'simulator\')">' +
            '  <span class="fas fa-cogs"></span>' +
            '  Simulator' +
            '</b-button>'
  }

  function button_save_architecture(){
    return  '<b-button v-if="item==\'btn_save_architecture\'" class="btn btn-block btn-outline-secondary menuGroup btn-sm h-100" ' +
            '          id="save_btn_arch" ' +
            '          v-b-modal.save_architecture> ' +
            '  <span class="fas fa-download"></span> ' +
            '  Save' +
            '</b-button>'
  }

  function dropdown_assembly_file(){
    return  '<b-dropdown v-if="item==\'dropdown_assembly_file\'" right ' +
            '            text="File" ' +
            '            size="sm" ' +
            '            class="btn btn-block  menuGroup btn-sm p-0" ' +
            '            variant="outline-secondary">' +
            '  <b-dropdown-item @click="new_assembly">' +
            '    <span class="fas fa-file"></span> ' +
            '    New' +
            '  </b-dropdown-item>' +
            '  <b-dropdown-item v-b-modal.load_assembly>' +
            '    <span class="fas fa-upload"></span>' +
            '    Load' +
            '  </b-dropdown-item>' +
            '  <b-dropdown-item v-b-modal.save_assembly>' +
            '    <span class="fas fa-download"></span>' +
            '    Save' +
            '  </b-dropdown-item>' +
            '  <b-dropdown-item v-b-modal.examples>' +
            '    <span class="far fa-file-alt"></span>' +
            '    Examples' +
            '  </b-dropdown-item>' +
            '  <b-dropdown-item v-b-modal.make_uri>' +
            '    <span class="fa fa-link"></span>' +
            '    Get code as URI' +
            '  </b-dropdown-item>' +
            '</b-dropdown>'
  }

  function button_compile(){
    return  '<b-button v-if="item==\'btn_compile\'" class="btn btn-block btn-outline-secondary actionsGroup btn-sm h-100" ' +
            '          id="compile_assembly" ' +
            '          @click="assembly_compiler()">' +
            '  <span class="fas fa-sign-in-alt"></span>' +
            '  Compile/Linked' +
            ' <b-spinner small v-if="compiling" class="ml-3"></b-spinner>' +
            '</b-button>'
  }

  function dropdown_library(){
    return  '<b-dropdown v-if="item==\'dropdown_library\'" right text="Library" size="sm" class="btn btn-block menuGroup btn-sm p-0" variant="outline-secondary">' +
            '  <b-dropdown-item v-b-modal.save_binary>' +
            '    <span class="fas fa-plus-square"></span>' +
            '    Create' +
            '  </b-dropdown-item>' +
            '  <b-dropdown-item v-b-modal.load_binary>' +
            '    <span class="fas fa-upload"></span>' +
            '    Load Library' +
            '  </b-dropdown-item>' +
            '  <b-dropdown-item @click="remove_library">' +
            '    <span class="far fa-trash-alt"></span>' +
            '    Remove' +
            '  </b-dropdown-item>' +
            '</b-dropdown>'
  }

  function button_reset(){
    return  '<b-button v-if="item==\'btn_reset\'" @click="reset(true)" ' +
            '          :disabled="reset_disable"' +
            '          class="btn btn-block btn-outline-secondary actionsGroup btn-sm h-100 mr-1 text-truncate">' +
            '  <span class="fas fa-power-off"></span>' +
            '  Reset' +
            '</b-button>'
  }

  function button_instruction(){
    return  '<b-button v-if="item==\'btn_instruction\'" accesskey="a" ' +
            '          :disabled="instruction_disable"' +
            '          class="btn btn-block btn-outline-secondary actionsGroup btn-sm h-100 mr-1 text-truncate" ' +
            '          @click="execute_instruction" id="inst">' +
            '  <span class="fas fa-fast-forward"></span>' +
            '  Inst.' +
            '</b-button>' +
            '<b-tooltip v-if="item==\'btn_instruction\'" target="inst" title="Press [Alt] + A" v-if="browser==\'Chrome\'"></b-tooltip>' +
            '<b-tooltip v-if="item==\'btn_instruction\'" target="inst" title="Press [Alt] [Shift] + A" v-if="browser==\'Firefox\'"></b-tooltip>' +
            '<b-tooltip v-if="item==\'btn_instruction\'" target="inst" title="Press [Control] [Alt/Option] + A" v-if="browser==\'Mac\'"></b-tooltip>'
  }

  function button_run(){
    return  '<b-button v-if="item==\'btn_run\'" class="btn btn-block btn-outline-secondary actionsGroup btn-sm h-100 mr-1" ' +
            '          @click="execute_program" ' +
            '          :disabled="run_disable"' +
            '          id="playExecution">' +
            '  <span class="fas fa-play"></span>' +
            '  Run' +
            '</b-button>'
  }

  function button_flash(){
    return  '<b-button v-if="item==\'btn_flash\'" class="btn btn-block btn-outline-secondary actionsGroup btn-sm h-100 mr-1" ' +
            '          v-b-modal.flash ' +
            '          :disabled="run_disable">' +
            '  <span class="fa-brands fa-usb"></span>' +
            '  Flash' +
            '</b-button>'
  }

  function button_stop(){
    return  '<b-button v-if="item==\'btn_stop\'" class="btn btn-block btn-outline-secondary actionsGroup btn-sm h-100 text-truncate" ' +
            '          @click="stop_execution" ' +
            '          :disabled="stop_disable"' +
            '          id="stop_execution">' +
            '  <span class="fas fa-stop"></span>' +
            '  Stop' +
            '</b-button>'
  }

  function button_examples(){
    return  '<b-button v-if="item==\'btn_examples\'" class="btn btn-block btn-outline-secondary menuGroup btn-sm h-100 mr-1 text-truncate"' +
            '          v-b-modal.examples2>' +
            '  <span class="fas fa-file-alt"></span>' +
            '  Examples' +
            '</b-button>'
  }

  function button_calculator(){
    return  '<b-button v-if="item==\'btn_calculator\'" class="btn btn-block btn-outline-secondary menuGroup btn-sm h-100 text-truncate"' +
            '          v-b-modal.calculator>' +
            '  <span class="fas fa-calculator"></span>' +
            '  Calculator' +
            '</b-button>'
  }

  function button_configuration(){
    return  '<b-button v-if="item==\'btn_configuration\'" class="btn btn-block btn-outline-secondary menuGroup btn-sm h-100 mr-1 text-truncate" ' +
            '          id="conf_btn_sim" ' +
            '          v-b-modal.configuration>' +
            '  <span class="fa fa-cogs"></span>' +
            '  Configuration' +
            '</b-button>'
  }

  function button_information(){
    return  '<b-button v-if="item==\'btn_information\'" class="btn btn-block btn-outline-secondary btn-sm h-100 infoButton text-truncate"' +
            '          id="info">' +
            '  <span class="fas fa-info-circle"></span> ' +
            '  Info' +
            '</b-button>' + 
            ' ' +
            '<!-- Information popover -->' +
            '<popover-info target="info" show_instruction_help="true"></popover-info>'
  }
