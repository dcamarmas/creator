/*Listado de arquitecturas disponibles*/
var architecture_available = [];
/*Listado de set de instrucciones disponibles*/
var instruction_set_available =[];

/*tabla hash de la arquitectura*/
var architecture_hash = [];
/*Arquitectura cargada*/
var architecture = {components:[
  /*{name: "Integer control registers", type: "integer", elements:[
    {name:"PC", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    {name:"EPC", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    {name:"CAUSE", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    {name:"BADVADDR", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    {name:"STATUS", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    {name:"HI", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    {name:"LO", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
  ]},
  {name: "Integer registers", type: "integer", elements:[
    {name:"R0", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    {name:"R1", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    {name:"R2", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    {name:"R3", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    {name:"R4", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    {name:"R5", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    {name:"R6", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    {name:"R7", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    {name:"R8", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    {name:"R9", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    {name:"R10", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    {name:"R11", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    {name:"R12", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    {name:"R13", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    {name:"R14", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    {name:"R15", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    {name:"R16", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    {name:"R17", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    {name:"R18", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    {name:"R19", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    {name:"R20", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    {name:"R21", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    {name:"R22", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    {name:"R23", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    {name:"R24", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    {name:"R25", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    {name:"R26", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    {name:"R27", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    {name:"R28", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    {name:"R29", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    {name:"R30", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    {name:"R31", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
  ]},
  {name: "Floating point control registers", type: "integer", elements:[
    {name:"FIR", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    {name:"FCSR", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    {name:"FCCR", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    {name:"FEXR", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
  ]},
  {name: "Simple floating point registers",type: "floating point", elements:[
    {name:"FG0", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FG1", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FG2", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FG3", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FG4", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FG5", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FG6", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FG7", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FG8", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FG9", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FG10", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FG11", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FG12", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FG13", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FG14", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FG15", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FG16", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FG17", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FG18", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FG19", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FG20", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FG21", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FG22", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FG23", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FG24", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FG25", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FG26", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FG27", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FG28", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FG29", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FG30", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FG31", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
  ]},
  {name: "Double floating point registers", type: "floatin point", elements:[
    {name:"FP0", nbits:"64", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FP2", nbits:"64", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FP4", nbits:"64", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FP6", nbits:"64", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FP8", nbits:"64", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FP10", nbits:"64", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FP12", nbits:"64", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FP14", nbits:"64", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FP16", nbits:"64", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FP18", nbits:"64", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FP20", nbits:"64", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FP22", nbits:"64", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FP24", nbits:"64", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FP26", nbits:"64", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FP28", nbits:"64", value:0.0, default_value:0.0, properties: ["read", "write"]},
    {name:"FP30", nbits:"64", value:0.0, default_value:0.0, properties: ["read", "write"]},
  ]}*/
], instructions:[
  
]};

var componentsTypes = [
  { text: 'Integer', value: 'integer' },
  { text: 'Floating point', value: 'floating point' },
]

/*tabla hash y instrucciones disponibles*/
var instruction_set_hash = [];
var instruction_set = {firmware: []};

var memory = [
  { Address: "0x01003-0x01000", Binary: "61 65 6c 50", Tag: 'a', Value: null },
  { Address: "0x01007-0x01004", Binary: "61 65 6c 50", Tag: 'b', Value: 30 },
  { Address: "0x0100b-0x01008", Binary: "61 65 6c 50", Tag: 'msg', Value: "hello wold" },
  { Address: "0x0100f-0x0100c", Binary: "61 65 6c 50", Tag: 'msg2', Value: "Please, press letter '0' to end the 'echo' effect" },
]

var  instructions = [
  { Break: null, Address: "0x8000", Label:"" , Pseudo: "pr R0 R1 R2", Assebly: "pr R0 R1 R2" },
  { Break: null, Address: "0x8000", Label:"" , Pseudo: "pr R3 R0 R2", Assebly: "pr R3 R0 R2" }
]

var executionIndex = 0;

/*Variables que almacenan el codigo introducido*/
var code_assembly = '';

