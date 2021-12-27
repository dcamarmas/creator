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

      //Architecture bits
      number_bits: 32,


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


      
      
      /*Load architecture*/
      architecture: architecture,
      architecture_hash: architecture_hash,


      /*Advanced mode*/
      advanced_mode: true,









      /*Floating point registers*/
      simple_reg: [],
      

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
        element: '',
        co: '',
        cop: '',
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













      /*Modal pagination*/
      instructionFormPage: 1, //TODO
      instructionFormPageLink: ['#Principal', '#Fields', '#Syntax', '#Definition', '#Help'], //TODO







      





      









      























      /*Pseudoinstructions table fields*/
      pseudoinstFields: ['name', 'nwords', 'signatureRaw', 'fields', 'definition', 'actions'],
      /*Pseudoinstructions reset*/
      modalResetPseudoinst:{
        title: '',
        element: '',
      },
      /*Modals pseudoinstructions*/
      showNewPseudoinstruction: false,
      showEditPseudoinstruction: false,
      /*Edit pseudoinstruction modal*/
      modalEditPseudoinst:{
        title: '',
        element: '',
        index: 0,
      },
      /*Delete pseudoinstruction modal*/
      modalDeletPseudoinst:{
        title: '',
        element: '',
        index: 0,
      },
      /*Pseudoinstruction form*/
      formPseudoinstruction: {
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
      /* Allow instruction with fractioned fields */
      fragmentData:["inm-signed", "inm-unsigned", "address", "offset_bytes", "offset_words"], //TODO
















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

      //Memory view
      mem_representation: "data_memory",
      mem_representation_options: [
        { text: 'Data', value: 'data_memory' },
        { text: 'Text', value: 'instructions_memory' },
        { text: 'Stack', value: 'stack_memory'}
      ],

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

      /*Screen change*/
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






      //TODO: include into component
      /*Auxiliar to Load the selected architecture*/ 
      load_arch_select_aux(ename, cfg, load_associated_examples, e)
      {
        var auxArchitecture = cfg;
        architecture = register_value_deserialize(auxArchitecture);
        app._data.architecture = architecture;

        architecture_hash = [];
        for (i = 0; i < architecture.components.length; i++){
             architecture_hash.push({name: architecture.components[i].name, index: i});
             app._data.architecture_hash = architecture_hash;
        }

        backup_stack_address = architecture.memory_layout[4].value;
        backup_data_address  = architecture.memory_layout[3].value;

        app._data.architecture_name = ename;

        //$("#architecture_menu").hide();
        app.change_UI_mode('simulator');
        app.change_data_view('registers', 'int');
        app.$forceUpdate();

        if (load_associated_examples && typeof e.examples !== "undefined"){
          app.load_examples_available(e.examples[0]); //TODO if e.examples.length > 1 -> View example set selector
        }
      },


      /*Change the background of selected achitecture card TODO*/
      change_background(name, type){
        if(type == 1){
          for (var i = 0; i < back_card.length; i++){
            if(name == back_card[i].name){
              back_card[i].background = "secondary";
            }
            else{
              back_card[i].background = "default";
            }
          }
        }
        if(type == 0){
          for (var i = 0; i < back_card.length; i++){
            back_card[i].background = "default";
          }
        }
      },


      load_arch_select(e)
      {
        var i = -1;

        show_loading();
        for (i = 0; i < load_architectures.length; i++) {
             if (e.name == load_architectures[i].id) {
                 var auxArchitecture = JSON.parse(load_architectures[i].architecture);
                 app.load_arch_select_aux(e.name, auxArchitecture, true, e) ;
                 hide_loading();
                 show_notification('The selected architecture has been loaded correctly', 'success') ;

                 creator_ga('architecture', 'architecture.loading', 'architectures.loading.customized' + e.name);

                 return;
             }
        }

        $.getJSON('architecture/'+e.name+'.json' + "?v=" + new Date().getTime(), function(cfg) {
          app.load_arch_select_aux(e.name, cfg, true, e) ;
          hide_loading();
          show_notification('The selected architecture has been loaded correctly', 'success') ;

          creator_ga('architecture', 'architecture.loading', 'architectures.loading.customized');

          }).fail(function() {
            hide_loading();
            show_notification('The selected architecture is not currently available', 'info') ;
          });
      },

      /*Check if it is a new architecture*/
      default_arch(item){
        for (var i = 0; i < load_architectures_available.length; i++) {
          if(load_architectures_available[i].name == item){
            return true;
          }
        }
        return false;
      },

      /*Show remove architecture modal TODO*/
      modal_remove_cache_arch(index, elem, button){
        this.modalDeletArchIndex = index;
        this.$root.$emit('bv::show::modal', 'modalDeletArch', button);
      },

      //Load the available examples // TODO: include into components
      load_examples_available( set_name ) {
        this._data.example_loaded = new Promise(function(resolve, reject) {

          $.getJSON('examples/example_set.json' + "?v=" + new Date().getTime(), function(set) {

            // current architecture in upperCase
            var current_architecture = app._data.architecture_name.toUpperCase() ;

            // search for set_name in the example set 'set'
            for (var i=0; i<set.length; i++)
            {
              // if set_name in set[i]...
              if (set[i].id.toUpperCase() == set_name.toUpperCase())
              {
                // if current_architecture active but not the associated with set, skip
                if  ( (current_architecture != '') &&
                    (set[i].architecture.toUpperCase() != current_architecture) )
                    {
                      continue ;
                    }

                // if no current_architecture loaded then load the associated
                if (current_architecture == '') {
                  $.getJSON('architecture/'+ set[i].architecture +'.json', function(cfg) {
                    app.load_arch_select_aux(set[i].architecture,
                    cfg, false, null);
                  }) ;
                }

                // load the associate example list
                $.getJSON(set[i].url, function(cfg){
                  example_available = cfg ;
                  app._data.example_available = example_available ;
                  resolve('Example list loaded.') ;
                });

                return ;
              }
            }

            reject('Unavailable example list.') ;
          });
        }) ;
      },
      //End TODO







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

      //Change the execution mode of architecture editor
      change_mode(){
        if(app._data.advanced_mode == false){
          app._data.advanced_mode = true;
        }
        else{
          app._data.advanced_mode = false;
        }
      },
































      



























      /*Show pseudoinstruction fields modal*/
      viewFielsPseudo(elem, index, button){
        this.modalViewFields.title = "Fields of " + elem;
        this.modalViewFields.element = elem;

        this.formPseudoinstruction.name = architecture.pseudoinstructions[index].name;
        this.formPseudoinstruction.numfields = architecture.pseudoinstructions[index].fields.length;
        this.formPseudoinstruction.numfieldsAux = architecture.pseudoinstructions[index].fields.length;

        for (var j = 0; j < architecture.pseudoinstructions[index].fields.length; j++){
          this.formPseudoinstruction.nameField[j] = architecture.pseudoinstructions[index].fields[j].name;
          this.formPseudoinstruction.typeField[j] = architecture.pseudoinstructions[index].fields[j].type;
          this.formPseudoinstruction.startBitField[j] = architecture.pseudoinstructions[index].fields[j].startbit;
          this.formPseudoinstruction.stopBitField[j] = architecture.pseudoinstructions[index].fields[j].stopbit;
        }

        this.$root.$emit('bv::show::modal', 'modalViewPseudoFields', button);
      },

      /*Show reset pseudoinstructions modal*/
      resetPseudoinstModal(elem, button){
        this.modalResetPseudoinst.title = "Reset " + elem + " pseudoinstructions";
        this.modalResetPseudoinst.element = elem;
        this.$root.$emit('bv::show::modal', 'modalResetPseudoinst', button);
      },

      /*Reset pseudoinstructions*/
      resetPseudoinstructionsModal(arch){
        show_loading();

        for (var i = 0; i < load_architectures.length; i++) {
          if(arch == load_architectures[i].id){
            var auxArch = JSON.parse(load_architectures[i].architecture);
            var auxArchitecture = register_value_deserialize(auxArch);

            architecture.pseudoinstructions = auxArchitecture.pseudoinstructions;
            app._data.architecture = architecture;

            hide_loading();
            show_notification('The registers has been reset correctly', 'success') ;

            return;
          }
        }

        $.getJSON('architecture/'+arch+'.json', function(cfg){
          var auxArchitecture = cfg;

          var auxArchitecture2 = register_value_deserialize(auxArchitecture);
          architecture.pseudoinstructions = auxArchitecture2.pseudoinstructions;

          app._data.architecture = architecture;

          hide_loading();
          show_notification('The pseudoinstruction set has been reset correctly', 'success') ;
        });
      },

      /*Check all fields of new pseudoinstruction*/
      newPseudoinstVerify(evt){
        evt.preventDefault();

        for (var i = 0; i < this.formPseudoinstruction.nameField.length; i++){
          for (var j = i + 1; j < this.formPseudoinstruction.nameField.length; j++){
            if (this.formPseudoinstruction.nameField[i] == this.formPseudoinstruction.nameField[j]){
              show_notification('Field name repeated', 'danger') ;
              return;
            }
          }
        }

        var vacio = 0;

        for (var i = 0; i < this.formPseudoinstruction.numfields; i++) {
          if(this.formPseudoinstruction.nameField.length <  this.formPseudoinstruction.numfields || this.formPseudoinstruction.typeField.length <  this.formPseudoinstruction.numfields || this.formPseudoinstruction.startBitField.length <  this.formPseudoinstruction.numfields || this.formPseudoinstruction.stopBitField.length <  this.formPseudoinstruction.numfields){
            vacio = 1;
          }
        }

        var result = this.pseudoDefValidator(this.formPseudoinstruction.name, this.formPseudoinstruction.definition, this.formPseudoinstruction.nameField);

        if(result == -1){
          return;
        }

        if (!this.formPseudoinstruction.name || !this.formPseudoinstruction.nwords || !this.formPseudoinstruction.numfields || !this.formPseudoinstruction.signature_definition || !this.formPseudoinstruction.definition || vacio == 1) {
          show_notification('Please complete all fields', 'danger') ;
        }
        else {
          this.newPseudoinstruction();
        }
      },

      /*Create a new pseudoinstruction*/
      newPseudoinstruction(){
        this.showNewPseudoinstruction = false;

        this.generateSignaturePseudo();

        var signature = this.formPseudoinstruction.signature;
        var signatureRaw = this.formPseudoinstruction.signatureRaw;

        var newPseudoinstruction = {name: this.formPseudoinstruction.name, signature_definition: this.formPseudoinstruction.signature_definition, signature: signature, signatureRaw: signatureRaw, nwords: this.formPseudoinstruction.nwords , fields: [], definition: this.formPseudoinstruction.definition, help: this.formPseudoinstruction.help};
        architecture.pseudoinstructions.push(newPseudoinstruction);

        for (var i = 0; i < this.formPseudoinstruction.numfields; i++) {
          var newField = {name: this.formPseudoinstruction.nameField[i], type: this.formPseudoinstruction.typeField[i], startbit: this.formPseudoinstruction.startBitField[i], stopbit: this.formPseudoinstruction.stopBitField[i]};
          architecture.pseudoinstructions[architecture.pseudoinstructions.length-1].fields.push(newField);
        }
      },

      /*Show edit pseudoinstruction modal*/
      editPseudoinstModal(elem, index, button){
        this.modalEditPseudoinst.title = "Edit Pseudoinstruction";
        this.modalEditPseudoinst.element = elem;
        this.modalEditPseudoinst.index = index;

        this.formPseudoinstruction.name = architecture.pseudoinstructions[index].name;
        this.formPseudoinstruction.nwords = architecture.pseudoinstructions[index].nwords;
        this.formPseudoinstruction.numfields = architecture.pseudoinstructions[index].fields.length;
        this.formPseudoinstruction.numfieldsAux = architecture.pseudoinstructions[index].fields.length;
        this.formPseudoinstruction.signature_definition = architecture.pseudoinstructions[index].signature_definition;
        this.formPseudoinstruction.definition = architecture.pseudoinstructions[index].definition;
        this.formPseudoinstruction.help = architecture.pseudoinstructions[index].help;

        for (var j = 0; j < architecture.pseudoinstructions[index].fields.length; j++) {
          this.formPseudoinstruction.nameField[j] = architecture.pseudoinstructions[index].fields[j].name;
          this.formPseudoinstruction.typeField[j] = architecture.pseudoinstructions[index].fields[j].type;
          this.formPseudoinstruction.startBitField[j] = architecture.pseudoinstructions[index].fields[j].startbit;
          this.formPseudoinstruction.stopBitField[j] = architecture.pseudoinstructions[index].fields[j].stopbit;
        }

        this.generateSignaturePseudo();

        this.$root.$emit('bv::show::modal', 'modalEditPseudoinst', button);
      },

      /*Check all fields of modify pseudoinstruction*/
      editPseudoinstVerify(evt, inst, index){
        evt.preventDefault();

        for (var i = 0; i < this.formPseudoinstruction.nameField.length; i++){
          for (var j = i + 1; j < this.formPseudoinstruction.nameField.length; j++){
            if (this.formPseudoinstruction.nameField[i] == this.formPseudoinstruction.nameField[j]){
              show_notification('Field name repeated', 'danger') ;
              return;
            }
          }
        }

        var vacio = 0;

        for (var i = 0; i < this.formPseudoinstruction.numfields; i++) {
          if(!this.formPseudoinstruction.nameField[i] || !this.formPseudoinstruction.typeField[i] || (!this.formPseudoinstruction.startBitField[i] && this.formPseudoinstruction.startBitField[i] != 0) || (!this.formPseudoinstruction.stopBitField[i] && this.formPseudoinstruction.stopBitField[i] != 0)){
            vacio = 1;
          }
        }

        var result = this.pseudoDefValidator(inst, this.formPseudoinstruction.definition, this.formPseudoinstruction.nameField);

        if(result == -1){
          return;
        }

        if (!this.formPseudoinstruction.name || !this.formPseudoinstruction.nwords || !this.formPseudoinstruction.numfields || !this.formPseudoinstruction.signature_definition || !this.formPseudoinstruction.definition || vacio == 1) {
          show_notification('Please complete all fields', 'danger') ;
        }
        else {
          this.editPseudoinstruction(inst, index);
        }
      },

      /*Edit the pseudoinstruction*/
      editPseudoinstruction(comp, index){

        this.showEditPseudoinstruction = false;

        architecture.pseudoinstructions[index].name = this.formPseudoinstruction.name;
        architecture.pseudoinstructions[index].nwords = this.formPseudoinstruction.nwords;
        architecture.pseudoinstructions[index].definition = this.formPseudoinstruction.definition;
        architecture.pseudoinstructions[index].signature_definition = this.formPseudoinstruction.signature_definition;
        architecture.pseudoinstructions[index].help = this.formPseudoinstruction.help;

        for (var j = 0; j < this.formPseudoinstruction.numfields; j++){
          if(j < architecture.pseudoinstructions[index].fields.length){
            architecture.pseudoinstructions[index].fields[j].name = this.formPseudoinstruction.nameField[j];
            architecture.pseudoinstructions[index].fields[j].type = this.formPseudoinstruction.typeField[j];
            architecture.pseudoinstructions[index].fields[j].startbit = this.formPseudoinstruction.startBitField[j];
            architecture.pseudoinstructions[index].fields[j].stopbit = this.formPseudoinstruction.stopBitField[j];
          }
          else{
            var newField = {name: this.formPseudoinstruction.nameField[j], type: this.formPseudoinstruction.typeField[j], startbit: this.formPseudoinstruction.startBitField[j], stopbit: this.formPseudoinstruction.stopBitField[j]};
            architecture.pseudoinstructions[index].fields.push(newField);
          }
        }

        this.generateSignaturePseudo();

        var signature = this.formPseudoinstruction.signature;
        var signatureRaw = this.formPseudoinstruction.signatureRaw;

        architecture.pseudoinstructions[index].signature = signature;
        architecture.pseudoinstructions[index].signatureRaw = signatureRaw;

        if(architecture.pseudoinstructions[index].fields.length > this.formPseudoinstruction.numfields){
          architecture.pseudoinstructions[index].fields.splice(this.formPseudoinstruction.numfields, (architecture.pseudoinstructions[i].fields.length - this.formPseudoinstruction.numfields));
        }
      },

      /*Show delete pseudoinstruction modal*/
      delPseudoinstModal(elem, index, button){
        this.modalDeletPseudoinst.title = "Delete Pseudointruction";
        this.modalDeletPseudoinst.element = elem;
        this.modalDeletPseudoinst.index = index;
        this.$root.$emit('bv::show::modal', 'modalDeletPseudoinst', button);
      },

      /*Delete the pseudoinstruction*/
      delPseudoinstruction(index){
        architecture.pseudoinstructions.splice(index,1);
      },

      /*Verify the pseudoinstruction definition*/
      pseudoDefValidator(name, definition, fields){
        var re = new RegExp("^\n+");
        definition = definition.replace(re, "");

        re = new RegExp("\n+", "g");
        definition = definition.replace(re, "");

        var newDefinition = definition;

        re = /{([^}]*)}/g;

        var code = re.exec(definition);

        if(code != null)
  {
          while(code != null)
    {
            console_log(code)
            var instructions = code[1].split(";");
            if (instructions.length == 1){
                show_notification('Enter a ";" at the end of each line of code', 'danger') ;
                return -1;
            }

            for (var j = 0; j < instructions.length-1; j++){
              var re = new RegExp("^ +");
              instructions[j] = instructions[j].replace(re, "");

              re = new RegExp(" +", "g");
              instructions[j] = instructions[j].replace(re, " ");

              var instructionParts = instructions[j].split(" ");

              var found = false;
              for (var i = 0; i < architecture.instructions.length; i++){
                if(architecture.instructions[i].name == instructionParts[0]){
                  found = true;
                  var numFields = 0;
                  var regId = 0;

                  signatureDef = architecture.instructions[i].signature_definition;
                  signatureDef = signatureDef.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                  re = new RegExp("[fF][0-9]+", "g");
                  signatureDef = signatureDef.replace(re, "(.*?)");

                  console_log(instructions[j])

                  re = new RegExp(signatureDef+"$");
                  if(instructions[j].search(re) == -1){
                    show_notification('Incorrect signature --> ' + architecture.instructions[i].signatureRaw, 'danger') ;
                    return -1;
                  }

                  re = new RegExp(signatureDef+"$");
                  var match = re.exec(instructions[j]);
                  var instructionParts = [];
                  for(var z = 1; z < match.length; z++){
                    instructionParts.push(match[z]);
                  }

                  re = new RegExp(",", "g");
                  var signature = architecture.instructions[i].signature.replace(re, " ");

                  re = new RegExp(signatureDef+"$");
                  var match = re.exec(signature);
                  var signatureParts = [];
                  for(var j = 1; j < match.length; j++){
                    signatureParts.push(match[j]);
                  }

                  console_log(instructionParts)
                  console_log(signatureParts)

                  for (var z = 1; z < signatureParts.length; z++){

                    if(signatureParts[z] == "INT-Reg" || signatureParts[z] == "SFP-Reg" || signatureParts[z] == "DFP-Reg" ||signatureParts[z] == "Ctrl-Reg"){
                      console_log("REG")
                      var found = false;

                      var id = -1;
                      re = new RegExp("R[0-9]+");
                      console_log(z)
                      if(instructionParts[z].search(re) != -1){
                        re = new RegExp("R(.*?)$");
                        match = re.exec(instructionParts[z]);
                        id = match[1];
                      }

                      for (var a = 0; a < architecture.components.length; a++){
                        for (var b = 0; b < architecture.components[a].elements.length; b++){
                          if(architecture.components[a].elements[b].name == instructionParts[z]){
                            found = true;
                          }
                          if(architecture.components[a].type == "integer" && regId == id){
                            found = true;
                          }
                          if(architecture.components[a].type == "integer"){
                            regId++;
                          }
                        }
                      }

                      for (var b = 0; b < fields.length; b++){
                        if(fields[b] == instructionParts[z]){
                          found = true;
                        }
                      }

                      if(!found){
                        show_notification('Register ' + instructionParts[z] + ' not found', 'danger') ;
                        return -1;
                      }
                    }

                    if(signatureParts[z] == "inm-signed" || signatureParts[z] == "inm-unsigned" || signatureParts[z] == "offset_bytes" || signatureParts[z] == "offset_words"){
                      var fieldsLength = architecture.instructions[i].fields[z].startbit - architecture.instructions[i].fields[z].stopbit + 1;
                      if(instructionParts[z].match(/^0x/)){
                        var value = instructionParts[z].split("x");
                        if (isNaN(parseInt(instructionParts[z], 16)) == true){
                            show_notification("Immediate number " + instructionParts[z] + " is not valid", 'danger') ;
                            return -1;
                        }

                        if(value[1].length*4 > fieldsLength){
                          show_notification("Immediate number " + instructionParts[z] + " is too big", 'danger') ;
                          return -1;
                        }
                      }
                      else if (instructionParts[z].match(/^(\d)+\.(\d)+/)){
                        if(isNaN(parseFloat(instructionParts[z])) == true){
                          show_notification("Immediate number " + instructionParts[z] + " is not valid", 'danger') ;
                          return -1;
                        }

                        if(this.float2bin(parseFloat(instructionParts[z])).length > fieldsLength){
                          show_notification("Immediate number " + instructionParts[z] + " is too big", 'danger') ;
                          return -1;
                        }
                      }
                      else if(isNaN(parseInt(instructionParts[z]))){

                      }
                      else {
                        var numAux = parseInt(instructionParts[z], 10);
                        if(isNaN(parseInt(instructionParts[z])) == true){
                          show_notification("Immediate number " + instructionParts[z] + " is not valid", 'danger') ;
                          return -1;
                        }

                        /*if((numAux.toString(2)).length > fieldsLength){
                          show_notification("Immediate number " + instructionParts[z] + " is too big", 'danger') ;
                          return -1;
                        }*/

                        var comNumPos = Math.pow(2, fieldsLength-1);
                        var comNumNeg = comNumPos * (-1);
                        comNumPos = comNumPos -1;

                        console_log(comNumPos);
                        console_log(comNumNeg);

                        if(parseInt(instructionParts[z], 10) > comNumPos || parseInt(instructionParts[z], 10) < comNumNeg){
                          show_notification("Immediate number " + instructionParts[z] + " is too big", 'danger') ;
                          return -1;
                        }
                      }
                    }

                    if(signatureParts[z] == "address"){
                      var fieldsLength = architecture.instructions[i].fields[z].startbit - architecture.instructions[i].fields[z].stopbit + 1;
                      if(instructionParts[z].match(/^0x/)){
                        var value = instructionParts[z].split("x");
                        if(isNaN(parseInt(instructionParts[z], 16)) == true){
                          show_notification("Address " + instructionParts[z] + " is not valid", 'danger') ;
                          return -1;
                        }

                        if(value[1].length*4 > fieldsLength){
                          show_notification("Address " + instructionParts[z] + " is too big", 'danger') ;
                          return -1;
                        }
                      }
                    }

                    if(!found){
                      show_notification('Register ' + instructionParts[z] + ' not found', 'danger') ;
                      return -1;
                    }
                  }
                }
              }
              if(!found){
                show_notification('Instruction ' + instructions[j] + ' do not exists', 'danger') ;
                return -1;
              }
            }

            definition = definition.replace(code[0], "");

            re = /{([^}]*)}/g;
            code = re.exec(definition);
          }
        }
        else{
          var instructions = definition.split(";");
          console_log(instructions.length)
          if(instructions.length == 1){
            show_notification('Enter a ";" at the end of each line of code', 'danger') ;
            return -1;
          }

          for (var j = 0; j < instructions.length-1; j++){
            var re = new RegExp("^ +");
            instructions[j] = instructions[j].replace(re, "");

            re = new RegExp(" +", "g");
            instructions[j] = instructions[j].replace(re, " ");

            var instructionParts = instructions[j].split(" ");

            var found = false;
            for (var i = 0; i < architecture.instructions.length; i++){
              if(architecture.instructions[i].name == instructionParts[0]){
                found = true;
                var numFields = 0;
                var regId = 0;

                signatureDef = architecture.instructions[i].signature_definition;
                signatureDef = signatureDef.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                re = new RegExp("[fF][0-9]+", "g");
                signatureDef = signatureDef.replace(re, "(.*?)");

                console_log(instructions[j])

                re = new RegExp(signatureDef+"$");
                if(instructions[j].search(re) == -1){
                  show_notification('Incorrect signature --> ' + architecture.instructions[i].signatureRaw, 'danger') ;
                  return -1;
                }

                re = new RegExp(signatureDef+"$");
                var match = re.exec(instructions[j]);
                var instructionParts = [];
                for(var z = 1; z < match.length; z++){
                  instructionParts.push(match[z]);
                }

                re = new RegExp(",", "g");
                var signature = architecture.instructions[i].signature.replace(re, " ");

                re = new RegExp(signatureDef+"$");
                var match = re.exec(signature);
                var signatureParts = [];
                for(var j = 1; j < match.length; j++){
                  signatureParts.push(match[j]);
                }

                console_log(instructionParts)
                console_log(signatureParts)

                for (var z = 1; z < signatureParts.length; z++){

                  if(signatureParts[z] == "INT-Reg" || signatureParts[z] == "SFP-Reg" || signatureParts[z] == "DFP-Reg" ||signatureParts[z] == "Ctrl-Reg"){
                    console_log("REG")
                    var found = false;

                    var id = -1;
                    re = new RegExp("R[0-9]+");
                    console_log(z)
                    if(instructionParts[z].search(re) != -1){
                      re = new RegExp("R(.*?)$");
                      match = re.exec(instructionParts[z]);
                      id = match[1];
                    }

                    for (var a = 0; a < architecture.components.length; a++){
                      for (var b = 0; b < architecture.components[a].elements.length; b++){
                        if(architecture.components[a].elements[b].name == instructionParts[z]){
                          found = true;
                        }
                        if(architecture.components[a].type == "integer" && regId == id){
                          found = true;
                        }
                        if(architecture.components[a].type == "integer"){
                          regId++;
                        }
                      }
                    }

                    for (var b = 0; b < fields.length; b++){
                      if(fields[b] == instructionParts[z]){
                        found = true;
                      }
                    }

                    if(!found){
                      show_notification('Register ' + instructionParts[z] + ' not found', 'danger') ;
                      return -1;
                    }
                  }

                  if(signatureParts[z] == "inm-signed" || signatureParts[z] == "inm-unsigned" || signatureParts[z] == "offset_bytes" || signatureParts[z] == "offset_words"){
                    var fieldsLength = architecture.instructions[i].fields[z].startbit - architecture.instructions[i].fields[z].stopbit + 1;
                    if(instructionParts[z].match(/^0x/)){
                      var value = instructionParts[z].split("x");
                      if(isNaN(parseInt(instructionParts[z], 16)) == true){
                        show_notification("Immediate number " + instructionParts[z] + " is not valid", 'danger') ;
                        return -1;
                      }

                      if(value[1].length*4 > fieldsLength){
                        show_notification("Immediate number " + instructionParts[z] + " is too big", 'danger') ;
                        return -1;
                      }
                    }
                    else if (instructionParts[z].match(/^(\d)+\.(\d)+/)){
                      if(isNaN(parseFloat(instructionParts[z])) == true){
                        show_notification("Immediate number " + instructionParts[z] + " is not valid", 'danger') ;
                        return -1;
                      }

                      if(this.float2bin(parseFloat(instructionParts[z])).length > fieldsLength){
                        show_notification("Immediate number " + instructionParts[z] + " is too big", 'danger') ;
                        return -1;
                      }
                    }
                    else if(isNaN(parseInt(instructionParts[z]))){

                    }
                    else {
                      var numAux = parseInt(instructionParts[z], 10);
                      if(isNaN(parseInt(instructionParts[z])) == true){
                        show_notification("Immediate number " + instructionParts[z] + " is not valid", 'danger') ;
                        return -1;
                      }

                      /*if((numAux.toString(2)).length > fieldsLength){
                        show_notification("Immediate number " + instructionParts[z] + " is too big", 'danger') ;
                        return -1;
                      }*/

                      var comNumPos = Math.pow(2, fieldsLength-1);
                      var comNumNeg = comNumPos * (-1);
                      comNumPos = comNumPos -1;

                      console_log(comNumPos);
                      console_log(comNumNeg);

                      if(parseInt(instructionParts[z], 10) > comNumPos || parseInt(instructionParts[z], 10) < comNumNeg){
                        show_notification("Immediate number " + instructionParts[z] + " is too big", 'danger') ;
                        return -1;
                      }
                    }
                  }

                  if(signatureParts[z] == "address"){
                    var fieldsLength = architecture.instructions[i].fields[z].startbit - architecture.instructions[i].fields[z].stopbit + 1;
                    if(instructionParts[z].match(/^0x/)){
                      var value = instructionParts[z].split("x");
                      if(isNaN(parseInt(instructionParts[z], 16)) == true){
                        show_notification("Address " + instructionParts[z] + " is not valid", 'danger') ;
                        return -1;
                      }

                      if(value[1].length*4 > fieldsLength){
                        show_notification("Address " + instructionParts[z] + " is too big", 'danger') ;
                        return -1;
                      }
                    }
                  }

                  if(!found){
                    show_notification('Register ' + instructionParts[z] + ' not found', 'danger') ;
                    return -1;
                  }
                }
              }
            }
            if(!found){
              show_notification('Instruction ' + instructions[j] + ' do not exists', 'danger') ;
              return -1;
            }
          }
        }

        return 0;
      },

      /*Generate the pseudoinstruction signature*/
      generateSignaturePseudo(){
        var signature = this.formPseudoinstruction.signature_definition;

        var re = new RegExp("^ +");
        this.formPseudoinstruction.signature_definition = this.formPseudoinstruction.signature_definition.replace(re, "");

        re = new RegExp(" +", "g");
        this.formPseudoinstruction.signature_definition = this.formPseudoinstruction.signature_definition.replace(re, " ");

        re = new RegExp("^ +");
        signature= signature.replace(re, "");

        re = new RegExp(" +", "g");
        signature = signature.replace(re, " ");

        for (var z = 0; z < this.formPseudoinstruction.numfields; z++) {
          re = new RegExp("[Ff]"+z, "g");

          signature = signature.replace(re, this.formPseudoinstruction.typeField[z]);
        }

        re = new RegExp(" ", "g");
        signature = signature.replace(re , ",");

        var signatureRaw = this.formPseudoinstruction.signature_definition;

        re = new RegExp("^ +");
        signatureRaw= signatureRaw.replace(re, "");

        re = new RegExp(" +", "g");
        signatureRaw = signatureRaw.replace(re, " ");

        for (var z = 0; z < this.formPseudoinstruction.numfields; z++) {
          re = new RegExp("[Ff]"+z, "g");

          signatureRaw = signatureRaw.replace(re, this.formPseudoinstruction.nameField[z]);
        }

        this.formPseudoinstruction.signature = signature;
        this.formPseudoinstruction.signatureRaw = signatureRaw;
      },

      /*Empty pseudoinstruction form*/
      emptyFormPseudo(){
        this.formPseudoinstruction.name = '';
        this.formPseudoinstruction.nwords = 1;
        this.formPseudoinstruction.numfields = "0";
        this.formPseudoinstruction.numfields = "0";
        this.formPseudoinstruction.nameField = [];
        this.formPseudoinstruction.typeField = [];
        this.formPseudoinstruction.startBitField = [];
        this.formPseudoinstruction.stopBitField = [];
        this.formPseudoinstruction.signature ='';
        this.formPseudoinstruction.signatureRaw = '';
        this.formPseudoinstruction.signature_definition = '';
        this.formPseudoinstruction.definition = '';
        this.formPseudoinstruction.help = '';
        this.instructionFormPage = 1;
      },

      /*Pagination bar names*/
      linkGen (pageNum) { //TODO
        return this.instructionFormPageLink[pageNum - 1]
      },

      pageGen (pageNum) { //TODO
        return this.instructionFormPageLink[pageNum - 1].slice(1)
      },



















      















      /*Form validator*/ //TODO:include into components
      valid(value){
        if(parseInt(value) != 0){
          if(!value){
            return false;
          }
          else{
            return true;
          }
        }
        else{
          return true;
        }
      },

      















































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

      /* Reset execution */
      reset ( reset_graphic )
      {
        /* Google Analytics */
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

          /*Auto-scroll*/
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

          /*Reset graphic*/
          if(reset_graphic == true && app._data.data_mode == "stats"){
            ApexCharts.exec('graphic', 'updateSeries', stats_value);
          }

          hide_loading();

        }, 25);

      },

      //Execute one instruction
      executeInstruction ( )
      {
        // Google Analytics
        creator_ga('execute', 'execute.instruction', 'execute.instruction');

        var ret = executeInstruction();
        // console.log(JSON.stringify(ret,2,null));

        if (typeof ret === "undefined") {
          console.log("AQUI hemos llegado y un poema se ha encontrado...") ;
        }

        if (ret.msg != null) {
          show_notification(ret.msg, ret.type);
        }

        if (ret.draw != null)
        {
          for (var i=0; i<ret.draw.space.length; i++) {
            instructions[ret.draw.space[i]]._rowVariant = '';
          }
          for (var i=0; i<ret.draw.success.length; i++) {
            instructions[ret.draw.success[i]]._rowVariant = 'success';
          }
          for (var i=0; i<ret.draw.info.length; i++) {
            instructions[ret.draw.info[i]]._rowVariant = 'info';
          }
          for (var i=0; i<ret.draw.danger.length; i++) {
            instructions[ret.draw.danger[i]]._rowVariant = 'danger';
          }

          //Auto-scroll
          if(app._data.autoscroll == true && runProgram == false){
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
          }

          if(app._data.data_mode == "stats"){
            ApexCharts.exec('graphic', 'updateSeries', stats_value);
          }
          return ;
         }
      },

      /*Execute all program*/
      executeProgram ( but )
      {
        /* Google Analytics */
        creator_ga('execute', 'execute.run', 'execute.run');

        app._data.runExecution = true;
        app._data.runExecution = false;
        runProgram=true;

        if (instructions.length == 0)
        {
            show_notification('No instructions in memory', 'danger') ;
            runProgram=false;
            return;
        }
        if (executionIndex < -1)
        {
            show_notification('The program has finished', 'warning') ;
            runProgram=false;
            return;
        }
        if (executionIndex == -1)
        {
            show_notification('The program has finished with errors', 'danger') ;
            runProgram=false;
            return;
        }

        $("#stopExecution").show();
        $("#playExecution").hide();

        this.programExecutionInst(but);
      },

      programExecutionInst(but)
      {
        for (var i=0; (i<app._data.instructionsPacked) && (executionIndex >= 0); i++)
        {
          if(mutexRead == true){
            iter1 = 1;
            $("#stopExecution").hide();
            $("#playExecution").show();
            runProgram=false;
            return;
          }
          else if(instructions[executionIndex].Break == true && iter1 == 0){
            iter1 = 1;
            $("#stopExecution").hide();
            $("#playExecution").show();
            runProgram=false;
            return;
          }
          else if(this.runExecution == true){
            app._data.runExecution = false;
            iter1 = 1;
            $("#stopExecution").hide();
            $("#playExecution").show();
            runProgram=false;
            return;
          }
          else if(but == true && i == 0){
            app._data.resetBut = false;
          }
          else if(this.resetBut == true){
            app._data.resetBut = false;

            $("#stopExecution").hide();
            $("#playExecution").show();
            runProgram=false;
            return;
          }
          else{
            this.executeInstruction();
            iter1 = 0;
          }
        }

        if(executionIndex >= 0){
          setTimeout(this.programExecutionInst, 15);
        }
        else{
          $("#stopExecution").hide();
          $("#playExecution").show();
        }
      },

      /*Stop program excution*/
      stopExecution() {
        app._data.runExecution = true;
      },

      /*Exception Notification*/
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

        if(e == "registers"){
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
          app._data.data_mode = e;
        }

        app.$forceUpdate();

        // Google Analytics
        creator_ga('data', 'data.view', 'data.view.' + app._data.data_mode);
      },


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


      /*Stop user interface refresh*/
      debounce: _.debounce(function (param, e) {
        console_log(param);
        console_log(e);

        e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        var re = new RegExp("'","g");
        e = e.replace(re, '"');
        re = new RegExp("[\f]","g");
        e = e.replace(re, '\\f');
        re = new RegExp("[\n\]","g");
        e = e.replace(re, '\\n');
        re = new RegExp("[\r]","g");
        e = e.replace(re, '\\r');
        re = new RegExp("[\t]","g");
        e = e.replace(re, '\\t');
        re = new RegExp("[\v]","g");
        e = e.replace(re, '\\v');

        if(e == ""){
          this[param] = null;
          return;
        }

        console_log("this." + param + "= '" + e + "'");

        eval("this." + param + "= '" + e + "'");

        //this[param] = e.toString();
        app.$forceUpdate();
      }, getDebounceTime())

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

  /*Determines the refresh timeout depending on the device being used*/
  function getDebounceTime(){
    if(screen.width > 768){
      return 500;
    }
    else{
      return 1000;
    }
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