function destroyClickedElement(event) {
  document.body.removeChild(event.target);
}

function binaryStringToInt( b ) {
    return parseInt(b, 2);
}

window.app = new Vue({
  el: "#app",
  data: {

    /*ALERTA*/
    alertMessaje: '',
    type: '',
    dismissSecs: 3,
    dismissCountDown: 0,

    /*PAGINA CARGA ARQUITECTURA*/
    /*Configuraciones Disponibles*/
    arch_available: architecture_available,
    /*Nombre del fichero a cargar*/
    load_arch: '',
    /*Nombre del fichero a guardar*/
    name_arch_save: '',
    /*Numero de bits de la arquitectura*/
    number_bits: 0,
    /*Definicion de posiciones:
     * 0- Components
     * 1- reg_int_contr
     * 2- reg_int
     * 3- reg_fp_contr
     * 4- reg_fp_single
     * 5- reg_fp_double
     */
    architecture: architecture,
    /*Tabla hash arquitectura*/
    architecture_hash: architecture_hash,
    /*Campos de la tabla de componentes*/
    fields: ['name', 'nbits', 'value', 'default_value', 'properties', 'actions'],
    /*Edicion de la arquitectura*/
    formArchitecture: {
      name: '',
      type: '',
      defValue: '',
      properties: [],
    },
    /*Borrado de un componente*/
    modalDeletComp:{
      title: '',
      element: '',
    },
    /*Edicion de un elemento*/
    modalEditElement:{
      title: '',
      element: '',
    },
    /*Borrado de un elemento*/
    modalDeletElement:{
      title: '',
      element: '',
    },
    /*Nombre de la arquitectura*/
    architecture_name: '',

    

    /*PAGINA DE CARGA INSTRUCCIONES*/
    /*Definicion del ensamblador*/
    ins_set_available: instruction_set_available,
    /*Nombre del fichero a cargar*/
    load_assDef: '',
    /*Nombre del fichero a guardar*/
    name_assDef_save: '',
    /*Instrucciones definidas*/
    instruction_set: instruction_set,
    /*hash de las instrucciones definidas*/
    instruction_set_hash: instruction_set_hash,
    /*Listado de tipos de componentes*/
    componentsTypes:componentsTypes,
    /*Edicion de las instrucciones*/
    formInstruction: {
      name: '',
      cop: '',
      signature: '',
      definition: '',
    },

    /*CARGA Y LECTURA ENSAMBLADOR*/
    /*Variables donde se guardan los contenidos de los textarea*/
    text_assembly: code_assembly,
    /*Variables donde se guardan los ficheros cargados*/
    load_assembly: '',
    /*Variables donde se guardan los nombre de los ficheros guardados*/
    save_assembly: '',

    /*PAGINA SIMULADOR*/
    /*Nuevo valor del registro*/
    newValue: '',
    
    /*Asignacion de valores de la tabla de memoria*/
    memory: memory,
    /*Asignacion de valores de la tabla de instrucciones*/
    instructions: instructions,

  },
  computed: {
    
  },
  methods:{
    /*ALERTA*/
    countDownChanged (dismissCountDown) {
      this.dismissCountDown = dismissCountDown;
    },

    /*PAGINA CARGA ARQUITECTURA*/
    /*Carga las arquitecturas que hay disponibles*/
    load_arch_available(){
      $.getJSON('architecture/available_arch.json', function(cfg){
        architecture_available = cfg;
        app._data.arch_available = cfg;
      })
    },

    /*Carga la arquitectura seleccionada*/
    load_arch_select(e){
      $.getJSON('architecture/'+e+'.json', function(cfg){
        architecture = cfg;
        app._data.architecture = architecture;

        /*PREGUNTAR*/
        architecture_hash = [];
        for (var i = 0; i < architecture.components.length; i++) {
          architecture_hash.push({name: architecture.components[i].name, index: i}); 
          app._data.architecture_hash = architecture_hash;
        }

        app._data.architecture_name = e;

        $("#architecture_menu").hide();
        $("#simulator").show();
        $("#assembly_btn_arch").show();
        $("#sim_btn_arch").show();
        $("#load_arch").hide();
        $("#load_menu_arch").hide();
        $("#view_components").show();

        app._data.alertMessaje = 'The selected architecture has been loaded correctly';
        app._data.type ='success';
        app._data.dismissCountDown = app._data.dismissSecs;

      });
    },

    /*Lectura del JSON de la arquitectura seleccionada*/
    read_arch(e){
      var file;
      var reader;
      var files = document.getElementById('arch_file').files;

      for (var i = 0; i < files.length; i++) {
        file = files[i];
        reader = new FileReader();
        reader.onloadend = onFileLoaded;
        reader.readAsBinaryString(file);
      }

      function onFileLoaded(event) {
        architecture = JSON.parse(event.currentTarget.result);

        app._data.architecture = architecture;

        /*PREGUNTAR*/
        architecture_hash = [];
        for (var i = 0; i < architecture.components.length; i++) {
          architecture_hash.push({name: architecture.components[i].name, index: i}); 
          app._data.architecture_hash = architecture_hash;
        }

        $("#architecture_menu").hide();
        $("#simulator").show();
        $("#assembly_btn_arch").show();
        $("#sim_btn_arch").show();
        $("#load_arch").hide();
        $("#load_menu_arch").hide();
        $("#view_components").show();
        
        app._data.alertMessaje = 'The selected architecture has been loaded correctly';
        app._data.type ='success';
        app._data.dismissCountDown = app._data.dismissSecs;
      }
    },

    /*Guarda la arquitectura actual en un JSON*/
    arch_save(){
      var textToWrite = JSON.stringify(architecture, null, 2);
      var textFileAsBlob = new Blob([textToWrite], { type: 'text/json' });
      var fileNameToSaveAs = this.name_arch_save + ".json";

      var downloadLink = document.createElement("a");
      downloadLink.download = fileNameToSaveAs;
      downloadLink.innerHTML = "My Hidden Link";

      window.URL = window.URL || window.webkitURL;

      downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
      downloadLink.onclick = destroyClickedElement;
      downloadLink.style.display = "none";
      document.body.appendChild(downloadLink);

      downloadLink.click();
      app._data.alertMessaje = 'Save architecture';
      app._data.type ='success';
      app._data.dismissCountDown = app._data.dismissSecs;
    },

    newComponent(){
      var newComp = {name: this.formArchitecture.name, type: this.formArchitecture.type, elements:[]};
      architecture.components.push(newComp);
      var newComponentHash = {name: this.formArchitecture.name, index: architecture_hash.length};
      architecture_hash.push(newComponentHash);
      this.formArchitecture.name='';
      this.formArchitecture.type='';
    },

    editComponent(comp){
      for (var i = 0; i < architecture_hash.length; i++) {
        if(comp == architecture_hash[i].name){
          architecture_hash[i].name = this.formArchitecture.name;
          architecture.components[i].name = this.formArchitecture.name;
          architecture.components[i].type = this.formArchitecture.type;
        }
      }
      this.formArchitecture.name='';
      this.formArchitecture.type='';
    },

    delCompModal(elem, button){
      this.modalDeletComp.title = "Delete " + elem;
      this.modalDeletComp.element = elem;
      this.$root.$emit('bv::show::modal', 'modalDeletComp', button);
    },

    delComponent(comp){
      for (var i = 0; i < architecture_hash.length; i++) {
        if(comp == architecture_hash[i].name){
          architecture.components.splice(i,1);
          architecture_hash.splice(i,1);
          for (var j = 0; j < architecture_hash.length; j++){
            architecture_hash[j].index = j;
          }
        }
      }
    },

    newElement(comp){
      for (var i = 0; i < architecture_hash.length; i++) {
        if(comp == architecture_hash[i].name && (i==0 || i==1 || i==2)){
          var newElement = {name:this.formArchitecture.name, nbits: "32", value: bigInt(parseInt(this.formArchitecture.defValue) >>> 0, 10).value, default_value:bigInt(parseInt(this.formArchitecture.defValue) >>> 0, 10).value, properties: this.formArchitecture.properties};
          architecture.components[i].elements.push(newElement);
          this.formArchitecture.name='';
          this.formArchitecture.defValue='';
          this.formArchitecture.properties=[];
          break;
        }
        if(comp == architecture[0][i].name && i==3 ){
          var newElement = {name:this.formArchitecture.name, nbits: "32", value: parseFloat(this.formArchitecture.defValue), default_value:parseFloat(this.formArchitecture.defValue), properties: this.formArchitecture.properties};
          architecture.components[i].elements.push(newElement);
          this.formArchitecture.name='';
          this.formArchitecture.defValue='';
          this.formArchitecture.properties=[];
          break;
        }
        if(comp == architecture[0][i].name && i==4){
          var newElement = {name:this.formArchitecture.name, nbits: "64", value: parseFloat(this.formArchitecture.defValue), default_value:parseFloat(this.formArchitecture.defValue), properties: this.formArchitecture.properties};
          architecture.components[i].elements.push(newElement);
          this.formArchitecture.name='';
          this.formArchitecture.defValue='';
          this.formArchitecture.properties=[];
          break;
        }
      }
    },
    
    editElemModal(elem, button){
      this.modalEditElement.title = "Edit " + elem;
      this.modalEditElement.element = elem;
      this.$root.$emit('bv::show::modal', 'modalEditElement', button);
    },

    editElement(comp){
      for (var i = 0; i < architecture_hash.length; i++) {
        for(var j=0; j < architecture.components[i].elements.length; j++){
          if(comp == architecture.components[i].elements[j].name){
            architecture.components[i].elements[j].name = this.formArchitecture.name;
            architecture.components[i].elements[j].default_value= bigInt(parseInt(this.formArchitecture.defValue) >>> 0, 10).value;
            architecture.components[i].elements[j].properties = this.formArchitecture.properties;
          }
        }
      }
      this.formArchitecture.name='';
      this.formArchitecture.defValue='';
      this.formArchitecture.properties=[];
    },

    delElemModal(elem, button){
      this.modalDeletElement.title = "Delete " + elem;
      this.modalDeletElement.element = elem;
      this.$root.$emit('bv::show::modal', 'modalDeletElement', button);
    },

    delElement(comp){
      console.log(comp);
      for (var i = 0; i < architecture_hash.length; i++) {
        for(var j=0; j < architecture.components[i].elements.length; j++){
          if(comp == architecture.components[i].elements[j].name){
            architecture.components[i].elements.splice(j,1);
          }
        }
      }
    },

    /*PAGINA DE CARGA DE INSTRUCCIONES*/
    /*Carga el listado de instrucciones disponibles*/
    load_instruction_set_available(){
      $.getJSON('instructions_set/default_instruction_set.json', function(cfg){
        instruction_set_available = cfg;
        app._data.ins_set_available = cfg;
      })
    },

    load_assDef_select(e){
      $.getJSON('instructions_set/'+e+'.json', function(cfg){
        instruction_set = cfg;

        app._data.instruction_set = instruction_set;

        /*PREGUNTAR*/
        instruction_set_hash = [];
        for (var i = 0; i < instruction_set.firmware.length; i++) {
          instruction_set_hash.push({name: instruction_set.firmware[i].name, index: i}); 
          app._data.instruction_set_hash = instruction_set_hash;
        }

        $(".btn_arch").show();
        $(".assDef_btn").show();

        app._data.alertMessaje = 'The selected instruction set has been loaded correctly';
        app._data.type ='success';
        app._data.dismissCountDown = app._data.dismissSecs;

      });
    },

    /*Lectura del JSON de las instrucciones seleccionadas*/
    read_assDef(e){
      var file;
      var reader;
      var files = document.getElementById('assDef_file').files;

      for (var i = 0; i < files.length; i++) {
        file = files[i];
        reader = new FileReader();
        reader.onloadend = onFileLoaded;
        reader.readAsBinaryString(file);
      }

      function onFileLoaded(event) {
        instruction_set = JSON.parse(event.currentTarget.result);

        app._data.instruction_set = instruction_set;

        instruction_set_hash = [];
        for (var i = 0; i < instruction_set.firmware.length; i++) {
          instruction_set_hash.push({name: instruction_set.firmware[i].name, index: i}); 
          app._data.instruction_set_hash = instruction_set_hash;
        }

        $(".btn_arch").show();
        $(".assDef_btn").show();

        app._data.alertMessaje = 'The selected instruction set has been loaded correctly';
        app._data.type ='success';
        app._data.dismissCountDown = app._data.dismissSecs;
      }
    },

    /*Guarda las instruccciones definidas en un JSON*/
    assDef_save(){
      var textToWrite = JSON.stringify(instruction_set, null, 2);
      var textFileAsBlob = new Blob([textToWrite], { type: 'text/json' });
      var fileNameToSaveAs = this.name_assDef_save + ".json";

      var downloadLink = document.createElement("a");
      downloadLink.download = fileNameToSaveAs;
      downloadLink.innerHTML = "My Hidden Link";

      window.URL = window.URL || window.webkitURL;

      downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
      downloadLink.onclick = destroyClickedElement;
      downloadLink.style.display = "none";
      document.body.appendChild(downloadLink);

      downloadLink.click();
      app._data.alertMessaje = 'Save instruction set';
      app._data.type ='success';
      app._data.dismissCountDown = app._data.dismissSecs;
    },

    /*Inserta una nueva instruccion*/
    newInstruction(){
      var newInstruction = {name: this.formInstruction.name, cop: this.formInstruction.cop, signatureRaw: this.formInstruction.signature, definition: this.formInstruction.definition};
      instruction_set.firmware.push(newInstruction);
      var newInstructionHash = {name: this.formInstruction.name, index: instruction_set_hash.length};
      instruction_set_hash.push(newInstructionHash);
      this.formInstruction.name='';
      this.formInstruction.cop='';
      this.formInstruction.signature='';
      this.formInstruction.definition='';
    },

    /*PAGINA ENSAMBLADOR*/
    /*Funciones de carga y descarga de ensamblador*/
    read_assembly(e){
      var file;
      var reader;
      var files = document.getElementById('assembly_file').files;

      for (var i = 0; i < files.length; i++) {
        file = files[i];
        reader = new FileReader();
        reader.onloadend = onFileLoaded;
        reader.readAsBinaryString(file);
      }

      function onFileLoaded(event) {
        code_assembly = event.currentTarget.result;
      }
    },

    assembly_update(){
      this.text_assembly = code_assembly;
    },

    assembly_save(){
      var textToWrite = this.text_assembly;
      var textFileAsBlob = new Blob([textToWrite], { type: 'text/plain' });
      var fileNameToSaveAs = this.save_assembly + ".txt";

      var downloadLink = document.createElement("a");
      downloadLink.download = fileNameToSaveAs;
      downloadLink.innerHTML = "My Hidden Link";

      window.URL = window.URL || window.webkitURL;

      downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
      downloadLink.onclick = destroyClickedElement;
      downloadLink.style.display = "none";
      document.body.appendChild(downloadLink);

      downloadLink.click();
    },


    /*PAGINA SIMULADOR*/
    /*Funciones de los popover*/
    popoverId(i){
      return 'popoverValueContent' + i;
    },

    /*Convierte de hexadecimal a float*/
    hex2float ( hexvalue ){
      var sign     = (hexvalue & 0x80000000) ? -1 : 1;
      var exponent = ((hexvalue >> 23) & 0xff) - 127;
      var mantissa = 1 + ((hexvalue & 0x7fffff) / 0x800000);

      var valuef = sign * mantissa * Math.pow(2, exponent);
      if (-127 == exponent)
        if (1 == mantissa)
          valuef = (sign == 1) ? "+0" : "-0" ;
        else valuef = sign * ((hexvalue & 0x7fffff) / 0x7fffff) * Math.pow(2, -126) ;
      if (128 == exponent)
        if (1 == mantissa)
          valuef = (sign == 1) ? "+Inf" : "-Inf" ;
        else valuef = "NaN" ;

      return valuef ;
    },

    hex2double ( hexvalue ){
      /*var sign     = (hexvalue & 0x8000000000000000) ? -1 : 1;
      var exponent = ((hexvalue >> 52) & 0x7ff) - 1023;
      var mantissa = 1 + ((hexvalue & 0xfffffffffffff) / 0x10000000000000);



      console.log(sign);
      console.log((hexvalue).toString(2));

      var valuef = sign * mantissa * Math.pow(2, exponent);
      if (-1023 == exponent)
        if (1 == mantissa)
          valuef = (sign == 1) ? "+0" : "-0" ;
        else valuef = sign * ((hexvalue & 0xfffffffffffff) / 0xfffffffffffff) * Math.pow(2, -1022) ;
      if (1024 == exponent)
        if (1 == mantissa)
          valuef = (sign == 1) ? "+Inf" : "-Inf" ;
        else valuef = "NaN" ;

      return valuef ;*/

      /*Cogido de github https://github.com/bartaz/ieee754-visualization licencia MIT teoria libre*/

      var value = hexvalue.split('x');
      var value_bit = '';

      for (var i = 0; i < value[1].length; i++) {
      	var aux = value[1].charAt(i);
      	aux = (parseInt(aux, 16)).toString(2).padStart(4, "0");
      	value_bit = value_bit + aux;
      }

	  	var buffer = new ArrayBuffer(8);
		  new Uint8Array( buffer ).set( value_bit.match(/.{8}/g).map( binaryStringToInt ) );
		  return new DataView( buffer ).getFloat64(0, false);


    },

    /*Convierte de hexadecimal a char*/
    hex2char8 ( hexvalue ){

    	var num_char = ((hexvalue.toString().length)-2)/2;
    	var exponent = 0;
    	var pos = 0;

      var valuec = new Array();

      for (var i = 0; i < num_char; i++) {
      	var dec_mask = (15 * Math.pow(16,exponent)) + (15 * Math.pow(16,exponent+1));
      	exponent = exponent + 2;
      	valuec[i] = String.fromCharCode((hexvalue & dec_mask) >> pos);
      	pos = pos + 8;
      }

      var characters = '';

      for (var i = valuec.length - 1; i >= 0; i--) {
        characters = characters + valuec[i] + ' ';
      }

      return  characters;
    },

    float2bin (number){
	    var i, result = "";
	    var dv = new DataView(new ArrayBuffer(4));

	    dv.setFloat32(0, number, false);

	    for (i = 0; i < 4; i++) {
	        var bits = dv.getUint8(i).toString(2);
	        if (bits.length < 8) {
	            bits = new Array(8 - bits.length).fill('0').join("") + bits;
	        }
	        result += bits;
	    }
	    return result;
    },

    double2bin(number) {
	    var i, result = "";
	    var dv = new DataView(new ArrayBuffer(8));

	    dv.setFloat64(0, number, false);

	    for (i = 0; i < 8; i++) {
	        var bits = dv.getUint8(i).toString(2);
	        if (bits.length < 8) {
	            bits = new Array(8 - bits.length).fill('0').join("") + bits;
	        }
	        result += bits;
	    }
	    return result;
		},

    bin2hex(s) {
	    var i, k, part, accum, ret = '';
	    for (i = s.length-1; i >= 3; i -= 4) {

	      part = s.substr(i+1-4, 4);
	      accum = 0;
	      for (k = 0; k < 4; k += 1) {
          if (part[k] !== '0' && part[k] !== '1') {     
              return { valid: false };
          }
          accum = accum * 2 + parseInt(part[k], 10);
	      }
	      if (accum >= 10) {
          ret = String.fromCharCode(accum - 10 + 'A'.charCodeAt(0)) + ret;
	      } else {
          ret = String(accum) + ret;
	      }
	    }

	    if (i >= 0) {
        accum = 0;
        for (k = 0; k <= i; k += 1) {
          if (s[k] !== '0' && s[k] !== '1') {
              return { valid: false };
          }
          accum = accum * 2 + parseInt(s[k], 10);
        }
        ret = String(accum) + ret;
	    }
	    return ret;
		},

    /*FUNCIONES DE GESTION DE REGISTROS*/
    /*Funciones de actualizacion de los valores de los registros de control enteros*/
    updateIntcontr(j){
      for (var i = 0; i < architecture.components[0].elements.length; i++) {
        if(architecture.components[0].elements[i].name == j && this.newValue.match(/^0x/)){
          var value = this.newValue.split("x");
          architecture.components[0].elements[i].value = bigInt(value[1], 16);
        }
        else if(architecture.components[0].elements[i].name == j && this.newValue.match(/^(\d)+/)){
          architecture.components[0].elements[i].value = bigInt(parseInt(this.newValue) >>> 0, 10);
        }
        else if(architecture.components[0].elements[i].name == j && this.newValue.match(/^-/)){
          architecture.components[0].elements[i].value = bigInt(parseInt(this.newValue) >>> 0, 10);
        }
      }
      this.newValue = '';
    },

    updateIntReg(j){
      for (var i = 0; i < architecture.components[1].elements.length; i++) {
        if(architecture.components[1].elements[i].name == j && this.newValue.match(/^0x/)){
          var value = this.newValue.split("x");
          architecture.components[1].elements[i].value = bigInt(value[1], 16);
        }
        else if(architecture.components[1].elements[i].name == j && this.newValue.match(/^(\d)+/)){
          architecture.components[1].elements[i].value = bigInt(parseInt(this.newValue) >>> 0, 10);
        }
        else if(architecture.components[1].elements[i].name == j && this.newValue.match(/^-/)){
          architecture.components[1].elements[i].value = bigInt(parseInt(this.newValue) >>> 0, 10);
        }
      }
      this.newValue = '';
    },

    updateRegFpContr(j){
      for (var i = 0; i < architecture.components[2].elements.length; i++) {
        if(architecture.components[2].elements[i].name == j && this.newValue.match(/^0x/)){
          var value = this.newValue.split("x");
          architecture.components[2].elements[i].value = bigInt(value[1], 16);
        }
        else if(architecture.components[2].elements[i].name == j && this.newValue.match(/^(\d)+/)){
          architecture.components[2].elements[i].value = bigInt(parseInt(this.newValue) >>> 0, 10);
        }
        else if(architecture.components[2].elements[i].name == j && this.newValue.match(/^-/)){
          architecture.components[2].elements[i].value = bigInt(parseInt(this.newValue) >>> 0, 10);
        }
      }
      this.newValue = '';
    },

    /*Revisar cuando es hexadecimal ya que no lo hace bien por la funcion que pasa a binario*/
    updateRegFpSingle(j){
      for (var i = 0; i < architecture.components[3].elements.length; i++) {
        if(architecture.components[3].elements[i].name == j && this.newValue.match(/^0x/)){
          architecture.components[3].elements[i].value = this.hex2float(this.newValue);
        }
        else if(architecture.components[3].elements[i].name == j && this.newValue.match(/^(\d)+/)){
          architecture.components[3].elements[i].value = parseFloat(this.newValue, 10);
        }
        else if(architecture.components[3].elements[i].name == j && this.newValue.match(/^-/)){
        	architecture.components[3].elements[i].value = parseFloat(this.newValue, 10);
        }
      }
      this.newValue = '';
    },
    /*Revisar cuando es hexadecimal ya que coge el float*/
    updateRegFpDouble(j){
      for (var i = 0; i < architecture.components[4].elements.length; i++) {
        if(architecture.components[4].elements[i].name == j && this.newValue.match(/^0x/)){
          architecture.components[4].elements[i].value = this.hex2double(this.newValue);
        }
        else if(architecture.components[4].elements[i].name == j && this.newValue.match(/^(\d)+/)){
          architecture.components[4].elements[i].value = parseFloat(this.newValue, 10);
        }
        else if(architecture.components[4].elements[i].name == j && this.newValue.match(/^-/)){
        	architecture.components[4].elements[i].value = parseFloat(this.newValue, 10);
        }
      }
      this.newValue = '';
    },


    /*FUNCIONES DE EJECUCION*/
    /*Funcion que ejecuta instruccion a instruccion*/
    executeInstruction(){
      var error = 0;
      var index;

      var instruction = instructions[executionIndex].Pseudo;

      var instructionParts = instruction.split(' ');
      var instructionObjet = [];


      /*PREGUNTAR ESTO VA EN COMPILACION*/
      /*Busca errores en la instruccion a ejecutar*/
      for (i = 0; i < instruction_set_hash.length; i++) {
        if(instruction_set_hash[i].name == instructionParts[0]){
          index = i;
          break;
        }
        if((instruction_set_hash[i].name != instructionParts[0]) && (i == instruction_set_hash.length-1)){
          error = 1;
        }
      }

      /*Busca erroes en los registros que se usan*/
      for (i = 1; i < instructionParts.length; i++){
        var valReg = 0;
        for (j = 0; j < architecture.components.length && valReg == 0; j++) {
          for (z = 0; z < architecture.components[j].elements.length; z++){
            if(instructionParts[i] == architecture.components[j].elements[z].name){
              instructionObjet.push({name: instructionParts[i], value: architecture.components[j].elements[z].value})
              valReg = 1;
              break;
            }
            if((j == architecture.components.length-1) && (z == architecture.components[j].elements.length-1) && (instructionParts[i] != architecture.components[j].elements[z].name)){
              error = 1;
            }
          }
        }
      }

      if(error == 0){
        var signatureParts = (instruction_set.firmware[index].signatureRaw).split(' ');

        for (i = 1; i < signatureParts.length; i++){
          eval(signatureParts[i] + " = " + instructionObjet[i-1].value);
        }

        eval(instruction_set.firmware[index].definition);

        var defParts = (instruction_set.firmware[index].definition).split('=');
        var resultIndex;
        for (i = 0; i < signatureParts.length; i++) {
          if(signatureParts[i] == defParts[0]){
            resultIndex = i;
          }
        }

        var valReg = 0;
        for (j = 0; j < architecture.components.length && valReg == 0; j++) {
          for (z = 0; z < architecture.components[j].elements.length; z++){
            if(instructionParts[resultIndex] == architecture.components[j].elements[z].name){
              eval("architecture.components[j].elements[z].value = bigInt(parseInt("+defParts[0]+") >>> 0, 10).value");
              valReg = 1;
              break;
            }
          }
        }

        executionIndex++;
        if(executionIndex >= instructions.length){
          executionIndex = 0;
          app._data.alertMessaje = 'The execution of the program has finished';
          app._data.type ='success';
          app._data.dismissCountDown = app._data.dismissSecs;
        }
      }
      else{
        executionIndex = 0;
        app._data.alertMessaje = 'Invalid instruction';
        app._data.type ='danger';
        app._data.dismissCountDown = app._data.dismissSecs;
      }
    },

    /*Funcion que ejecuta todo el programa*/
    executeProgram(){
      console.log("executeProgram");
    },

    /*Funcion que resetea la ejecucion*/
    reset(){
      executionIndex = 0;
      for (var i = 0; i < architecture.components[0].elements.length; i++) {
         architecture.components[0].elements[i].value =  architecture.components[0].elements[i].default_value;
      }
      for (var i = 0; i < architecture.components[1].elements.length; i++) {
        architecture.components[1].elements[i].value = architecture.components[1].elements[i].default_value;
      }
      for (var i = 0; i < architecture.components[2].elements.length; i++) {
        architecture.components[2].elements[i].value = architecture.components[2].elements[i].default_value;
      }
      for (var i = 0; i < architecture.components[3].elements.length; i++) {
        architecture.components[3].elements[i].value = architecture.components[3].elements[i].default_value;
      }
      for (var i = 0; i < architecture.components[4].elements.length; i++) {
        architecture.components[4].elements[i].value = architecture.components[4].elements[i].default_value;
      }
    },
  },
  created(){
    this.load_arch_available();
    this.load_instruction_set_available();
  }
})
